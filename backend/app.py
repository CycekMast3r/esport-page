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
import pytz 

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
print(f"DEBUG: Odczytana DATABASE_URL: {DATABASE_URL}")

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)
if not all([cloudinary.config().cloud_name, cloudinary.config().api_key, cloudinary.config().api_secret]):
    print("[❌] BŁĄD: Zmienne środowiskowe Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) nie są ustawione.")
else:
    print("[✅] Cloudinary skonfigurowano pomyślnie.")

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

def create_table_if_not_exists():
    if not DATABASE_URL:
        print("[⚠️] OSTRZEŻENIE: Zmienna środowiskowa 'DATABASE_URL' nie jest ustawiona. Nie można utworzyć tabel.")
        return

    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("[❌] Nie można utworzyć tabeli, brak połączenia z bazą danych po błędzie.")
            return

        cur = conn.cursor()
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
        # Zmieniamy nazwy kolumn w definicji tabeli 'matches'
        cur.execute(sql.SQL("""
            CREATE TABLE IF NOT EXISTS matches (
                id UUID PRIMARY KEY,
                team1_id UUID NOT NULL REFERENCES teams(id), -- Zmieniono z team_a_id na team1_id
                team2_id UUID NOT NULL REFERENCES teams(id), -- Zmieniono z team_b_id na team2_id
                match_date TIMESTAMP WITH TIME ZONE NOT NULL,
                round VARCHAR(255) NOT NULL,
                score VARCHAR(10) DEFAULT 'VS'
            );
        """))
        conn.commit()
        cur.close()
        print("[✅] Tabele 'teams' i 'matches' sprawdzona/utworzona pomyślnie.")
    except Exception as e:
        print(f"[❌] Błąd podczas tworzenia tabel: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if DATABASE_URL:
    create_table_if_not_exists()
else:
    print("[⚠️] DATABASE_URL nie jest ustawione. Nie można zainicjować bazy danych przy starcie.")


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
                "id": str(row[0]),
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


# --- ZMIANA: Endpoint API do pobierania 3 najbliższych meczów z bazy danych ---
# --- ZMIANA: Endpoint API do pobierania 3 najbliższych meczów z bazy danych ---

    
# --- NOWY: Endpoint API do pobierania pełnego harmonogramu z bazy danych ---

    
# --- NOWY: Endpoint administracyjny do generowania i zapisywania harmonogramu ---


    except Exception as e:
        print(f"[❌] Błąd podczas generowania i zapisywania harmonogramu: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas generowania i zapisywania harmonogramu."}), 500
    except Exception as e:
        print(f"[❌] Błąd podczas generowania i zapisywania harmonogramu: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas generowania i zapisywania harmonogramu."}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)