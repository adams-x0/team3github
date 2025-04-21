from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
import bcrypt  # type: ignore
import mysql.connector  # type: ignore

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
    date_fields = data.get('dateFields', {})
    license_number = data.get('licenseNumber', '') # Needs implementation on frontend
    specialization = data.get('specialization', '') # ditto
    is_verified = data.get('isVerified', False) #ditto

    # Format DOB
    dob = None
    try:
        dob_month = int(date_fields.get('dobMonth', 0))
        dob_day = int(date_fields.get('dobDay', 0))
        dob_year = int(date_fields.get('dobYear', 0))
        if dob_year and dob_month and dob_day:
            dob = f"{dob_year:04d}-{dob_month:02d}-{dob_day:02d}"
    except Exception:
        pass  # leave dob as None if parsing fails

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
            cursor.execute("""
            INSERT INTO Therapists (user_id, license_number, specialization, isVerified)
            VALUES (%s, %s, %s, %s)""", (user_id, license_number, specialization, is_verified))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User registered", "user_id": user_id}), 201

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
            t.isVerified
        FROM Therapists t
        JOIN Users u ON t.user_id = u.user_id
    """

    cursor.execute(query)
    therapists = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(therapists)




# Entry point
if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
