from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import mysql.connector


app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

def get_db_connection():
    return mysql.connector.connect(
        host="team3db.cjmg4mysketj.us-east-2.rds.amazonaws.com",
        user="admin",
        password="team3password",
        database="team3db",
        port=3306
    )


def create_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                role VARCHAR(50)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                dob DATE,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Guardians (
                guardian_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Therapists (
                therapist_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("[✔] Tables checked/created successfully.")

    except Exception as e:
        print(f"[✖] Error creating tables: {e}")

@app.route('/addUsers', methods=['POST'])
def add_user():
    data = request.get_json()

    # Validate required fields
    required_fields = ['email', 'password', 'firstName', 'lastName', 'role']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Extract fields
    email = data['email']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    role = data['role'].lower()
    phone = data.get('phone', '')
    address = data.get('address', '')

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the user
        cursor.execute("""
            INSERT INTO Users (email, password, first_name, last_name, phone, address, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (email, hashed_password, first_name, last_name, phone, address, role))

        user_id = cursor.lastrowid

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User registered", "user_id": user_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Entry point
if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
