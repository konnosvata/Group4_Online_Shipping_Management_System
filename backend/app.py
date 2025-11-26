import os
import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "..", "Database.db")

app = Flask(__name__)
CORS(app)


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


# -----------------------------
# DATABASE CONNECTION
# -----------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


# -----------------------------
# LOGIN
# -----------------------------
@app.post("/api/login")
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "email and password required"}), 400

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user is None or password != user["password"]:
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["user_id"],
                "name": user["name"]
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": "Internal server error"}), 500



# -----------------------------
# REGISTRATION
# -----------------------------
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
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        db.execute(
            "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
            (name, email, password, 1)
        )
        db.commit()

        user = db.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": user["user_id"],
                "name": user["name"]
            }
        }), 201

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# FORGET PASSWORD (TOKEN)
# -----------------------------
@app.post("/api/forget")
def forget():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "email required"}), 400

        db = get_db()
        existing_user = db.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if existing_user is None:
            return jsonify({"error": "User not found"}), 400

        token = uuid.uuid4().hex

        db.execute(
            "INSERT INTO reset_password_token (email, token) VALUES (?, ?)",
            (email, token)
        )
        db.commit()

        base_url = request.host_url.rstrip('/')
        url = f"{base_url}/resetPassword?token={token}"

        return jsonify({"message": url}), 201

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# CHECK TOKEN VALIDITY
# -----------------------------
@app.post("/api/checkToken")
def checkToken():
    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"error": "token required"}), 400

        db = get_db()
        existing_token = db.execute(
            "SELECT * FROM reset_password_token WHERE token = ?",
            (token,)
        ).fetchone()

        if existing_token is None:
            return jsonify({"error": "token not found"}), 400

        return jsonify({"message": "token is valid"}), 201

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# RESET PASSWORD
# -----------------------------
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
            "SELECT * FROM reset_password_token WHERE token = ?",
            (token,)
        ).fetchone()

        if not existing_token:
            return jsonify({"error": "token not found"}), 400

        email = existing_token["email"]

        db.execute(
            "UPDATE users SET password = ? WHERE email = ?",
            (password, email)
        )
        db.commit()

        return jsonify({"message": "Password successfully reset."}), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# GET CUSTOMERS
# -----------------------------
@app.get("/api/customers")
def get_customers():
    try:
        db = get_db()
        rows = db.execute(
            "SELECT customer_id, user_id, address, phone FROM customers ORDER BY customer_id"
        ).fetchall()

        return jsonify([dict(row) for row in rows]), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# GET DRIVERS
# -----------------------------
@app.get("/api/drivers")
def get_drivers():
    try:
        db = get_db()
        rows = db.execute(
            "SELECT driver_id, user_id, license_number, vehicle_plate FROM drivers ORDER BY driver_id"
        ).fetchall()

        return jsonify([dict(row) for row in rows]), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# CREATE SHIPMENT
# -----------------------------
@app.post("/api/createShipment")
def create_shipment():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        destination = data.get("destination")
        weight = data.get("weight")
        length = data.get("length")
        width = data.get("width")
        height = data.get("height")
        date_to_deliver = data.get("date_to_deliver")
        created_by = data.get("created_by")
        fragile = data.get("fragile", 0)

        if not all([destination, weight, length, width, height, date_to_deliver, created_by]):
            return jsonify({"error": "Missing required fields"}), 400

        db = get_db()

        user = db.execute(
            "SELECT user_id FROM users WHERE user_id = ?",
            (created_by,)
        ).fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 400

        customer = db.execute(
            "SELECT customer_id FROM customers WHERE user_id = ?",
            (created_by,)
        ).fetchone()

        if not customer:
            return jsonify({"error": "Customer not found"}), 400

        customer_id = customer["customer_id"]

        driver = db.execute(
            "SELECT driver_id FROM drivers ORDER BY RANDOM() LIMIT 1"
        ).fetchone()

        if not driver:
            return jsonify({"error": "No drivers available"}), 400

        driver_id = driver["driver_id"]

        db.execute(
            """
            INSERT INTO shipments (customer_id, driver_id, created_by, weight, length, width, height, destination, fragile, date_created, date_to_deliver, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
            """,
            (customer_id, driver_id, created_by, weight, length, width, height, destination, fragile, date_to_deliver, "pending")
        )

        db.commit()

        shipment = db.execute(
            "SELECT * FROM shipments WHERE rowid = last_insert_rowid()"
        ).fetchone()

        return jsonify({
            "message": "Shipment created successfully",
            "shipment": dict(shipment)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# ACTIVE SHIPMENTS
# -----------------------------
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

        return jsonify([dict(row) for row in rows]), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# CANCEL SHIPMENT
# -----------------------------
@app.post("/api/cancelShipment")
def cancel_shipment():
    try:
        data = request.get_json()
        shipment_id = data.get("shipment_id")

        if not shipment_id:
            return jsonify({"error": "shipment_id required"}), 400

        db = get_db()

        shipment = db.execute(
            "SELECT * FROM shipments WHERE shipment_id = ?",
            (shipment_id,)
        ).fetchone()

        if not shipment:
            return jsonify({"error": "Shipment not found"}), 404

        db.execute(
            "UPDATE shipments SET status = 'cancelled' WHERE shipment_id = ?",
            (shipment_id,)
        )
        db.commit()

        return jsonify({"message": "Shipment cancelled"}), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# ALL SHIPMENTS
# -----------------------------
@app.get("/api/allShipments")
def get_all_shipments():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()
        rows = db.execute(
            """
            SELECT * FROM shipments 
            WHERE created_by = ?
            ORDER BY date_created DESC
            """,
            (user_id,)
        ).fetchall()

        return jsonify([dict(row) for row in rows]), 200

    except Exception:
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# COMMUNICATION PAGE ENDPOINT
# -----------------------------
@app.get("/api/communication")
def communication():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()

        # Get active or pending shipments for this customer
        shipments = db.execute(
            """
            SELECT shipment_id, driver_id 
            FROM shipments
            WHERE created_by = ? AND (status = 'active' OR status = 'pending')
            """,
            (user_id,)
        ).fetchall()

        result = []

        for s in shipments:
            # Get driver with phone number
            driver = db.execute(
                """
                SELECT d.driver_id, d.user_id, d.phone, u.name
                FROM drivers d
                JOIN users u ON d.user_id = u.user_id
                WHERE d.driver_id = ?
                """,
                (s["driver_id"],)
            ).fetchone()

            if driver:
                result.append({
                    "driverId": driver["driver_id"],
                    "name": driver["name"],
                    "phone": driver["phone"],
                    "shipmentId": s["shipment_id"]
                })

        return jsonify(result), 200

    except Exception as e:
        print("COMMUNICATION ERROR:", e)
        return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
