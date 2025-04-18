import React, { useState } from "react";
import '../css/register.css'
import { useNavigate } from 'react-router-dom';
import {addUser} from '../Slices/SetSlice.jsx'
import zxcvbn from "zxcvbn"; // Import zxcvbn for password strength checking

const Register = () => {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
        address: "",
        dateFields: {
            dobMonth: "",
            dobDay: "",
            dobYear: "",
        },
    })

    const [passwordStrength, setPasswordStrength] = useState(0); // State to hold password strength
    const [passwordFocused, setPasswordFocused] = useState(false); // State to track if password input is focused
    const [passwordMatch, setPasswordMatch] = useState(false); // State to track if passwords match

    // Handle password change
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });

        const userInputs = [
            formData.firstName,
            formData.lastName,
            formData.username,
            formData.email,
            formData.phone,
        ]

        // Evaluate password strength
        const result = zxcvbn(newPassword, userInputs);
        setPasswordStrength(result.score); // Set password strength score

        // check password match immediately after password change
        if (newPassword === formData.confirmPassword) {
            setPasswordMatch(true);
        } else {
            setPasswordMatch(false);
        }
    }

    // Handle confirm password change
    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setFormData({ ...formData, confirmPassword: newConfirmPassword });

        // Check if passwords match
        if (newConfirmPassword === formData.password) {
            setPasswordMatch(true);
        } else {
            setPasswordMatch(false);
        }
    };


    // Helper function to get password strength label
    const getPasswordStrengthLabel = (score) => {
        switch (score) {
            case 0:
                return "very-weak";
            case 1:
                return "weak";
            case 2:
                return "fair";
            case 3:
                return "strong";
            case 4:
                return "very-strong";
            default:
                return "";
        }
    }

    

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name in formData) {
            // Update general fields
            setFormData({ ...formData, [name]: value });
        } else if (name in formData.dateFields) {
            setFormData({
                ...formData,
                dateFields: { ...formData.dateFields, [name]: value }
            })
        } 
    }

    // Handle next button click
    const handleNext = async () => { 
        // Ensure passwords match
        if (formData.password !== formData.confirmPassword) {
            return;
        }
        try {
            await addUser(formData);
            alert("User registered successfully!");
        } catch (error) {
            console.error("Registration failed:", error);
        }
        console.log(formData); // Log form data to console
    }

    const navigate = useNavigate(); // hook to navigate to previous page
    
    // Function to handle going back to the previous page
    const handleCancel = () => {
        navigate(-1); // Go back one step in the history
    };


    return (
        <div className="register-modal-container">
            <div className="register-modal-box">
                <header className="header">
                    <h1>Sign Up</h1>
                </header>

                {/* Registration Form */}
                <form>
                    {/* First & Last Name */}
                    <div className="register-input-group">
                        <div className="register-input">
                            <label>First name</label>
                            <input aria-required="true" id="firstName" maxLength={256} name="firstName" type="text" placeholder="Enter first name" value={formData.firstName} onChange={handleInputChange} required />
                        </div>
                        <div className="register-input">
                            <label>Last name</label>
                            <input aria-required="true" id="lastName" maxLength={256} name="lastName" type="text" placeholder="Enter last name" value={formData.lastName} onChange={handleInputChange} required />
                        </div>
                    </div>
                    
                    {/* Email & Phone Number Input */}
                    <div className="register-input-group">
                        <div className="register-input">
                            <label>Email address</label>
                            <input aria-required="true" id="email" maxLength={256} name="email" type="text" placeholder="Enter email address" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="register-input">
                            <label>Phone number</label>
                            <input aria-required="true" id="phone" maxlength="10" name="phone" type="text" placeholder="Enter your phone number" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                    </div>       

                    {/* Address & Role input */}
                    <div className="register-input-group">
                        <div className="register-input">
                            <label>Address</label>
                            <input aria-required="true" id="address" maxLength={256} name="address" type="text" placeholder="Enter your address" onChange={handleInputChange} value={formData.dateFields.address} required />
                        </div>
                        <div className="register-input">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleInputChange} required>
                                <option value="" disabled selected>Enter your role</option>
                                <option value="student">Student</option>
                                <option value="guardian">Guardian</option>
                                <option value="therapist">Therapist</option>
                            </select>
                        </div>
                    </div>

                    {/* Date of birth */}
                    <div className="input-group">
                        <label>Date of Birth</label>
                        <fieldset style={{width: '665px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}>
                            <div class="date-of-birth-container">
                                <div className="field field-month">
                                    <label for="dobMonth">Month</label>
                                    <select id="dobMonth" name="dobMonth" value={formData.dateFields.dobMonth} onChange={handleInputChange} required>
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
                                    <label for="dobDay">Day</label>
                                    <input aria-required="true" class="input-group" name= "dobDay"  id="dobDay" max="5" maxlength="2"
                                    min="1" type="number" value={formData.dateFields.dobDay} onChange={handleInputChange} required />
                                </div>

                                <div class="field field-year">
                                    <label for="dobYear">Year</label>
                                    <input aria-required="true" class="input-group" id="dobYear" max="9999" maxlength="4" min="1890" name="dobYear" type="number" value={formData.dateFields.dobYear} onChange={handleInputChange} required />
                                </div>
                            </div>

                        </fieldset>
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <label>Password</label>
                        <input aria-required="true" id="password" maxLength={256} name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handlePasswordChange} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} required />
                    </div>

                    {/*Confirm password input */}
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input aria-required="true" id="confirmPassword" maxLength={256} name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleConfirmPasswordChange} required />
                    </div>

                    {/* Password Strength Label */}
                    {formData.password && passwordFocused && (
                        <div className={`password-strength ${getPasswordStrengthLabel(passwordStrength).toLowerCase()}`}>
                            <p>Password Strength: {getPasswordStrengthLabel(passwordStrength)}</p>
                        </div>
                    )}

                    {/* Password Match Error Message  */}
                    {!passwordMatch && formData.confirmPassword && (
                        <div className="password-match-error">
                            <p>Passwords do not match</p>
                        </div>
                    )}

                    
                    
                    {/* Next */}
                    <div className="input-group">
                        <button type="button" className="register-btn" onClick={handleNext}>
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
