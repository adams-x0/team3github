# tests/test_appointments.py
# Test: book_appointment - success
def test_book_appointment_success(client, mocker):
    mock_cursor = mocker.Mock()
    mock_connection = mocker.Mock()
    mock_connection.cursor.return_value = mock_cursor
    mocker.patch('app.get_db_connection', return_value=mock_connection)

    payload = {
        "student_id": 1,
        "therapist_id": 2,
        "date": "2025-05-20",
        "time": "14:00",
        "location": "Room A"
    }

    response = client.post('/bookAppointment', json=payload)
    assert response.status_code == 201
    assert response.get_json() == {"message": "Appointment booked successfully"}
    mock_cursor.execute.assert_called_once()


# Test: get_appointments_for_student - student not found
def test_get_appointments_student_not_found(client, mocker):
    mock_cursor = mocker.Mock()
    mock_cursor.fetchone.return_value = None
    mock_connection = mocker.Mock()
    mock_connection.cursor.return_value = mock_cursor
    mocker.patch('app.get_db_connection', return_value=mock_connection)

    response = client.get('/getAppointmentsForStudent/999')
    assert response.status_code == 404
    assert "Student not found" in response.get_data(as_text=True)


# Test: get_appointments_by_user_id - therapist not found
def test_get_appointments_therapist_not_found(client, mocker):
    mock_cursor = mocker.Mock()
    mock_cursor.fetchone.return_value = None
    mock_connection = mocker.Mock()
    mock_connection.cursor.return_value = mock_cursor
    mocker.patch('app.get_db_connection', return_value=mock_connection)

    response = client.get('/getAppointmentsByUserId/777')
    assert response.status_code == 404
    assert "Therapist not found" in response.get_data(as_text=True)

def test_get_appointments_for_student_success(client, mocker):
    # Arrange
    mock_conn = mocker.Mock()
    mock_cursor = mocker.Mock()
    mocker.patch('app.get_db_connection', return_value=mock_conn)
    mock_conn.cursor.return_value = mock_cursor

    # Step 1: simulate getting student_id from user_id
    mock_cursor.fetchone.side_effect = [
        (1,),  # student_id for user_id=1
        ('Kevin', 'Coless')  # therapist name
    ]

    # Step 2: simulate returning one appointment
    from datetime import datetime, timedelta
    mock_cursor.fetchall.return_value = [(
        datetime.strptime("2025-05-28", "%Y-%m-%d"),
        timedelta(hours=8, minutes=30),  # 08:30:00
        'pending',
        38,
        14  # therapist_id
    )]

    # Act
    response = client.get('/getAppointmentsForStudent/1')

    # Assert
    assert response.status_code == 200
    assert response.json == [{
        'therapist_name': 'Kevin Coless',
        'date': '2025-05-28',
        'time': '08:30',
        'status': 'pending',
        'appointment_id': 38
    }]

def test_get_appointments_by_therapist_success(client, mocker):
    mock_conn = mocker.Mock()
    mock_cursor = mocker.Mock()
    mocker.patch('app.get_db_connection', return_value=mock_conn)
    mock_conn.cursor.return_value = mock_cursor

    # Step 1: therapist_id lookup
    mock_cursor.fetchone.side_effect = [
        (14,),               # therapist_id for user_id=5
        ('Kevin', 'Coless')  # student name
    ]

    # Step 2: simulate appointment rows
    from datetime import datetime, timedelta
    mock_cursor.fetchall.return_value = [(
        datetime.strptime("2025-05-28", "%Y-%m-%d"),
        timedelta(hours=8, minutes=30),
        'pending',
        38,
        1  # student_id
    )]

    # Act
    response = client.get('/getAppointmentsByUserId/5')

    # Assert
    assert response.status_code == 200
    assert response.json == [{
        'student_name': 'Kevin Coless',
        'date': '2025-05-28',
        'time': '08:30',
        'status': 'pending',
        'appointment_id': 38
    }]


