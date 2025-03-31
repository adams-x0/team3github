import React, { useState } from "react";
import '../login.css';
import '../register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [role, setRole] = useState(""); // State for role
    const [username, setUsername] = useState(""); // State for 
    const [password, setPassword] = useState(""); // State for password
    const [email, setEmail] = useState(""); // State for email
    const [phone, setPhone] = useState(""); // State for phone number
    const [firstName, setFirstName] = useState(""); // State for first name
    const [lastName, setLastName] = useState(""); // State for last name
    const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
      // State variables for month, day, and year
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');

    const navigate = useNavigate(); // hook to navigate to previous page
    
    // Function to handle going back to the previous page
    const handleCancel = () => {
        navigate(-1); // Go back one step in the history
    };

    // Handle changes for month, day, and year
    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const handleDayChange = (event) => {
        setDay(event.target.value);
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    // Handle first name, last name, phone number and email changes
    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    };
    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    };

      // Save the selected values into a variable
    const saveDateOfBirth = () => {
        const dateOfBirth = {
        month: month,
        day: day,
        year: year
        };
        console.log("Selected Date of Birth:", dateOfBirth);
    // You can now use this data to save or send it to a server
    };

    return (
        <div className="modal-container">
            <div className="modal-box">
                <header className="header">
                    <h1>Sign Up</h1>
                </header>

                {/* Registration Form */}
                <form>
                    {/* Role Dropdown */}
                    <div className="input-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                            <option value="therapist_tutor">Therapist</option>
                        </select>
                    </div>
                    

                    {/* First Name */}
                    <div className="input-group">
                        <label>First Name</label>
                        <input aria-required="true" id="first_name" maxLength={256} name="first_name" type="text" placeholder="Enter First Name" value={firstName} onChange={handleFirstNameChange} required />
                    </div>

                    {/* Last Name */}
                    <div className="input-group">
                        <label>Last Name</label>
                        <input aria-required="true" id="last_name" maxLength={256} name="last_name" type="text" placeholder="Enter Last Name" value={lastName} onChange={handleLastNameChange} required />
                    </div>
                    

                    {/* Username Input */}
                    <div className="input-group">
                        <label>Username</label>
                        <input type="text" placeholder="Enter Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required />
                    </div>

                    {/* date of birth */}
                    <div className="input-group">
                        <label>Date of Birth</label>
                        <fieldset>
                            <div class="date-of-birth-container">
                                <div id="id_date_of_birth_month ">
                                    <label for="id_date_of_birth_month">Month</label>
                                    <select id="id_date_of_birth_month" name="date_of_birth_month" value={month} onChange={handleMonthChange}>
                                        <option value="0">Select</option>
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>

                                <div class="field field-day">
                                    <label for="id_date_of_birth_day">Day</label>
                                    <input aria-required="true" class="input-group" id="id_date_of_birth_day" max="31" maxlength="2"
                                    min="1" name="date_of_birth_day" type="number" value={day} onChange={handleDayChange} />
                                </div>

                                <div class="field field-year">
                                    <label for="id_date_of_birth_year">Year</label>
                                    <input aria-required="true" class="input-group" id="id_date_of_birth_year" max="9999" maxlength="4" min="1890" name="date_of_birth_year" type="number" value={year} onChange={handleYearChange} />
                                </div>
                            </div>

                        </fieldset>
                    </div>
                        

                    {/* Email Input */}
                    <div className="input-group">
                        <label>Email address</label>
                        <input aria-required="true" id="email" maxLength={256} name="email" type="text" placeholder="Enter email address" value={email} onChange={handleEmailChange} required />
                    </div>
                    

                    {/* Phone number */}
                    <div className="input-group">
                        <label>Phone number</label>
                        <input aria-required="true" id="phone_numberA" maxlength="10" name="phone_number" type="number" value={phone} onChange={handlePhoneChange} required />
                    </div>
                    
                    {/* Next */}
                    <div className="input-group">
                        <button type="button" className="login-btn">
                            Next
                        </button>
                    </div>

                    {/* Cancel Button */}
                    <div className="input-group">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                    
                </form>
            </div>
            
        </div>
    );
};

export default Register; 