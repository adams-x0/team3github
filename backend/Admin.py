class Admin:
    def __init__(self, password, email_address):
        self.password = password
        self.email_address = email_address
        pass
    
    def get_password(self):
        return self.password
    
    def get_email_address(self):
        return self.email_address
