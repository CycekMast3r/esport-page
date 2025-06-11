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
        # DODAJEMY TWORZENIE TABELI 'matches'
        cur.execute(sql.SQL("""
            CREATE TABLE IF NOT EXISTS matches (
                id UUID PRIMARY KEY,
                team_a_id UUID NOT NULL REFERENCES teams(id),
                team_b_id UUID NOT NULL REFERENCES teams(id),
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
@app.route("/api/schedule/teaser", methods=["GET"])
def get_schedule_teaser_matches():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        cur.execute("""
            SELECT 
                m.id, 
                ta.id AS team_a_id, ta.name AS team_a_name, ta.logo AS team_a_logo,
                tb.id AS team_b_id, tb.name AS team_b_name, tb.logo AS team_b_logo,
                m.match_date, 
                m.round, 
                m.score
            FROM matches m
            JOIN teams ta ON m.team_a_id = ta.id
            JOIN teams tb ON m.team_b_id = tb.id
            WHERE m.match_date > NOW() AT TIME ZONE 'UTC' -- Tylko przyszłe mecze, w UTC
            ORDER BY m.match_date ASC
            LIMIT 3
        """)
        
        upcoming_matches_teaser = []
        for row in cur.fetchall():
            match = {
                "id": str(row[0]),
                "teamA": {"id": str(row[1]), "name": row[2], "logo": row[3]},
                "teamB": {"id": str(row[4]), "name": row[5], "logo": row[6]},
                "matchDate": row[7].isoformat(), # match_date już jest obiektem datetime z info o strefie
                "round": row[8],
                "score": row[9]
            }
            upcoming_matches_teaser.append(match)

        cur.close()
        conn.close()
        return jsonify(upcoming_matches_teaser), 200
    except Exception as e:
        print(f"[❌] Błąd pobierania meczów teasera z bazy danych: {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Błąd serwera podczas pobierania meczów teasera."}), 500

# --- NOWY: Endpoint API do pobierania pełnego harmonogramu z bazy danych ---
@app.route("/api/schedule/full", methods=["GET"])
def get_full_schedule():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500

        cur = conn.cursor()
        cur.execute("""
            SELECT 
                m.id, 
                ta.id AS team_a_id, ta.name AS team_a_name, ta.logo AS team_a_logo,
                tb.id AS team_b_id, tb.name AS team_b_name, tb.logo AS team_b_logo,
                m.match_date, 
                m.round, 
                m.score
            FROM matches m
            JOIN teams ta ON m.team_a_id = ta.id
            JOIN teams tb ON m.team_b_id = tb.id
            ORDER BY m.match_date ASC
        """)
        
        full_schedule = []
        for row in cur.fetchall():
            match = {
                "id": str(row[0]),
                "teamA": {"id": str(row[1]), "name": row[2], "logo": row[3]},
                "teamB": {"id": str(row[4]), "name": row[5], "logo": row[6]},
                "matchDate": row[7].isoformat(),
                "round": row[8],
                "score": row[9]
            }
            full_schedule.append(match)

        cur.close()
        conn.close()
        return jsonify(full_schedule), 200
    except Exception as e:
        print(f"[❌] Błąd pobierania pełnego harmonogramu z bazy danych: {str(e)}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Błąd serwera podczas pobierania pełnego harmonogramu."}), 500

# --- NOWY: Endpoint administracyjny do generowania i zapisywania harmonogramu ---
@app.route("/api/generate_and_save_schedule", methods=["POST"])
def generate_and_save_schedule():
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd połączenia z bazą danych."}), 500
        cur = conn.cursor()

        # 1. Pobierz wszystkie drużyny z bazy danych
        cur.execute("SELECT id, name, logo FROM teams ORDER BY name")
        teams_data = cur.fetchall()

        if len(teams_data) < 16: # Wymagamy 16 drużyn do pełnej fazy grupowej
            return jsonify({"status": "error", "message": "Za mało zarejestrowanych drużyn do wygenerowania pełnego harmonogramu. Potrzeba dokładnie 16 drużyn."}), 400
        
        if len(teams_data) > 16:
            # Ograniczamy do pierwszych 16 drużyn jeśli jest ich więcej, żeby pasowały do struktury grup
            teams = [{"id": str(t[0]), "name": t[1], "logo": t[2]} for t in teams_data[:16]]
        else:
            teams = [{"id": str(t[0]), "name": t[1], "logo": t[2]} for t in teams_data]


        # Wyczyść istniejące mecze, aby nie duplikować
        cur.execute("DELETE FROM matches")
        conn.commit()

        all_matches_to_insert = []
        
        # Używamy pytz do obsługi stref czasowych, np. Central European Summer Time (CEST)
        warsaw_tz = pytz.timezone('Europe/Warsaw')
        
        # Ustawienie początkowej daty i godziny (14 czerwca 2025, 18:00 CEST)
        # UWAGA: to jest stała data, jeśli chcesz dynamicznie od aktualnego czasu, zmień.
        start_date_local = datetime(2025, 6, 14, 18, 0, 0)
        start_date_aware = warsaw_tz.localize(start_date_local)
        
        current_match_time = start_date_aware.astimezone(pytz.utc) # Zawsze przechowujemy w UTC

        group_labels = ["A", "B", "C", "D"]
        groups = []
        for idx in range(len(group_labels)):
            group = teams[idx * 4 : (idx + 1) * 4]
            groups.append(group) # Zakładamy, że każda grupa ma 4 drużyny

        match_pairs = [
            [[0, 1], [2, 3]], # Kolejka 1
            [[0, 2], [1, 3]], # Kolejka 2
            [[0, 3], [1, 2]]  # Kolejka 3
        ]

        match_day = 0 # Dzień od startu turnieju
        match_in_day_index = 0 # Indeks meczu w danym dniu (0-7)
        match_hour_offsets = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] # Odstępy co 30 min (np. 18:00, 18:30, 19:00...)
        
        # === Generowanie fazy grupowej ===
        # Iterujemy przez 3 kolejki
        for round_idx in range(3):
            # Mecze w każdej grupie dla danej kolejki
            matches_for_this_round_all_groups = []
            for g_idx, group in enumerate(groups):
                label = group_labels[g_idx]
                pair_set = match_pairs[round_idx] # Bierzemy pary dla danej kolejki
                
                for i, j in pair_set:
                    teamA = group[i]
                    teamB = group[j]

                    if teamA and teamB:
                        matches_for_this_round_all_groups.append({
                            "team_a_id": teamA["id"],
                            "team_b_id": teamB["id"],
                            "round": f"Faza grupowa {label}",
                            "score": "VS",
                        })
            
            # Przypisz daty i godziny meczom z tej kolejki, rozprowadzając je między dniami
            # W danym dniu są 4 grupy, każda gra 2 mecze na raz, więc 8 meczów na dzień
            # Jeśli 4 grupy grają 2 mecze (4 pary meczów), to jest 4 mecze na kolejkę.
            # Jeśli masz 4 grupy i każda gra po 1 meczu w danej kolejce (np. mecz 0-1 i mecz 2-3 to 2 mecze na grupe)
            # Twoja logika generuje 2 mecze na grupe na "pair_set".
            # To oznacza 4 grupy * 2 mecze = 8 meczów na "round_idx" w pętli.

            for match_data in matches_for_this_round_all_groups:
                time_offset_minutes = match_hour_offsets[match_in_day_index % 8] * 60

                # Oblicz datę i godzinę meczu, lokalizując i konwertując na UTC
                # Zaczynamy od start_date_local, dodajemy dni, a następnie godziny i minuty.
                match_local_datetime = start_date_local + timedelta(days=match_day) + timedelta(minutes=time_offset_minutes)
                
                # Upewnij się, że jest to obiekt datetime "aware" o strefie czasowej
                match_aware_datetime = warsaw_tz.localize(match_local_datetime)
                
                # Konwertuj na UTC do zapisu w bazie
                match_data["match_date"] = match_aware_datetime.astimezone(pytz.utc)
                
                all_matches_to_insert.append(match_data)
                
                match_in_day_index += 1
                if match_in_day_index % 8 == 0: # Jeśli zapełniliśmy 8 slotów na dzień, przejdź do następnego dnia
                    match_day += 1
                    match_in_day_index = 0 # Zresetuj indeks meczu w dniu


        # === Generowanie ćwierćfinałów ===
        # Następny dzień po ostatnim meczu grupowym
        match_day += 2 # Przesunięcie o 2 dni dla fazy pucharowej
        match_in_day_index = 0 # Zresetuj indeks dla nowego dnia
        
        # Te matchup'y są na razie "fikcyjne", oparte na kolejności teams w tablicy
        # W prawdziwym systemie, musiałbyś pobrać zwycięzców grup.
        qf_matchups = [
            (teams[0]["id"], teams[5]["id"]),  # A1 vs B2 (przykładowo)
            (teams[8]["id"], teams[15]["id"]), # C1 vs D2
            (teams[4]["id"], teams[1]["id"]),  # B1 vs A2
            (teams[12]["id"], teams[9]["id"]), # D1 vs C2
        ]

        # Godziny meczów ćwierćfinałowych (przykładowo: 14:00, 16:00, 18:00, 20:00)
        qf_times = [14, 16, 18, 20]

        for i, (team_a_id, team_b_id) in enumerate(qf_matchups):
            qf_local_datetime = start_date_local.replace(hour=qf_times[i], minute=0, second=0, microsecond=0) + timedelta(days=match_day)
            qf_aware_datetime = warsaw_tz.localize(qf_local_datetime)
            
            all_matches_to_insert.append({
                "team_a_id": team_a_id,
                "team_b_id": team_b_id,
                "match_date": qf_aware_datetime.astimezone(pytz.utc),
                "round": "Ćwierćfinały",
                "score": "VS",
            })
        
        # === Generowanie Półfinałów ===
        match_day += 2 # Przesunięcie o 2 dni
        
        # Dla półfinałów i finału używamy ID pierwszych dwóch drużyn jako placeholderów,
        # ponieważ w tej fazie nie znamy jeszcze rzeczywistych zwycięzców.
        pf_placeholder_team_id_1 = teams[0]["id"]
        pf_placeholder_team_id_2 = teams[1]["id"]

        # Półfinał 1: 16:00
        pf1_local_datetime = start_date_local.replace(hour=16, minute=0, second=0, microsecond=0) + timedelta(days=match_day)
        pf1_aware_datetime = warsaw_tz.localize(pf1_local_datetime)
        all_matches_to_insert.append({
            "team_a_id": pf_placeholder_team_id_1,
            "team_b_id": pf_placeholder_team_id_2,
            "match_date": pf1_aware_datetime.astimezone(pytz.utc),
            "round": "Półfinały",
            "score": "VS",
        })

        # Półfinał 2: 20:00
        pf2_local_datetime = start_date_local.replace(hour=20, minute=0, second=0, microsecond=0) + timedelta(days=match_day)
        pf2_aware_datetime = warsaw_tz.localize(pf2_local_datetime)
        all_matches_to_insert.append({
            "team_a_id": pf_placeholder_team_id_1,
            "team_b_id": pf_placeholder_team_id_2,
            "match_date": pf2_aware_datetime.astimezone(pytz.utc),
            "round": "Półfinały",
            "score": "VS",
        })

        # === Generowanie Finału ===
        match_day += 2 # Przesunięcie o 2 dni
        
        # Finał: 20:30
        final_local_datetime = start_date_local.replace(hour=20, minute=30, second=0, microsecond=0) + timedelta(days=match_day)
        final_aware_datetime = warsaw_tz.localize(final_local_datetime)
        all_matches_to_insert.append({
            "team_a_id": pf_placeholder_team_id_1,
            "team_b_id": pf_placeholder_team_id_2,
            "match_date": final_aware_datetime.astimezone(pytz.utc),
            "round": "Finał",
            "score": "VS",
        })


        # Wstawianie meczów do bazy danych
        for match in all_matches_to_insert:
            cur.execute(
                """
                INSERT INTO matches (id, team_a_id, team_b_id, match_date, round, score)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), match["team_a_id"], match["team_b_id"], match["match_date"], match["round"], match["score"])
            )
        conn.commit()
        cur.close()
        conn.close()

        print(f"[✅] Wygenerowano i zapisano {len(all_matches_to_insert)} meczów w harmonogramie.")
        return jsonify({"status": "success", "message": f"Wygenerowano i zapisano {len(all_matches_to_insert)} meczów w harmonogramie."}), 200

    except Exception as e:
        print(f"[❌] Błąd podczas generowania i zapisywania harmonogramu: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": "Błąd serwera podczas generowania i zapisywania harmonogramu."}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)