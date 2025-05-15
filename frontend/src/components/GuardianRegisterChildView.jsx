import React, { useEffect, useState } from "react";
import '../css/register.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerChild } from '../Slices/authSlice';
import { useSelector } from "react-redux";


const GuardianRegisterChild = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'guardian') {
            navigate('/login');
        }
    }, [user, navigate]);
    
    if (!user) {
        return <div>Loading...</div>;
    }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        dateFields: {
            dobMonth: "",
            dobDay: "",
            dobYear: "",
        },
        guardian_id: user.guardian_id,
    })



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

    const handleNext = async () => {
    
        const { dobYear, dobMonth, dobDay } = formData.dateFields;

        let dob = null;
        if (dobYear && dobMonth && dobDay) { 
            dob = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
        }
        
        const fullFormData = {
            ...formData,
            dob: dob,
        };


    
        try {
            console.log("Form data before dispatch:", fullFormData);
            const result = await dispatch(registerChild(fullFormData));
            if (registerChild.fulfilled.match(result)) {
                navigate('/parent-dashboard'); // Navigate after 1 second

                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    address: "",
                    dateFields: {
                        dobMonth: "",
                        dobDay: "",
                        dobYear: "",
                    },
                    guardian_id: user.guardian_id,
                })

            } else {
                console.error('Registration failed:', result.payload);
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

    // Function to handle going back to the previous page
    const handleCancel = () => {
        navigate(-1); // Go back one step in the history
    };

    return (
        <div className="register-modal-container">
            <div className="register-modal-box">
                <header className="header">
                    <h1>Register Child</h1>
                    <p>Fill in the details below with child information.</p>
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
                            <input aria-required="true" id="email" maxLength={256} name="email" type="text" placeholder="Enter email address" value={formData.email} onChange={handleInputChange}  />
                        </div>
                        <div className="register-input">
                            <label>Phone number</label>
                            <input aria-required="true" id="phone" maxLength="10" name="phone" type="text" placeholder="Enter your phone number" value={formData.phone} onChange={handleInputChange}  />
                        </div>
                    </div>

                    {/* Address input */}
                    <div className="register-input-group">
                        <div className="register-input">
                            <label>Address</label>
                            <input aria-required="true" id="address" maxLength={256} name="address" type="text" placeholder="Enter your address" onChange={handleInputChange} value={formData.address} required />
                        </div>
                    </div>

                    {/* Date of birth */}
                    <div className="input-group">
                        <label>Date of Birth</label>
                        <fieldset style={{width: '660px', padding: '8px', border: '1px solid #ccc', borderRadius: '5px'}}>
                            <div className="date-of-birth-container">
                                <div className="field field-month">
                                    <label htmlFor="dobMonth">Month</label>
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

                                <div className="field field-day">
                                    <label htmlFor="dobDay">Day</label>
                                    <input aria-required="true" className="input-group" name= "dobDay"  id="dobDay" max="5" maxLength="2"
                                    min="1" type="number" value={formData.dateFields.dobDay} onChange={handleInputChange} required />
                                </div>

                                <div className="field field-year">
                                    <label htmlFor="dobYear">Year</label>
                                    <input aria-required="true" className="input-group" id="dobYear" max="9999" maxLength="4" min="1890" name="dobYear" type="number" value={formData.dateFields.dobYear} onChange={handleInputChange} required />
                                </div>
                            </div>

                        </fieldset>
                    </div>

                    
                    
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

export default GuardianRegisterChild; 
