import uuid
import json
import os
import re
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, date
import psycopg2
from psycopg2 import sql
import cloudinary
import cloudinary.uploader
from functools import wraps # Dodajemy import wraps do dekoratora uwierzytelniania

app = Flask(__name__)
CORS(app)

# Ustawienie URL bazy danych.
DATABASE_URL = os.environ.get('DATABASE_URL')
print(f"DEBUG: Odczytana DATABASE_URL: {DATABASE_URL}")

# Konfiguracja Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)
if not all([cloudinary.config().cloud_name, cloudinary.config().api_key, cloudinary.config().api_secret]):
    print("[❌] BŁĄD: Zmienne środowiskowe Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) nie są ustawione.")
else:
    print("[✅] Cloudinary skonfigurowano pomyślnie.")

# UPLOAD_FOLDER już nie będzie używane do przechowywania plików, ale zostawiamy na wypadek innych zastosowań
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


ALLOWED_EXTENSIONS = {".png"}
MAX_FILE_SIZE_MB = 2
MAX_TEAMS = 16
MINUTES_BETWEEN_SUBMISSIONS = 2
last_submission_time = {}

BANNED_EMAIL_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillail.com",
    "yopmail.com", "trashmail.com", "dispostable.com"
}

def validate_email(email):
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email)

def calculate_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except ValueError:
        return -1

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("[✅] Połączono z bazą danych.")
        return conn
    except Exception as e:
        print(f"[❌] Błąd połączenia z bazą danych: {str(e)}")
        traceback.print_exc()
        return None

# --- FUNKCJA TWORZĄCA TABELĘ (rozszerzona o tabelę matches) ---
def create_table_if_not_exists():
    if not DATABASE_URL:
        print("[⚠️] OSTRZEŻENIE: Zmienna środowiskowa 'DATABASE_URL' nie jest ustawiona. Nie można utworzyć tabel.")
        return

    conn = None # Inicjalizacja poza try, aby była dostępna w finally
    try:
        conn = get_db_connection()
        if not conn:
            print("[❌] Nie można utworzyć tabel, brak połączenia z bazą danych.")
            return

        cur = conn.cursor()

        # Tabela 'teams'
        cur.execute(sql.SQL("""
            CREATE TABLE IF NOT EXISTS teams (
                id UUID PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                logo VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                date_of_birth DATE NOT NULL,
                players JSONB NOT NULL
            );
        """))
        print("[✅] Tabela 'teams' sprawdzona/utworzona pomyślnie.")

        # ZMIANA: Dodajemy tabelę 'matches'
        cur.execute(sql.SQL("""
            CREATE TABLE IF NOT EXISTS matches (
                id UUID PRIMARY KEY,
                team1_id UUID NOT NULL REFERENCES teams(id),
                team2_id UUID NOT NULL REFERENCES teams(id),
                score_team1 INTEGER,
                score_team2 INTEGER,
                match_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Używamy TIMESTAMP WITH TIME ZONE dla lepszej obsługi czasu
                stage VARCHAR(255) NOT NULL,
                is_played BOOLEAN DEFAULT FALSE,
                winner_team_id UUID REFERENCES teams(id),
                loser_team_id UUID REFERENCES teams(id),
                match_details JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        # Dodaj indeksy dla szybszych zapytań na 'matches'
        cur.execute(sql.SQL("CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches (match_date);"))
        cur.execute(sql.SQL("CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches (stage);"))
        print("[✅] Tabela 'matches' sprawdzona/utworzona pomyślnie.")

        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[❌] Błąd podczas tworzenia tabel: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback() # Wycofaj zmiany, jeśli wystąpi błąd
    finally:
        if conn:
            conn.close()


# WAŻNA ZMIANA: Wywołanie funkcji tworzącej tabelę przy starcie aplikacji
if DATABASE_URL:
    create_table_if_not_exists()
else:
    print("[⚠️] DATABASE_URL nie jest ustawione. Nie można zainicjować bazy danych przy starcie.")


# --- Endpointy publiczne (Teams, Register) ---

@app.route("/api/teams", methods=["GET"])
def get_teams():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych. Nie można pobrać drużyn."}), 500

        cur = conn.cursor()
        cur.execute("SELECT id, name, logo, email, date_of_birth, players FROM teams ORDER BY name")
        teams_from_db = []
        for row in cur.fetchall():
            team = {
                "id": str(row[0]), # Konwertuj UUID na string
                "name": row[1],
                "logo": row[2],
                "email": row[3],
                "dateOfBirth": row[4].isoformat() if isinstance(row[4], date) else str(row[4]),
                "players": row[5]
            }
            teams_from_db.append(team)
        cur.close()
        conn.close()
        return jsonify(teams_from_db), 200
    except Exception as e:
        print(f"[❌] Błąd pobierania drużyn: {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Błąd serwera podczas pobierania drużyn."}), 500


@app.route("/api/register", methods=["POST"])
def register():
    try:
        client_ip = request.remote_addr
        now = datetime.now()

        if (last := last_submission_time.get(client_ip)) and (now - last) < timedelta(minutes=MINUTES_BETWEEN_SUBMISSIONS):
            return jsonify({"status": "error", "message": f"Odczekaj {MINUTES_BETWEEN_SUBMISSIONS} minut(y) przed kolejnym zgłoszeniem."}), 429

        team_name = request.form.get("teamName", "").strip()
        captain_email = request.form.get("captainEmail", "").strip().lower()
        captain_dob = request.form.get("dateOfBirth", "").strip()
        player1 = request.form.get("player1", "").strip()
        player2 = request.form.get("player2", "").strip()
        player3 = request.form.get("player3", "").strip()
        logo_file = request.files.get("logo")

        if not all([team_name, captain_email, captain_dob, player1, player2, player3, logo_file]):
            return jsonify({"status": "error", "message": "Brakuje wymaganych danych."}), 400

        if len(team_name) > 24:
            return jsonify({"status": "error", "message": "Nazwa drużyny może mieć maks. 24 znaki."}), 400

        for nick in [player1, player2, player3]:
            if len(nick) > 16:
                return jsonify({"status": "error", "message": "Nick gracza może mieć maks. 16 znaków."}), 400

        if not re.match(r"[^@]+@[^@]+\.\w+$", captain_email):
            return jsonify({"status": "error", "message": "Nieprawidłowy email."}), 400

        if any(captain_email.endswith(f"@{domain}") for domain in BANNED_EMAIL_DOMAINS):
            return jsonify({"status": "error", "message": "Użyto tymczasowego adresu e-mail. Wprowadź prawdziwy adres."}), 400

        birth_date_obj = datetime.strptime(captain_dob, "%Y-%m-%d").date()
        age = (now.date() - birth_date_obj).days // 365
        if age < 16:
            return jsonify({"status": "error", "message": "Kapitan musi mieć co najmniej 16 lat."}), 400

        ext = os.path.splitext(logo_file.filename)[-1].lower()
        if ext != ".png" or logo_file.mimetype != "image/png":
            return jsonify({"status": "error", "message": "Logo musi być plikiem PNG."}), 400

        logo_file.seek(0, os.SEEK_END)
        if logo_file.tell() > MAX_FILE_SIZE_MB * 1024 * 1024:
            return jsonify({"status": "error", "message": f"Logo nie może przekraczać {MAX_FILE_SIZE_MB} MB."}), 400
        logo_file.seek(0)

        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych. Nie można zarejestrować drużyny."}), 500

        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM teams")
        current_teams_count = cur.fetchone()[0]
        if current_teams_count >= MAX_TEAMS:
            cur.close()
            conn.close()
            return jsonify({"status": "error", "message": "Limit 16 drużyn został osiągnięty."}), 403

        cur.execute("SELECT id FROM teams WHERE LOWER(name) = LOWER(%s)", (team_name,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"status": "error", "message": "Taka nazwa drużyny już istnieje."}), 409

        cur.execute("SELECT id FROM teams WHERE LOWER(email) = LOWER(%s)", (captain_email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"status": "error", "message": "Ten email już został użyty do rejestracji."}), 409

        try:
            upload_result = cloudinary.uploader.upload(
                logo_file,
                folder="esport_logos",
                resource_type="image"
            )
            logo_url = upload_result['secure_url']
            print(f"[✅] Logo przesłane do Cloudinary: {logo_url}")
        except Exception as upload_error:
            print(f"[❌] Błąd przesyłania logo do Cloudinary: {str(upload_error)}")
            traceback.print_exc()
            cur.close()
            conn.close()
            return jsonify({"status": "error", "message": "Błąd podczas przesyłania logo."}), 500

        team_id = str(uuid.uuid4())

        players_data = [
            {"name": player1, "G": 0, "A": 0, "S": 0, "MVP": 0},
            {"name": player2, "G": 0, "A": 0, "S": 0, "MVP": 0},
            {"name": player3, "G": 0, "A": 0, "S": 0, "MVP": 0}
        ]
        players_jsonb = json.dumps(players_data, ensure_ascii=False)

        cur.execute(
            """
            INSERT INTO teams (id, name, logo, email, date_of_birth, players)
            VALUES (%s, %s, %s, %s, %s, %s::jsonb)
            """,
            (team_id, team_name, logo_url, captain_email, birth_date_obj, players_jsonb)
        )
        conn.commit()
        cur.close()
        conn.close()

        last_submission_time[client_ip] = now
        print(f"[✅] Zarejestrowano drużynę: {team_name}")
        return jsonify({"status": "ok", "message": "Zgłoszenie przyjęte!"})

    except Exception as e:
        print("[❌] Błąd:", str(e))
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Błąd serwera."}), 500


# --- ZMIANA: Endpointy dla zarządzania meczami (Admin Panel) ---

# --- BARDZO PROSTE UWIERZYTELNIENIE (TYLKO DLA TESTÓW LOKALNYCH/DEWELOPERSKICH) ---
# W PRODUKCJI WYMAGANE BĘDZIE PRAWDZIWE UWIERZYTELNIANIE
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'supersecretadminpassword') # Ustaw to w zmiennych środowiskowych Render!

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Sprawdzamy token w nagłówku 'X-Admin-Token'
        admin_token_header = request.headers.get('X-Admin-Token')
        if not admin_token_header or admin_token_header != ADMIN_TOKEN:
            return jsonify({"status": "error", "message": "Unauthorized. Admin token required."}), 401
        return f(*args, **kwargs)
    return decorated_function

# Endpoint do pobierania wszystkich meczów (Dla Admina - może pobierać wszystko)
@app.route("/api/admin/matches", methods=["GET"])
@admin_required
def admin_get_matches():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        # Złączenie z tabelą drużyn, aby uzyskać nazwy i logo
        query = sql.SQL("""
            SELECT
                m.id,
                m.team1_id,
                t1.name AS team1_name,
                t1.logo AS team1_logo,
                m.score_team1,
                m.team2_id,
                t2.name AS team2_name,
                t2.logo AS team2_logo,
                m.score_team2,
                m.match_date,
                m.stage,
                m.is_played,
                m.winner_team_id,
                t_winner.name AS winner_team_name,
                m.loser_team_id,
                t_loser.name AS loser_team_name,
                m.match_details
            FROM matches m
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            LEFT JOIN teams t_winner ON m.winner_team_id = t_winner.id
            LEFT JOIN teams t_loser ON m.loser_team_id = t_loser.id
            ORDER BY m.match_date ASC;
        """)
        cur.execute(query)
        matches_data = []
        for row in cur.fetchall():
            match = {
                "id": str(row[0]),
                "team1Id": str(row[1]),
                "team1Name": row[2],
                "team1Logo": row[3],
                "score1": row[4],
                "team2Id": str(row[5]),
                "team2Name": row[6],
                "team2Logo": row[7],
                "score2": row[8],
                "matchDate": row[9].isoformat(), # Formatuj datę do ISO
                "stage": row[10],
                "isPlayed": row[11],
                "winnerTeamId": str(row[12]) if row[12] else None,
                "winnerTeamName": row[13],
                "loserTeamId": str(row[14]) if row[14] else None,
                "loserTeamName": row[15],
                "matchDetails": row[16] # JSONB jest już obiektem/listą Pythona
            }
            matches_data.append(match)
        cur.close()
        conn.close()
        return jsonify(matches_data), 200
    except Exception as e:
        print(f"[❌] Błąd pobierania meczów (admin): {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Błąd serwera podczas pobierania meczów."}), 500

# Endpoint do dodawania meczu
@app.route("/api/admin/matches", methods=["POST"])
@admin_required
def admin_add_match():
    data = request.json
    team1_id = data.get("team1Id")
    team2_id = data.get("team2Id")
    match_date_str = data.get("matchDate") # Oczekujemy formatu ISO
    stage = data.get("stage")

    if not all([team1_id, team2_id, match_date_str, stage]):
        return jsonify({"status": "error", "message": "Brakuje wymaganych danych meczu (team1Id, team2Id, matchDate, stage)."}), 400

    conn = None
    try:
        match_date = datetime.fromisoformat(match_date_str.replace('Z', '+00:00')) # Obsługa formatu ISO, konwersja do UTC
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        match_id = str(uuid.uuid4())
        cur.execute(
            """
            INSERT INTO matches (id, team1_id, team2_id, match_date, stage)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (match_id, uuid.UUID(team1_id), uuid.UUID(team2_id), match_date, stage) # Konwersja stringów ID na UUID
        )
        conn.commit()
        cur.close()
        return jsonify({"status": "ok", "message": "Mecz dodany pomyślnie!", "matchId": match_id}), 201
    except ValueError:
        return jsonify({"status": "error", "message": "Nieprawidłowy format daty lub ID drużyny."}), 400
    except Exception as e:
        print(f"[❌] Błąd dodawania meczu (admin): {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas dodawania meczu."}), 500
    finally:
        if conn:
            conn.close()

# Endpoint do aktualizacji meczu (do edycji wyników, statusu)
@app.route("/api/admin/matches/<uuid:match_id>", methods=["PUT"])
@admin_required
def admin_update_match(match_id):
    data = request.json

    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        update_fields = []
        update_values = []

        if "score1" in data:
            update_fields.append("score_team1 = %s")
            update_values.append(data["score1"])
        if "score2" in data:
            update_fields.append("score_team2 = %s")
            update_values.append(data["score2"])
        if "matchDate" in data:
            update_fields.append("match_date = %s")
            update_values.append(datetime.fromisoformat(data["matchDate"].replace('Z', '+00:00')))
        if "stage" in data:
            update_fields.append("stage = %s")
            update_values.append(data["stage"])

        # Automatyczne ustawianie winner_team_id i loser_team_id
        is_played_val = data.get("isPlayed")
        if is_played_val is not None:
            update_fields.append("is_played = %s")
            update_values.append(is_played_val)
            if is_played_val: # Jeśli mecz został rozegrany
                score1 = data.get("score1")
                score2 = data.get("score2")
                team1_id = data.get("team1Id") # Potrzebujemy ID drużyn do ustawienia zwycięzcy/przegranego
                team2_id = data.get("team2Id")

                if score1 is not None and score2 is not None and team1_id and team2_id:
                    winner_id = None
                    loser_id = None
                    if score1 > score2:
                        winner_id = uuid.UUID(team1_id)
                        loser_id = uuid.UUID(team2_id)
                    elif score2 > score1:
                        winner_id = uuid.UUID(team2_id)
                        loser_id = uuid.UUID(team1_id)
                    # Jeśli remis, winner/loser pozostają NULL

                    update_fields.append("winner_team_id = %s")
                    update_values.append(winner_id)
                    update_fields.append("loser_team_id = %s")
                    update_values.append(loser_id)

        if "matchDetails" in data:
            update_fields.append("match_details = %s::jsonb")
            update_values.append(json.dumps(data["matchDetails"], ensure_ascii=False))

        update_fields.append("updated_at = NOW()")

        if not update_fields:
            return jsonify({"status": "error", "message": "Brak danych do aktualizacji."}), 400

        query = sql.SQL("UPDATE matches SET {} WHERE id = %s").format(
            sql.SQL(", ").join(map(sql.SQL, update_fields))
        )
        update_values.append(str(match_id))

        cur.execute(query, update_values)
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({"status": "error", "message": "Mecz o podanym ID nie znaleziony."}), 404

        cur.close()
        return jsonify({"status": "ok", "message": "Mecz zaktualizowany pomyślnie!"}), 200
    except ValueError:
        return jsonify({"status": "error", "message": "Nieprawidłowy format daty, ID drużyny lub danych JSONB."}), 400
    except Exception as e:
        print(f"[❌] Błąd aktualizacji meczu {match_id} (admin): {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas aktualizacji meczu."}), 500
    finally:
        if conn:
            conn.close()

# Endpoint do usuwania meczu
@app.route("/api/admin/matches/<uuid:match_id>", methods=["DELETE"])
@admin_required
def admin_delete_match(match_id):
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        cur.execute("DELETE FROM matches WHERE id = %s", (str(match_id),))
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({"status": "error", "message": "Mecz o podanym ID nie znaleziony."}), 404

        cur.close()
        return jsonify({"status": "ok", "message": "Mecz usunięty pomyślnie!"}), 200
    except Exception as e:
        print(f"[❌] Błąd usuwania meczu {match_id} (admin): {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas usuwania meczu."}), 500
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)