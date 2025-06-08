import uuid
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Ścieżki
FRONTEND_PUBLIC = r"D:\esport-page\frontend\public"
UPLOAD_FOLDER = os.path.join(FRONTEND_PUBLIC, "uploads")
DATA_FILE = os.path.join(UPLOAD_FOLDER, "teams.json")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/register", methods=["POST"])
def register():
    try:
        # Dane z formularza
        team_name = request.form.get("teamName")
        captain_email = request.form.get("captainEmail")
        captain_dob = request.form.get("dateOfBirth")
        player1 = request.form.get("player1")
        player2 = request.form.get("player2")
        player3 = request.form.get("player3")
        logo_file = request.files.get("logo")

        if not all([team_name, captain_email, captain_dob, player1, player2, player3, logo_file]):
            return jsonify({"status": "error", "message": "Brakuje danych lub logo"}), 400

        # Generowanie ID i nazwy pliku
        team_id = str(uuid.uuid4())
        ext = os.path.splitext(logo_file.filename)[-1]
        logo_filename = f"logo_{team_id}{ext}"
        logo_path = os.path.join(UPLOAD_FOLDER, logo_filename)
        logo_file.save(logo_path)

        # Wczytaj dane JSON
        teams = []
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                try:
                    teams = json.load(f)
                except json.JSONDecodeError:
                    teams = []

        # Nowa drużyna
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

        # Zapis do pliku
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(teams, f, indent=2, ensure_ascii=False)

        print(f"[✅] Zarejestrowano drużynę: {team_name}")
        return jsonify({ "status": "ok", "message": "Zgłoszenie przyjęte!" })

    except Exception as e:
        print("[❌] Błąd:", str(e))
        return jsonify({ "status": "error", "message": "Błąd serwera" }), 500

if __name__ == "__main__":
    app.run(debug=True)
