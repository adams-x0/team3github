class Therapist:
    def __init__(self, first_name, last_name, date_of_birth, phone_number, address, password, email_address):
        self.first_name = first_name
        self.last_name = last_name
        self.date_of_birth = date_of_birth
        self.phone_number = phone_number
        self.address = address
        self.password = password
        self.email_address = email_address
        # self.license_number = license_number

    # Getters
    def get_first_name(self):
        return self.first_name

    def get_last_name(self):
        return self.last_name

    def get_full_name(self):
        return self.first_name + " " + self.last_name

    def get_date_of_birth(self):
        return self.date_of_birth

    def get_phone_number(self):
        return self.phone_number

    def get_address(self):
        return self.address

    def get_password(self):
        return self.password

    def get_email_address(self):
        return self.email_address

    # Setters
    def set_first_name(self, first_name):
        self.first_name = first_name

    def set_last_name(self, last_name):
        self.last_name = last_name

    def set_date_of_birth(self, date_of_birth):
        self.date_of_birth = date_of_birth

    def set_phone_number(self, phone_number):
        self.phone_number = phone_number

    def set_address(self, address):
        self.address = address

    def set_password(self, password):
        self.password = password

    def set_email_address(self, email_address):
        self.email_address = email_address

    
