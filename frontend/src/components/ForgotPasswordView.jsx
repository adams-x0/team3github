import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../login.css';


const ForgotPassword = () => {
    const [id, setId] = useState("");
    const navigate = useNavigate(); // hook to navigate to previous page

    // Function to handle going back to the previous page
    const handleCancel = () => {
        navigate(-1); // Go back one step in the history
    };

    // Handle ID change
    const handleIdChange = (event) => {
        setId(event.target.value);
        console.log("ID changed:", event.target.value);
    };
    return (
        <div className="modal-container">
            {/* Modal Box */}
            <div className="modal-box">
                <header className="header">
                <h1>Password Reset</h1>
                </header>

                {/* Form */}
                <form>
                    {/* ID */}
                    <div className="input-group">
                        <label>Email</label>
                        <input type="text" value={id} onChange={handleIdChange} placeholder="Enter email address" style={{ width: '95%', fontSize: '13px' }} required />
                    </div>

                    {/* Submit Button */}
                    <div className="input-group">
                        <button type="button" className="login-btn">
                            Submit
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
    )
}


export default ForgotPassword;