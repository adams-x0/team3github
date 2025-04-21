from datetime import datetime

class Appointment:
    def __init__(self, student_id, therapist_id, date, time, status='pending', appointment_id=None):
        self.appointment_id = appointment_id
        self.student_id = student_id
        self.therapist_id = therapist_id
        self.date = date            # expected: 'YYYY-MM-DD'
        self.time = time            # expected: 'HH:MM'
        self.status = status

    def get_datetime(self):
        """Returns the full datetime object of the appointment"""
        return datetime.strptime(f"{self.date} {self.time}", "%Y-%m-%d %H:%M")

    def is_upcoming(self):
        """Checks if the appointment is in the future"""
        return self.get_datetime() > datetime.now()

    def to_dict(self):
        """Returns a dictionary representation of the appointment"""
        return {
            "appointment_id": self.appointment_id,
            "student_id": self.student_id,
            "therapist_id": self.therapist_id,
            "date": self.date,
            "time": self.time,
            "status": self.status
        }

    def __repr__(self):
        return (f"<Appointment {self.appointment_id}: "
                f"{self.student_id} with {self.therapist_id} on {self.date} at {self.time} - {self.status}>")
