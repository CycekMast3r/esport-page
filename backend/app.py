import uuid
import json
import os
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Ścieżki i ustawienia
FRONTEND_PUBLIC = r"D:\esport-page\frontend\public"
UPLOAD_FOLDER = os.path.join(FRONTEND_PUBLIC, "uploads")
DATA_FILE = os.path.join(UPLOAD_FOLDER, "teams.json")
ALLOWED_EXTENSIONS = {".png"}
MAX_FILE_SIZE_MB = 2
MAX_TEAMS = 16
MINUTES_BETWEEN_SUBMISSIONS = 2
last_submission_time = {}

BANNED_EMAIL_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "yopmail.com", "trashmail.com", "dispostable.com"
}


os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Pamięć dla rate limiting
last_submission_time = {}  # IP -> datetime


def validate_email(email):
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email)


def calculate_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except ValueError:
        return -1


@app.route("/api/register", methods=["POST"])
def register():
    try:
        client_ip = request.remote_addr
        now = datetime.now()

        # Anti-spam z IP
        if (last := last_submission_time.get(client_ip)) and (now - last) < timedelta(minutes=MINUTES_BETWEEN_SUBMISSIONS):
            return jsonify({"status": "error", "message": f"Odczekaj {MINUTES_BETWEEN_SUBMISSIONS} minut(y) przed kolejnym zgłoszeniem."}), 429

        # Dane z formularza
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

        if not re.match(r"[^@]+@[^@]+\.[^@]+", captain_email):
            return jsonify({"status": "error", "message": "Nieprawidłowy email."}), 400

        if any(captain_email.endswith(f"@{domain}") for domain in BANNED_EMAIL_DOMAINS):
            return jsonify({"status": "error", "message": "Użyto tymczasowego adresu e-mail. Wprowadź prawdziwy adres."}), 400

        # Wiek kapitana
        birth = datetime.strptime(captain_dob, "%Y-%m-%d")
        age = (now - birth).days // 365
        if age < 16:
            return jsonify({"status": "error", "message": "Kapitan musi mieć co najmniej 16 lat."}), 400

        # Logo: format + rozmiar
        ext = os.path.splitext(logo_file.filename)[-1].lower()
        if ext != ".png" or logo_file.mimetype != "image/png":
            return jsonify({"status": "error", "message": "Logo musi być plikiem PNG."}), 400

        logo_file.seek(0, os.SEEK_END)
        if logo_file.tell() > 2 * 1024 * 1024:
            return jsonify({"status": "error", "message": "Logo nie może przekraczać 2 MB."}), 400
        logo_file.seek(0)

        # Wczytaj dane
        teams = []
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                try:
                    teams = json.load(f)
                except json.JSONDecodeError:
                    pass

        if len(teams) >= MAX_TEAMS:
            return jsonify({"status": "error", "message": "Limit 16 drużyn został osiągnięty."}), 403

        # Unikalność
        if any(t["name"].lower() == team_name.lower() for t in teams):
            return jsonify({"status": "error", "message": "Taka nazwa drużyny już istnieje."}), 409

        if any(t["email"].lower() == captain_email for t in teams):
            return jsonify({"status": "error", "message": "Ten email już został użyty do rejestracji."}), 409

        # Zapis
        team_id = str(uuid.uuid4())
        logo_filename = secure_filename(f"logo_{team_id}{ext}")
        logo_path = os.path.join(UPLOAD_FOLDER, logo_filename)
        logo_file.save(logo_path)

        new_team = {
            "id": team_id,
            "name": team_name,
            "logo": logo_filename,
            "email": captain_email,
            "dateOfBirth": captain_dob,
            "players": [
                { "name": player1, "G": 0, "A": 0, "S": 0, "MVP": 0 },
                { "name": player2, "G": 0, "A": 0, "S": 0, "MVP": 0 },
                { "name": player3, "G": 0, "A": 0, "S": 0, "MVP": 0 }
            ]
        }

        teams.append(new_team)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(teams, f, indent=2, ensure_ascii=False)

        last_submission_time[client_ip] = now
        print(f"[✅] Zarejestrowano drużynę: {team_name}")
        return jsonify({ "status": "ok", "message": "Zgłoszenie przyjęte!" })

    except Exception as e:
        print("[❌] Błąd:", str(e))
        return jsonify({ "status": "error", "message": "Błąd serwera." }), 500



if __name__ == "__main__":
    app.run(debug=True)
