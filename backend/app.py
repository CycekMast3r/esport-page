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
from dotenv import load_dotenv # Dodaj ten import do ładowania zmiennych z .env lokalnie

# --- Cloudinary Imports ---
import cloudinary
import cloudinary.uploader
import cloudinary.api
# --- Koniec Cloudinary Imports ---

load_dotenv() # Załaduj zmienne środowiskowe z .env (lokalnie)

app = Flask(__name__)
CORS(app)

# Umożliwia serwowanie plików z folderu 'uploads' pod adresem /uploads/
# WAŻNE: Ta reguła będzie nadal potrzebna do serwowania starych logo (jeśli jeszcze istnieją)
# oraz do serwowania domyślnych/placeholderowych obrazków, jeśli masz je lokalnie we Flasku.
# Jeśli planujesz absolutnie wszystko przechowywać w Cloudinary, możesz rozważyć usunięcie tego
# w przyszłości, ale na razie to bezpieczniejsze.
app.add_url_rule(
    '/uploads/<path:filename>',
    endpoint='uploaded_file',
    view_func=lambda filename: send_from_directory(app.config['UPLOAD_FOLDER'], filename)
)

# Ustawienie URL bazy danych.
DATABASE_URL = os.environ.get('DATABASE_URL')
print(f"DEBUG: Odczytana DATABASE_URL: {DATABASE_URL}")

# --- Cloudinary Configuration ---
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True # Używaj HTTPS
)
print("Cloudinary configured.")
# --- Koniec Cloudinary Configuration ---

# Ścieżki i ustawienia (UPLOAD_FOLDER nadal potrzebny, jeśli tymczasowo zapisujesz pliki lub masz fallback)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Funkcja połączenia z bazą danych
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("DEBUG: Połączono z bazą danych.")
        return conn
    except Exception as e:
        print(f"Błąd połączenia z bazą danych: {e}")
        traceback.print_exc()
        return None

# Funkcja do tworzenia tabeli (jeśli nie istnieje)
def create_table_if_not_exists():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS teams (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    logo VARCHAR(500), -- Zwiększ rozmiar na URL z Cloudinary
                    email VARCHAR(255) UNIQUE,
                    date_of_birth DATE,
                    players JSONB,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            print("Tabela 'teams' sprawdzona/utworzona.")
        except psycopg2.Error as e:
            print(f"Błąd podczas tworzenia tabeli: {e}")
            conn.rollback()
        finally:
            cur.close()
            conn.close()

# Uruchom tworzenie tabeli przy starcie aplikacji
with app.app_context(): # Użyj app_context dla operacji na bazie danych przy starcie
    create_table_if_not_exists()

# Endpoint do rejestracji drużyn
@app.route("/api/register", methods=["POST"])
def register():
    try:
        team_name = request.form.get("teamName")
        email = request.form.get("email")
        date_of_birth = request.form.get("dateOfBirth") # string w formacie YYYY-MM-DD
        players_json = request.form.get("players")

        # Walidacja danych
        if not team_name or not email or not date_of_birth or not players_json:
            return jsonify({"status": "error", "message": "Wszystkie pola są wymagane!"}), 400

        try:
            players_data = json.loads(players_json)
            if not isinstance(players_data, list) or not all(isinstance(p, dict) for p in players_data):
                raise ValueError("Players data must be a list of objects.")
        except json.JSONDecodeError:
            return jsonify({"status": "error", "message": "Niepoprawny format danych graczy (JSON)."}), 400
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 400

        # Data urodzenia
        try:
            datetime.strptime(date_of_birth, "%Y-%m-%d")
        except ValueError:
            return jsonify({"status": "error", "message": "Niepoprawny format daty urodzenia. Oczekiwany YYYY-MM-DD."}), 400

        logo_url = None
        if 'logo' in request.files and request.files['logo'].filename != '':
            file = request.files['logo']
            
            try:
                # -------------------------------------------------------------
                # GŁÓWNA ZMIANA: Wysyłanie pliku do Cloudinary
                # folder: Opcjonalnie, aby grupować pliki w Cloudinary
                # resource_type: 'image' to domyślne dla zdjęć
                upload_result = cloudinary.uploader.upload(file, folder="esport_logos")
                logo_url = upload_result['secure_url'] # To jest publiczny URL obrazka
                print(f"Logo przesłane do Cloudinary: {logo_url}")
                # -------------------------------------------------------------

            except Exception as e:
                print(f"Błąd przesyłania logo do Cloudinary: {e}")
                traceback.print_exc()
                return jsonify({"status": "error", "message": "Błąd przesyłania logo do serwisu Cloudinary."}), 500
        else:
            # Opcjonalnie: ustaw domyślne logo, jeśli nie przesłano żadnego
            # Pamiętaj, aby to logo też było hostowane np. na Cloudinary lub dostępnej ścieżce
            logo_url = "https://res.cloudinary.com/twoja_nazwa_chmury/image/upload/v1/esport_logos/default-team-logo.png" # PRZYKŁAD! Zmień na swój domyślny URL
            # Możesz też zostawić None, jeśli chcesz, aby logo było opcjonalne.
            print("Brak logo, użyto domyślnego lub pominięto.")


        conn = get_db_connection()
        if not conn:
            return jsonify({"status": "error", "message": "Błąd serwera: brak połączenia z bazą danych."}), 500
        cur = conn.cursor()

        try:
            cur.execute(
                sql.SQL("INSERT INTO teams (name, logo, email, date_of_birth, players) VALUES (%s, %s, %s, %s, %s)"),
                (team_name, logo_url, email, date_of_birth, json.dumps(players_data))
            )
            conn.commit()
            print(f"Drużyna {team_name} zarejestrowana pomyślnie z logo URL: {logo_url}")
            return jsonify({"status": "success", "message": "Drużyna zarejestrowana pomyślnie!"}), 200
        except psycopg2.IntegrityError as e:
            conn.rollback()
            if "duplicate key value violates unique constraint" in str(e):
                if "teams_name_key" in str(e):
                    return jsonify({"status": "error", "message": "Drużyna o tej nazwie już istnieje!"}), 409
                elif "teams_email_key" in str(e):
                    return jsonify({"status": "error", "message": "Adres e-mail jest już używany!"}), 409
            print(f"Błąd integralności bazy danych: {e}")
            traceback.print_exc()
            return jsonify({"status": "error", "message": "Błąd rejestracji: Drużyna lub e-mail już istnieje."}), 409
        except Exception as e:
            conn.rollback()
            print(f"Błąd bazy danych podczas rejestracji: {e}")
            traceback.print_exc()
            return jsonify({"status": "error", "message": "Wystąpił błąd podczas rejestracji drużyny."}), 500
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print(f"Ogólny błąd w funkcji register: {e}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Wystąpił nieoczekiwany błąd serwera."}), 500

# Endpoint do pobierania wszystkich drużyn
@app.route("/api/teams", methods=["GET"])
def get_teams():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Błąd serwera: brak połączenia z bazą danych."}), 500
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, logo, email, date_of_birth, players, registration_date FROM teams")
        teams_data = cur.fetchall()
        
        # Pobierz nazwy kolumn
        column_names = [desc[0] for desc in cur.description]

        teams_list = []
        for team in teams_data:
            team_dict = dict(zip(column_names, team))
            # Konwertuj 'players' z JSONB na obiekt Python
            if isinstance(team_dict.get('players'), str):
                try:
                    team_dict['players'] = json.loads(team_dict['players'])
                except json.JSONDecodeError:
                    team_dict['players'] = [] # lub inna domyślna wartość
            teams_list.append(team_dict)
            
        return jsonify(teams_list), 200
    except Exception as e:
        print(f"Błąd pobierania drużyn: {e}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": "Wystąpił błąd podczas pobierania drużyn."}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint dla strony głównej (opcjonalny, jeśli frontend jest oddzielny)
@app.route("/")
def home():
    return "Backend jest uruchomiony!"

if __name__ == '__main__':
    app.run(debug=True)