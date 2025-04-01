class Therapist:
    def __init__(self,  first_name, last_name, phone_number, password, email_address):
        self.first_name = first_name
        self.last_name = last_name
        self.phone_number = phone_number
        self.password = password
        self.email_address = email_address
        pass

    def get_first_name(self):
        return self.first_name
    
    def get_last_name(self):
        return self.last_name
    
    def get_full_name(self):
        return self.first_name + " " + self.last_name

    def get_phone_number(self):
        return self.phone_number
    
    def get_password(self):
        return self.password
    
    def get_email_address(self):
        return self.email_address
    
