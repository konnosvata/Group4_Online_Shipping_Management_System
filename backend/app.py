import os
import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import uuid
import requests
import yagmail

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVhMjg1ZWQzMTZhMDQzYjg5NTlhZTMwNzZhMTM2N2ZkIiwiaCI6Im11cm11cjY0In0="

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "..", "Database.db")

app = Flask(__name__)
CORS(app)

#health check endpoint
@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

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
                "email": user["email"],
                "role_id": user["role_id"],
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
        yag = yagmail.SMTP('group4shipping@gmail.com', 'opmh ljmd gvmi gctx')
        contents = [f'Please reset your password by pressing this link, http://localhost:3000/resetPassword?token={token} ']
        yag.send(email, 'password reset', contents)

    
        return jsonify({
            "message": "email send",
        }), 201

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

@app.get("/api/customers")
def get_customers():
    try:
        db = get_db()
        rows = db.execute(
            "SELECT customer_id, user_id, address, phone FROM customers ORDER BY customer_id"
        ).fetchall()
        
        customers = [dict(row) for row in rows]
        return jsonify(customers), 200
    
    except Exception as e:
        app.logger.exception("Error in /api/customers")
        return jsonify({"error": "Internal server error"}), 500

@app.get("/api/drivers")
def get_drivers():
    try:
        db = get_db()
        rows = db.execute(
            "SELECT driver_id, user_id, license_number, vehicle_plate FROM drivers ORDER BY driver_id"
        ).fetchall()
        
        drivers = [dict(row) for row in rows]
        return jsonify(drivers), 200
    
    except Exception as e:
        app.logger.exception("Error in /api/drivers")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/api/createShipment")
def create_shipment():
    try:
        data = request.get_json()
        
        if not data:
            app.logger.error("No JSON data received")
            return jsonify({"error": "No JSON data received"}), 400
        
        app.logger.debug(f"createShipment request data: {data}")
        
        # Required fields from form
        destination = data.get("destination")
        weight = data.get("weight")
        length = data.get("length")
        width = data.get("width")
        height = data.get("height")
        date_to_deliver = data.get("date_to_deliver")
        created_by = data.get("created_by")
        fragile = data.get("fragile", 0)
        
        app.logger.debug(f"Parsed fields - destination: {destination}, weight: {weight}, created_by: {created_by}")
        
        if not all([destination, weight, length, width, height, date_to_deliver, created_by]):
            missing = []
            if not destination: missing.append("destination")
            if not weight: missing.append("weight")
            if not length: missing.append("length")
            if not width: missing.append("width")
            if not height: missing.append("height")
            if not date_to_deliver: missing.append("date_to_deliver")
            if not created_by: missing.append("created_by")
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
        # Convert to appropriate types
        try:
            weight = float(weight)
            length = float(length)
            width = float(width)
            height = float(height)
            created_by = int(created_by)
            fragile = int(fragile) if fragile else 0
        except (ValueError, TypeError) as e:
            app.logger.error(f"Type conversion error: {e}")
            return jsonify({"error": f"Invalid data types: {str(e)}"}), 400
        
        db = get_db()
        
        # Get customer_id from the users table using the logged-in user's ID (created_by)
        user = db.execute("SELECT user_id FROM users WHERE user_id = ?", (created_by,)).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 400
        
        # Query customers table to get customer_id for this user
        customer = db.execute("SELECT customer_id FROM customers WHERE user_id = ?", (created_by,)).fetchone()
        customer_id = customer["customer_id"] if customer else None
        
        if not customer_id:
            app.logger.warning(f"No customer found for user_id: {created_by}")
            return jsonify({"error": "No customer record found for this user"}), 400
        
        # Randomly assign driver_id from the drivers table
        driver = db.execute("SELECT driver_id FROM drivers ORDER BY RANDOM() LIMIT 1").fetchone()
        driver_id = driver["driver_id"] if driver else None
        
        if not driver_id:
            app.logger.warning("No drivers available in the database")
            return jsonify({"error": "No drivers available"}), 400
        
        driver_id = int(driver_id)
        customer_id = int(customer_id)
        
        app.logger.debug(f"Assigned - customer_id: {customer_id} (from user {created_by}), driver_id: {driver_id} (random)")
        
        # Insert new shipment
        db.execute(
            """INSERT INTO shipments (customer_id, driver_id, created_by, weight, length, width, height, destination, fragile, date_created, date_to_deliver, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+2 hours'), ?, ?)""",
            (customer_id, driver_id, created_by, weight, length, width, height, destination, fragile, date_to_deliver, 'pending')
        )
        db.commit()
        
        # Fetch the created shipment
        shipment = db.execute(
            "SELECT * FROM shipments WHERE rowid = last_insert_rowid()"
        ).fetchone()
        
        app.logger.info(f"Shipment created successfully: {dict(shipment)}")
        
        return jsonify({
            "message": "Shipment created successfully",
            "shipment": dict(shipment)
        }), 201

    except Exception as e:
        app.logger.exception("Error in /api/createShipment")
        return jsonify({"error": str(e)}), 500

@app.get("/api/activeShipments")
def get_active_shipments():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()
        rows = db.execute(
            """
            SELECT s.*, d.last_latitude, d.last_longitude
            FROM shipments s
            JOIN drivers d ON s.driver_id = d.driver_id
            WHERE s.created_by = ? AND (s.status = 'active' OR s.status = 'pending')
            """,
            (user_id,)
        ).fetchall()

        shipments = [dict(row) for row in rows]
        return jsonify(shipments), 200
    except Exception as e:
        app.logger.exception("Error in /api/activeShipments")
        return jsonify({"error": "Internal server error"}), 500

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
            """,
            (user_id,)
        ).fetchall()

        shipments = [dict(row) for row in rows]

        return jsonify(shipments), 200

    except Exception as e:
        app.logger.exception("Error in /api/allShipments")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/api/updateShipment")
def update_shipment():
    try:
        data = request.get_json()
        shipment_id = data.get("shipment_id")
        destination = data.get("destination")
        weight = data.get("weight")
        length = data.get("length")
        width = data.get("width")
        height = data.get("height")
        date_to_deliver = data.get("date_to_deliver")
        fragile = data.get("fragile")

        if not shipment_id:
            return jsonify({"error": "shipment_id is required"}), 400

        db = get_db()

        # Verify shipment exists
        shipment = db.execute("SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)).fetchone()
        if not shipment:
            return jsonify({"error": "Shipment not found"}), 404

        # Build update query dynamically for only provided fields
        updates = []
        params = []

        if destination is not None:
            updates.append("destination = ?")
            params.append(destination)
        if weight is not None:
            updates.append("weight = ?")
            params.append(float(weight))
        if length is not None:
            updates.append("length = ?")
            params.append(float(length))
        if width is not None:
            updates.append("width = ?")
            params.append(float(width))
        if height is not None:
            updates.append("height = ?")
            params.append(float(height))
        if date_to_deliver is not None:
            updates.append("date_to_deliver = ?")
            params.append(date_to_deliver)
        if fragile is not None:
            updates.append("fragile = ?")
            params.append(int(fragile))

        if not updates:
            return jsonify({"error": "No fields to update"}), 400

        params.append(shipment_id)
        query = f"UPDATE shipments SET {', '.join(updates)} WHERE shipment_id = ?"
        
        db.execute(query, params)
        db.commit()

        updated_shipment = db.execute("SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)).fetchone()

        app.logger.info(f"Shipment {shipment_id} updated successfully")

        return jsonify({
            "message": "Shipment updated successfully",
            "shipment": dict(updated_shipment)
        }), 200

    except Exception as e:
        app.logger.exception("Error in /api/updateShipment")
        return jsonify({"error": str(e)}), 500

@app.post("/api/cancelShipment")
def cancel_shipment():
    try:
        data = request.get_json()
        shipment_id = data.get("shipment_id")

        if not shipment_id:
            return jsonify({"error": "shipment_id is required"}), 400

        db = get_db()

        # Verify shipment exists
        shipment = db.execute("SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)).fetchone()
        if not shipment:
            return jsonify({"error": "Shipment not found"}), 404

        # Update status to cancelled
        db.execute("UPDATE shipments SET status = ? WHERE shipment_id = ?", ('cancelled', shipment_id))
        db.commit()

        updated_shipment = db.execute("SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)).fetchone()

        app.logger.info(f"Shipment {shipment_id} cancelled successfully")

        return jsonify({
            "message": "Shipment cancelled successfully",
            "shipment": dict(updated_shipment)
        }), 200

    except Exception as e:
        app.logger.exception("Error in /api/cancelShipment")
        return jsonify({"error": str(e)}), 500

@app.route("/api/getUser", methods=["GET"])
def get_user():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        cur = get_db().cursor()
        cur.execute("""
            SELECT user_id, name, email, password
            FROM users
            WHERE user_id = ?
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "User not found"}), 404

        return jsonify(dict(row))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/updateUser", methods=["POST"])
def update_user():
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        user_id = data.get("user_id")

        if not name or not email or not password or not user_id:
            return jsonify({"error": "All fields are required"}), 400

        if "@" not in email or email.endswith("@"):
            return jsonify({"error": "Invalid email"}), 400

        cur = get_db().cursor()
        cur.execute("""
            UPDATE users
            SET name = ?, email = ?, password = ?
            WHERE user_id = ?
        """, (name, email, password, user_id))

        get_db().commit()
        return jsonify({"message": "User updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/api/assignedShipments")
def get_assigned_shipments():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()

        driver = db.execute(
            "SELECT driver_id FROM drivers WHERE user_id = ?", (user_id,)
        ).fetchone()

        if not driver:
            return jsonify({"error": "Driver not found"}), 404

        driver_id = driver["driver_id"]

        rows = db.execute(
            """
            SELECT * FROM shipments
            WHERE driver_id = ? AND (status = 'pending' OR status = 'active')
            ORDER BY date_to_deliver ASC
            """,
            (driver_id,)
        ).fetchall()

        shipments = [dict(row) for row in rows]

        return jsonify(shipments), 200

    except Exception as e:
        app.logger.exception("Error in /api/assignedShipments")
        return jsonify({"error": "Internal server error"}), 500

@app.get("/api/assignedShipmentsHistory")
def get_assigned_shipments_history():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        db = get_db()

        driver = db.execute(
            "SELECT driver_id FROM drivers WHERE user_id = ?", (user_id,)
        ).fetchone()

        if not driver:
            return jsonify({"error": "Driver not found"}), 404

        driver_id = driver["driver_id"]

        rows = db.execute(
            """
            SELECT * FROM shipments
            WHERE driver_id = ?
            ORDER BY date_created DESC
            """,
            (driver_id,)
        ).fetchall()

        shipments = [dict(row) for row in rows]

        return jsonify(shipments), 200

    except Exception as e:
        app.logger.exception("Error in /api/assignedShipmentsHistory")
        return jsonify({"error": "Internal server error"}), 500

@app.post("/api/schedulePickup")
def schedule_pickup():
    try:
        data = request.get_json()

        required = ["shipment_id", "pickup_date", "pickup_time", "pickup_location"]
        missing = [f for f in required if not data.get(f)]

        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        shipment_id = data["shipment_id"]
        pickup_date = data["pickup_date"]
        pickup_time = data["pickup_time"]
        pickup_location = data["pickup_location"]
        handoff_details = data.get("handoff_details", "")

        db = get_db()

        # Check if shipment exists
        shipment = db.execute(
            "SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)
        ).fetchone()

        if not shipment:
            return jsonify({"error": "Shipment does not exist"}), 404

        # Cannot schedule if already cancelled or delivered
        if shipment["status"] not in ("pending", "active"):
            return jsonify({"error": "This shipment cannot be scheduled"}), 400

        # Insert pickup request
        db.execute(
            """
            INSERT INTO pickup_requests
            (shipment_id, pickup_date, pickup_time, pickup_location, handoff_details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (shipment_id, pickup_date, pickup_time, pickup_location, handoff_details)
        )
        db.commit()

        return jsonify({"message": "Pickup scheduled successfully"}), 201

    except Exception as e:
        app.logger.exception("Error in /api/schedulePickup")
        return jsonify({"error": str(e)}), 500

@app.post("/plan-route")
def plan_route():
    try:
        data = request.get_json()
        coordinates = data.get("coordinates", [])

        if len(coordinates) < 2:
            return jsonify({"error": "At least 2 points required"}), 400

        # ORS Directions API request
        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        payload = {
            "coordinates": coordinates,
            "instructions": False,
            "geometry_simplify": False
        }
        headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}

        res = requests.post(url, json=payload, headers=headers)
        route_data = res.json()

        print("Route data from ORS:", route_data)  # Debug

        if res.status_code != 200 or "error" in route_data:
            return jsonify({"error": "ORS API error", "details": route_data}), 500

        return jsonify(route_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.post("/save-driver-location")
def save_driver_location():
    try:
        data = request.get_json()
        app.logger.debug(f"Received JSON: {data}")

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        user_id = data.get("user_id")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        # Check for missing fields
        if user_id is None or latitude is None or longitude is None:
            return jsonify({
                "error": "Missing fields",
                "received": {"user_id": user_id, "latitude": latitude, "longitude": longitude}
            }), 400

        # Convert user_id to int if possible
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user_id"}), 400

        # Convert latitude and longitude to float
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid latitude or longitude"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """
            UPDATE drivers
            SET last_latitude = ?, 
                last_longitude = ?
            WHERE user_id = ?
            """,
            (latitude, longitude, user_id)
        )

        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "User not found in drivers table"}), 404

        return jsonify({
            "status": "saved",
            "user_id": user_id,
            "latitude": latitude,
            "longitude": longitude
        }), 200

    except Exception as e:
        app.logger.exception("Error in /save-driver-location")
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/getPaymentFormula", methods=["GET"])
def get_payment_formula():
    try:
        cur = get_db().cursor()
        cur.execute("SELECT * FROM payment_formula WHERE formula_id = 1")
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Formula not found"}), 404

        return jsonify(dict(row))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/updatePaymentFormula", methods=["POST"])
def update_payment_formula():
    try:
        data = request.get_json()

        limits = {
            "price_per_km": 10,
            "price_per_weight": 20,
            "base_fee": 100,
            "fragile_fee": 50
        }

        values = {}
        for key, max_val in limits.items():
            val = float(data.get(key, -1))
            if val < 0 or val > max_val:
                return jsonify({"error": f"{key} must be between 0 and {max_val}"}), 400
            values[key] = val

        cur = get_db().cursor()
        cur.execute("""
            UPDATE payment_formula
            SET price_per_km = ?,
                price_per_weight = ?,
                base_fee = ?,
                fragile_fee = ?
            WHERE formula_id = 1
        """, (
            values["price_per_km"],
            values["price_per_weight"],
            values["base_fee"],
            values["fragile_fee"]
        ))

        get_db().commit()
        return jsonify({"message": "Payment formula updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/api/monitorDrivers")
def monitor_drivers():
    try:
        db = get_db()

        rows = db.execute("""
            SELECT 
                d.driver_id,
                u.name AS driver_name,
                s.shipment_id,
                s.destination,
                s.status
            FROM drivers d
            JOIN users u ON d.user_id = u.user_id
            LEFT JOIN shipments s ON d.driver_id = s.driver_id
            ORDER BY d.driver_id
        """).fetchall()

        drivers = {}
        for row in rows:
            driver_id = row["driver_id"]

            if driver_id not in drivers:
                drivers[driver_id] = {
                    "driver_id": driver_id,
                    "driver_name": row["driver_name"],
                    "shipments": []
                }

            if row["shipment_id"]:
                drivers[driver_id]["shipments"].append({
                    "shipment_id": row["shipment_id"],
                    "destination": row["destination"],
                    "status": row["status"]
                })

        return jsonify(list(drivers.values())), 200

    except Exception as e:
        app.logger.exception("Error in /api/monitorDrivers")
        return jsonify({"error": "Internal server error"}), 500




#use port 8000 for backend (port 5000 is reserved by Replit for frontend webview)
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
