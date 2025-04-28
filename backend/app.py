from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
import bcrypt  # type: ignore
import mysql.connector  # type: ignore
import json
import html

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
                role VARCHAR(50),
                dob DATE
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
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
                license_number VARCHAR(100),
                specialization VARCHAR(255),
                isVerified BOOLEAN DEFAULT FALSE,
                availability JSON,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Appointments (
                appointment_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                therapist_id INT,
                date DATE,
                time TIME,
                location VARCHAR(100),
                status VARCHAR(50),
                FOREIGN KEY (student_id) REFERENCES Students(student_id),
                FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
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
    dob = data.get('dob', None) 
    license_number = data.get('licenseNumber', '') # Needs implementation on frontend
    specialization = data.get('specialization', '') # ditto
    is_verified = data.get('isVerified', False) #ditto

    # Sanitize only string fields
    def safe_escape(value):
        if isinstance(value, str) and value.strip():
            return html.escape(value)  
        return value
    
    # check for html injection
    email = safe_escape(email)
    password = safe_escape(password)
    first_name = safe_escape(first_name)
    last_name = safe_escape(last_name)
    role = safe_escape(role)
    phone = safe_escape(phone)
    address = safe_escape(address)
    dob = safe_escape(dob)
    license_number = safe_escape(license_number)
    specialization = safe_escape(specialization)
    is_verified = safe_escape(is_verified)

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')



    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the user
        cursor.execute("""
            INSERT INTO Users (email, password, first_name, last_name, phone, address, role, dob)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""", (email, hashed_password, first_name, last_name, phone, address, role, dob))

        user_id = cursor.lastrowid

        # Insert into role-specific table
        if role == 'student':
            cursor.execute("INSERT INTO Students (user_id) VALUES (%s)", (user_id,))
        elif role == 'guardian':
            cursor.execute("INSERT INTO Guardians (user_id) VALUES (%s)", (user_id,))
        elif role == 'therapist':
            default_availability = {
                "Monday": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
                "Tuesday": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
                "Wednesday": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
                "Thursday": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
                "Friday": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
            }
            cursor.execute("""
                INSERT INTO Therapists (user_id, license_number, specialization, isVerified, availability)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                user_id,
                license_number,
                specialization,
                is_verified,
                json.dumps(default_availability)
            ))

        conn.commit()
        cursor.close()
        conn.close()

        user_response = {
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "role": role,
            "address": address,
            "dob": dob,
        }

        if role == "therapist":
            user_response.update({
                "license_number": license_number,
                "specialization": specialization,
                "is_verified": is_verified
            })

        return jsonify({"user": user_response}), 201


    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)


        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            user.pop('password', None)
            return jsonify({'message': 'Login successful', 'user': user}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

@app.route('/getTherapists', methods=['GET'])
def get_therapists():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # So rows are returned as dicts

    query = """
        SELECT
            t.therapist_id,
            u.first_name,
            u.last_name,
            u.email,
            t.license_number,
            t.specialization,
            t.isVerified,
            t.availability
        FROM Therapists t
        JOIN Users u ON t.user_id = u.user_id
    """

    cursor.execute(query)
    therapists = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(therapists)

@app.route('/updateAvailability', methods=['POST'])
def update_availability():
    data = request.get_json()
    therapist_id = data['therapist_id']
    new_availability = data['availability']  # Should be a dict like above

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE Therapists
        SET availability = %s
        WHERE therapist_id = %s
    """, (json.dumps(new_availability), therapist_id))

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Availability updated"}), 200

@app.route('/bookAppointment', methods=['POST'])
def book_appointment():
    data = request.get_json()

    student_id = data['student_id']
    therapist_id = data['therapist_id']
    date = data['date']           # Format: 'YYYY-MM-DD'
    time = data['time']           # Format: 'HH:MM'
    location = data['location']
    status = 'pending'            # Default status

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO Appointments (student_id, therapist_id, date, time, location, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (student_id, therapist_id, date, time, location, status))

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Appointment booked successfully"}), 201


# Entry point
if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
