from datetime import datetime

class Appointment:
    def __init__(self, student_id, therapist_id, date, time, status='pending', appointment_id=None, location):
        self.appointment_id = appointment_id
        self.student_id = student_id
        self.therapist_id = therapist_id
        self.date = date            # expected: 'YYYY-MM-DD'
        self.time = time            # expected: 'HH:MM'
        self.status = status
        self.location = location

    def get_datetime(self):
        return datetime.strptime(f"{self.date} {self.time}", "%Y-%m-%d %H:%M")

    def is_upcoming(self):
        return self.get_datetime() > datetime.now()

    def to_dict(self):
        return {
            "appointment_id": self.appointment_id,
            "student_id": self.student_id,
            "therapist_id": self.therapist_id,
            "date": self.date,
            "time": self.time,
            "status": self.status
            "location": self.location
        }

    def __repr__(self):
        return (f"<Appointment {self.appointment_id}: {self.student_id} with {self.therapist_id} "
                f"on {self.date} at {self.time} in {self.location} - {self.status}>")
