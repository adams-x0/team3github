from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
import bcrypt  # type: ignore
import mysql.connector  # type: ignore
import json
import html
from flask_mail import Mail, Message  # type: ignore

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Or your SMTP server
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'cmsc447team32025@gmail.com'
app.config['MAIL_PASSWORD'] = 'qpgtdwnjiugqozos'
app.config['MAIL_DEFAULT_SENDER'] =  'cmsc447team32025@gmail.com'
mail = Mail(app)
# Sanitize only string fields
def safe_escape(value):
    if isinstance(value, str) and value.strip():
        return html.escape(value)
    return value

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
                default_availability JSON,
                session_duration ENUM('30', '45', '60') DEFAULT '60',
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

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ParentStudent (
                id INT AUTO_INCREMENT PRIMARY KEY,
                guardian_id INT,
                student_id INT,
                FOREIGN KEY (guardian_id) REFERENCES Guardians(guardian_id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
            )
        """)


        conn.commit()
        cursor.close()
        conn.close()
        print("[✔] Tables checked/created successfully.")

    except Exception as e:
        print(f"[✖] Error creating tables: {e}")

@app.route('/addChild', methods=['POST'])
def add_child():
    data = request.get_json()

    # Validate required fields
    required_fields = ['guardian_id', 'firstName', 'lastName', 'dob', 'address']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Extract fields
    guardian_id = data['guardian_id']
    first_name = data['firstName']
    last_name = data['lastName']
    phone = data.get('phone', '')
    email = data.get('email', '')
    address = data['address']
    dob = data['dob'] 

    # check for html injection
    guardian_id = safe_escape(guardian_id)
    first_name = safe_escape(first_name)
    last_name = safe_escape(last_name)
    phone = safe_escape(phone)
    email = safe_escape(email)
    address = safe_escape(address)
    dob = safe_escape(dob)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the child
        cursor.execute("""
            INSERT INTO Children (address, date_of_birth, email, first_name, guardian_id, last_name, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s)""", (address, dob, email, first_name, guardian_id, last_name, phone))
        
        child_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()

        child_response = {
            "child_id": child_id,
            "first_name": first_name,
            "last_name": last_name,
            "guardian_id": guardian_id,
            "address": address,
            "dob": dob,
            "phone": phone,
            "email": email
        }

        return jsonify({"child": child_response}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/link-child', methods=['POST'])
def link_child():
    data = request.get_json()

    required_fields = ['user_id', 'email', 'password']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    user_id = safe_escape(data['user_id'])
    email = safe_escape(data['email'])
    password = safe_escape(data['password'])

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Step 1: Get guardian_id using user_id
        cursor.execute("SELECT guardian_id FROM Guardians WHERE user_id = %s", (user_id,))
        guardian = cursor.fetchone()

        if not guardian:
            return jsonify({"error": "No guardian record found for this user ID"}), 404

        guardian_id = guardian['guardian_id']

        # Step 2: Find user by email
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        student_user = cursor.fetchone()

        if not student_user:
            return jsonify({"error": "No user found with that email"}), 404

        # Step 3: Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), student_user['password'].encode('utf-8')):
            return jsonify({"error": "Incorrect password"}), 401

        # Step 4: Check role
        if student_user['role'].lower() != 'student':
            return jsonify({"error": "This user is not a student"}), 400

        # Step 5: Find student_id from Students table
        cursor.execute("SELECT student_id FROM Students WHERE user_id = %s", (student_user['user_id'],))
        student = cursor.fetchone()

        if not student:
            return jsonify({"error": "No student record found for this user"}), 404

        student_id = student['student_id']

        # Step 6: Check if already linked
        cursor.execute("""
            SELECT * FROM ParentStudent WHERE guardian_id = %s AND student_id = %s
        """, (guardian_id, student_id))
        existing_link = cursor.fetchone()

        if existing_link:
            return jsonify({"message": "This child is already linked to your account."}), 200

        # Step 7: Insert into ParentStudent
        cursor.execute("""
            INSERT INTO ParentStudent (guardian_id, student_id)
            VALUES (%s, %s)
        """, (guardian_id, student_id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Child account successfully linked!",
            "linked_student_id": student_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
            cursor.execute("""
                INSERT INTO Therapists (user_id, license_number, specialization, isVerified)
                VALUES (%s, %s, %s, %s)
            """, (
                user_id,
                license_number,
                specialization,
                is_verified,
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

            # If guardian, get guardian_id from Guardians table
            if user['role'] == 'guardian':
                cursor.execute("SELECT guardian_id FROM Guardians WHERE user_id = %s", (user['user_id'],))
                guardian = cursor.fetchone()
                if guardian:
                    user['guardian_id'] = guardian['guardian_id']

            if user['role'] == 'therapist':
                cursor.execute("SELECT isVerified FROM Therapists WHERE user_id = %s", (user['user_id'],))
                t_data = cursor.fetchone()
                user['isVerified'] = t_data['isVerified'] if t_data else 0

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
            t.default_availability,
            t.session_duration
        FROM Therapists t
        JOIN Users u ON t.user_id = u.user_id
        WHERE t.isVerified = TRUE
    """

    cursor.execute(query)
    therapists = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(therapists)

@app.route('/getTherapistAvailabilityByUserId/<int:user_id>', methods=['GET'])
def get_therapist_availability_by_user_id(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            t.default_availability
        FROM Therapists t
        WHERE t.user_id = %s
    """
    cursor.execute(query, (user_id,))
    result = cursor.fetchone()

    cursor.close()
    connection.close()

    if result:
        return jsonify({"default_availability": result['default_availability'] or '[]'}), 200
    else:
        return jsonify({'error': 'Therapist not found'}), 404

@app.route('/updateAvailability', methods=['POST'])
def update_availability():
    try:
        data = request.get_json()

        user_id = data.get('user_id')
        new_default_availability = data.get('default_availability')

        if user_id is None or new_default_availability is None:
            return jsonify({"error": "Missing user_id or default_availability"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Verify that the user exists as a therapist
        cursor.execute("SELECT therapist_id FROM Therapists WHERE user_id = %s", (user_id,))
        therapist = cursor.fetchone()

        if therapist is None:
            return jsonify({"error": "Therapist not found for given user_id"}), 404

        # Perform update
        cursor.execute("""
            UPDATE Therapists
            SET default_availability = %s
            WHERE user_id = %s
        """, (json.dumps(new_default_availability), user_id))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "Availability updated"}), 200

    except Exception as e:
        print("Error updating availability:", str(e))
        return jsonify({"error": "Internal server error"}), 500

@app.route('/getPendingTherapists', methods=['GET'])
def get_pending_therapists():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT t.therapist_id, u.first_name, u.last_name, u.email, t.license_number, t.specialization
        FROM Therapists t
        JOIN Users u ON t.user_id = u.user_id
        WHERE t.isVerified = FALSE
    """)
    pending_therapists = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(pending_therapists), 200
    
@app.route('/verifyTherapist', methods=['POST'])
def verify_therapist():
    data = request.get_json()
    therapist_id = data.get('therapist_id')

    if not therapist_id:
        return jsonify({'error': 'therapist_id is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE Therapists SET isVerified = TRUE WHERE therapist_id = %s", (therapist_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'Therapist verified successfully'}), 200


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

@app.route('/updateSessionDuration', methods=['POST'])
def update_session_duration():
    data = request.get_json()
    user_id = data.get('user_id')
    session_duration = data.get('session_duration')

    if user_id is None or session_duration not in ['30', '45', '60']:
        return jsonify({"error": "Missing or invalid parameters"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE Therapists
        SET session_duration = %s
        WHERE user_id = %s
    """, (session_duration, user_id))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Session duration updated"}), 200

@app.route('/getAppointmentsByTherapist/<int:therapist_id>', methods=['GET'])
def get_appointments_by_therapist(therapist_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT date, time, status
            FROM Appointments
            WHERE therapist_id = %s
            ORDER BY date, time
        """, (therapist_id,))

        rows = cursor.fetchall()

        # Safely convert fields to string
        appointments = [
            {
                'date': row[0].strftime('%Y-%m-%d'),
                'time': f"{row[1].seconds//3600:02}:{(row[1].seconds//60)%60:02}",
                'status': row[2]
            }
            for row in rows
        ]

        cursor.close()
        connection.close()

        return jsonify(appointments), 200

    except Exception as e:
        print(f"[✖] Error retrieving appointments: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@app.route('/getAppointmentsByStudent/<int:student_id>', methods=['GET'])
def get_appointments_by_student(student_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT a.appointment_id, a.date, a.time, a.status, u.first_name, u.last_name
            FROM Appointments a
            JOIN Therapists t ON a.therapist_id = t.therapist_id
            JOIN Users u ON t.user_id = u.user_id
            WHERE a.student_id = %s
            ORDER BY a.date, a.time
        """, (student_id,))

        rows = cursor.fetchall()

        appointments = []
        for row in rows:
            appointment_id, date, time, status, first_name, last_name = row

            formatted_time = time.strftime('%H:%M') if hasattr(time, 'strftime') else str(time)

            appointments.append({
                'appointment_id': appointment_id,
                'date': date.strftime('%Y-%m-%d'),
                'time': formatted_time,
                'status': status,
                'therapist_name': f"{first_name} {last_name}"
            })

        cursor.close()
        connection.close()

        return jsonify(appointments), 200

    except Exception as e:
        print(f"[✖] Error fetching appointments for student {student_id}: {e}")
        return jsonify({'error': 'Failed to fetch appointments'}), 500

@app.route('/getSessionDuration/<int:user_id>', methods=['GET'])
def get_session_duration(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT session_duration
            FROM Therapists
            WHERE user_id = %s
        """, (user_id,))

        row = cursor.fetchone()

        cursor.close()
        connection.close()

        if row:
            return jsonify({'session_duration': row[0]}), 200
        else:
            return jsonify({'error': 'Therapist not found'}), 404

    except Exception as e:
        print(f"[✖] Error retrieving session duration: {e}")
        return jsonify({'error': 'Failed to fetch session duration'}), 500

@app.route('/cancelAppointment/<int:appointment_id>', methods=['DELETE'])
def cancel_appointment(appointment_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Get details before deleting
    cursor.execute("""
        SELECT a.date, a.time, a.location,
               s.student_id, u1.email AS student_email, u1.first_name AS student_name,
               t.therapist_id, u2.email AS therapist_email, u2.first_name AS therapist_name
        FROM Appointments a
        JOIN Students s ON a.student_id = s.student_id
        JOIN Users u1 ON s.user_id = u1.user_id
        JOIN Therapists t ON a.therapist_id = t.therapist_id
        JOIN Users u2 ON t.user_id = u2.user_id
        WHERE a.appointment_id = %s
    """, (appointment_id,))
    appt = cursor.fetchone()

    if not appt:
        cursor.close()
        connection.close()
        return jsonify({"error": "Appointment not found"}), 404

    # Delete appointment
    cursor.execute("DELETE FROM Appointments WHERE appointment_id = %s", (appointment_id,))
    connection.commit()
    cursor.close()
    connection.close()

    subject = "Appointment Cancelled"
    body = (
        f"Hi {appt['student_name']} and {appt['therapist_name']},\n\n"
        f"Your appointment on {appt['date']} at {appt['time']} in {appt['location']} has been cancelled.\n\n"
        "Please contact each other if needed."
    )
    try:
        mail.send(Message(subject, recipients=[appt['student_email']], body=body))
        mail.send(Message(subject, recipients=[appt['therapist_email']], body=body))
    except Exception as e:
        print("Cancellation email failed:", e)

    return jsonify({"message": "Appointment cancelled and emails sent."}), 200

@app.route('/getAppointmentsByUserId/<int:user_id>', methods=['GET'])
def get_appointments_by_user_id(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Step 1: Get therapist_id from Therapists table using user_id
        cursor.execute("""
            SELECT therapist_id FROM Therapists WHERE user_id = %s
        """, (user_id,))
        result = cursor.fetchone()

        if not result:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Therapist not found for the given user ID'}), 404

        therapist_id = result[0]

        # Step 2: Get all appointments for the therapist_id
        cursor.execute("""
            SELECT a.date, a.time, a.status, a.appointment_id, s.student_id
            FROM Appointments a
            JOIN Students s ON a.student_id = s.student_id
            WHERE a.therapist_id = %s
            ORDER BY a.date, a.time
        """, (therapist_id,))
        rows = cursor.fetchall()

        appointments = []
        
        for row in rows:
            date = row[0].strftime('%Y-%m-%d')
            time = f"{row[1].seconds // 3600:02}:{(row[1].seconds // 60) % 60:02}"
            status = row[2]
            appointment_id = row[3]
            student_id = row[4]

            # Step 3: Get student name from Users table using student_id
            cursor.execute("""
                SELECT u.first_name, u.last_name
                FROM Users u
                JOIN Students s ON u.user_id = s.user_id
                WHERE s.student_id = %s
            """, (student_id,))
            student_result = cursor.fetchone()

            if student_result:
                first_name, last_name = student_result
                student_name = f"{first_name} {last_name}"
            else:
                student_name = "Unknown"

            # Add the appointment with the student's name
            appointments.append({
                'student_name': student_name,
                'date': date,
                'time': time,
                'status': status,
                'appointment_id': appointment_id
            })

        cursor.close()
        connection.close()

        return jsonify(appointments), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/getAppointmentsForStudent/<int:user_id>', methods=['GET'])
def get_appointments_for_student(user_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Step 1: Get student_id using user_id
        cursor.execute("""
            SELECT student_id FROM Students WHERE user_id = %s
        """, (user_id,))
        result = cursor.fetchone()

        if not result:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Student not found for the given user ID'}), 404

        student_id = result[0]

        # Step 2: Get all appointments for the student
        cursor.execute("""
            SELECT a.date, a.time, a.status, a.appointment_id, t.therapist_id
            FROM Appointments a
            JOIN Therapists t ON a.therapist_id = t.therapist_id
            WHERE a.student_id = %s
            ORDER BY a.date, a.time
        """, (student_id,))
        rows = cursor.fetchall()

        appointments = []

        for row in rows:
            date = row[0].strftime('%Y-%m-%d')
            time = f"{row[1].seconds // 3600:02}:{(row[1].seconds // 60) % 60:02}"
            status = row[2]
            appointment_id = row[3]
            therapist_id = row[4]

            # Step 3: Get therapist name from Users table using therapist_id
            cursor.execute("""
                SELECT u.first_name, u.last_name
                FROM Users u
                JOIN Therapists t ON u.user_id = t.user_id
                WHERE t.therapist_id = %s
            """, (therapist_id,))
            therapist_result = cursor.fetchone()

            if therapist_result:
                first_name, last_name = therapist_result
                therapist_name = f"{first_name} {last_name}"
            else:
                therapist_name = "Unknown"

            appointments.append({
                'therapist_name': therapist_name,
                'date': date,
                'time': time,
                'status': status,
                'appointment_id': appointment_id
            })

        cursor.close()
        connection.close()

        return jsonify(appointments), 200

    except Exception as e:
        print(f"[✖] Error fetching student appointments: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/acceptAppointment/<int:appointment_id>', methods=['PUT'])
def accept_appointment(appointment_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check if the appointment exists
    cursor.execute("SELECT * FROM Appointments WHERE appointment_id = %s", (appointment_id,))
    appointment = cursor.fetchone()

    if not appointment:
        cursor.close()
        connection.close()
        return jsonify({"error": "Appointment not found"}), 404

    # Update the appointment status to 'accepted'
    cursor.execute("UPDATE Appointments SET status = %s WHERE appointment_id = %s", ("accepted", appointment_id))
    connection.commit()

    cursor.close()
    connection.close()
    subject = "Appointment Confirmed"
    body = (
        f"Hi {appointment['student_name']} and {appointment['therapist_name']},\n\n"
        f"Your appointment has been confirmed on {appointment['date']} at {appointment['time']} in {appointment['location']} .\n\n"
        "Please contact each other if needed."
    )
    try:
        mail.send(Message(subject, recipients=[appointment['student_email']], body=body))
        mail.send(Message(subject, recipients=[appointment['therapist_email']], body=body))
    except Exception as e:
        print("Confirmation email failed:", e)
    return jsonify({"message": "Appointment status updated to accepted."}), 200

@app.route('/rejectTherapist', methods=['DELETE'])
def reject_therapist():
    data = request.get_json()
    therapist_id = data.get('therapist_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM Therapists WHERE therapist_id = %s", (therapist_id,))
    result = cursor.fetchone()
    if not result:
        cursor.close()
        conn.close()
        return jsonify({'message': 'Therapist not found'}), 404

    user_id = result[0]
    cursor.execute("DELETE FROM Therapists WHERE therapist_id = %s", (therapist_id,))
    cursor.execute("DELETE FROM Users WHERE user_id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Therapist rejected and removed'})

@app.route('/get-linked-guardians', methods=['POST'])
def get_linked_guardians():
    data = request.get_json()
    user_id = safe_escape(data.get('user_id'))
    role = safe_escape(data.get('role', '').lower())

    if role != 'student':
        return jsonify({"error": "This route is only for student role"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get student_id from Students table
        cursor.execute("SELECT student_id FROM Students WHERE user_id = %s", (user_id,))
        student = cursor.fetchone()

        if not student:
            return jsonify({"error": "Student not found"}), 404

        student_id = student['student_id']

        # Get all linked guardians
        cursor.execute("""
            SELECT g.guardian_id, u.first_name, u.last_name, u.email, u.phone
            FROM ParentStudent ps
            JOIN Guardians g ON ps.guardian_id = g.guardian_id
            JOIN Users u ON g.user_id = u.user_id
            WHERE ps.student_id = %s
        """, (student_id,))

        guardians = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"guardians": guardians}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-linked-students', methods=['POST'])
def get_linked_students():
    data = request.get_json()
    user_id = safe_escape(data.get('user_id'))
    role = safe_escape(data.get('role', '').lower())

    if role != 'guardian':
        return jsonify({"error": "This route is only for guardian role"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get guardian_id from Guardians table
        cursor.execute("SELECT guardian_id FROM Guardians WHERE user_id = %s", (user_id,))
        guardian = cursor.fetchone()

        if not guardian:
            return jsonify({"error": "Guardian not found"}), 404

        guardian_id = guardian['guardian_id']

        # Get all linked students
        cursor.execute("""
            SELECT s.student_id, u.first_name, u.last_name, u.email, u.phone
            FROM ParentStudent ps
            JOIN Students s ON ps.student_id = s.student_id
            JOIN Users u ON s.user_id = u.user_id
            WHERE ps.guardian_id = %s
        """, (guardian_id,))

        students = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"students": students}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Entry point
if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
