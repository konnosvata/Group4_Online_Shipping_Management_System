import os
import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "..", "Database.db")

app = Flask(__name__)
CORS(app)

#connect with database
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

#close database on application close
@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()

#login form
@app.post("/api/login")
def login():
    try:
        data = request.get_json()
        app.logger.debug(f"Login request JSON: {data}")

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "email and password required"}), 400

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        app.logger.debug(f"User row from DB: {user}")

        if user is None:
            return jsonify({"error": "Invalid email or password"}), 401

        if password != user["password"]:
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["user_id"],
                "name": user["name"],
            }
        }), 200

    except Exception as e:
        app.logger.exception("Error in /api/login")
        return jsonify({"error": "Internal server error"}), 500
    
# registration backend
@app.post("/api/register")
def register():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        db = get_db()

        existing_user = db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        # Insert new user with default role
        db.execute(
            "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
            (name, email, password, 1)
        )
        db.commit()

        user = db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": user["user_id"],
                "name": user["name"],
            }
        }), 201

    except Exception as e:
        app.logger.exception("Error in /api/register")
        return jsonify({"error": "Internal server error"}), 500

#use port 5000
if __name__ == "__main__":
    app.run(debug=True, port=5000)