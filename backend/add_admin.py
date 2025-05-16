import mysql.connector
import bcrypt

# Admin credentials (change as needed)
email = "admin@example.com"
password = "StrongPass123!"
first_name = "Alice"
last_name = "Admin"
phone = "1234567890"
address = "123 Admin Blvd"
dob = "1990-01-01"  # format: YYYY-MM-DD
role = "admin"

# Hash the password
hashed_password = bcrypt.hashpw(password.encode(
    'utf-8'), bcrypt.gensalt()).decode('utf-8')

try:
    # Connect to the DB
    conn = mysql.connector.connect(
        host="team3db.cjmg4mysketj.us-east-2.rds.amazonaws.com",
        user="admin",
        password="team3password",
        database="team3db",
        port=3306
    )
    cursor = conn.cursor(dictionary=True)

    # Check for existing user
    cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
    if cursor.fetchone():
        print("❌ User with this email already exists.")
    else:
        # Insert into Users
        cursor.execute("""
            INSERT INTO Users (email, password, first_name, last_name, phone, address, role, dob)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (email, hashed_password, first_name, last_name, phone, address, role, dob))

        user_id = cursor.lastrowid

        # Insert into Admins
        cursor.execute("INSERT INTO Admins (user_id) VALUES (%s)", (user_id,))

        conn.commit()
        print(
            f"✅ Admin '{email}' created successfully with user_id = {user_id}")

    cursor.close()
    conn.close()

except Exception as e:
    print("❌ Error creating admin:", e)
