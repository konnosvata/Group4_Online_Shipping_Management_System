import os
import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import uuid

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
    
# forget backend
@app.post("/api/forget")
def forget():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "email required"}), 400

        db = get_db()

        existing_user = db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        if existing_user is None:
            return jsonify({"error": "User not found"}), 400
        
        token = uuid.uuid4().hex

        # Insert token in database
        db.execute(
            "INSERT INTO reset_password_token (email, token) VALUES (?, ?)",
            (email, token)
        )
        db.commit()

        #send email
        url = "http://localhost:3000/resetPassword?token=" + token

        #remove later
        return jsonify({
            "message": url,
        }), 201
    
        # return jsonify({
        #     "message": "email send",
        # }), 201

    except Exception as e:
        app.logger.exception("Error in /api/forget")
        return jsonify({"error": "Internal server error"}), 500

# check token backend
@app.post("/api/checkToken")
def checkToken():
    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"error": "token required"}), 400

        db = get_db()

        existing_token = db.execute(
            "SELECT * FROM reset_password_token WHERE token = ?", (token,)
        ).fetchone()

        if existing_token is None:
            return jsonify({"error": "token not found"}), 400

        return jsonify({
            "message": "token is valid",
        }), 201

    except Exception as e:
        app.logger.exception("Error in /api/checkToken")
        return jsonify({"error": "Internal server error"}), 500
    
# resetPassword backend
@app.post("/api/resetPassword")
def resetPassword():
    try:
        data = request.get_json()
        token = data.get("token")
        password = data.get("password")

        if not password:
            return jsonify({"error": "password is required"}), 400

        db = get_db()

        existing_token = db.execute(
            "SELECT * FROM reset_password_token WHERE token = ?", (token,)
        ).fetchone()

        if not existing_token:
            return jsonify({"error": "token not found"}), 400

        email = existing_token["email"]

        # update new password
        db.execute(
            "UPDATE users SET password=? WHERE email=?",
            (password, email)
        )
        db.commit()

        return jsonify({"message": "Password successfully reset."}), 200

    except Exception as e:
        app.logger.exception("Error in /api/resetPassword")
        return jsonify({"error": "Internal server error"}), 500

@app.get("/api/activeShipments")
def get_active_shipments():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()
        rows = db.execute(
            """
            SELECT * FROM shipments 
            WHERE created_by = ? AND (status = 'active' OR status = 'pending')
            """,
            (user_id,)
        ).fetchall()

        shipments = [dict(row) for row in rows]

        return jsonify(shipments), 200

    except Exception as e:
        app.logger.exception("Error in /api/activeShipments")
        return jsonify({"error": "Internal server error"}), 500
    

    

#use port 5000
if __name__ == "__main__":
    app.run(debug=True, port=5000)