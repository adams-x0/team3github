import React from "react";
import { AppBar, Toolbar, Button, Typography } from '@mui/material' 
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';


const StudentNavbar = () => {
    const handleLogout = () => {
        // Handle logout logic, such as clearing ssion or local storage
        console.log("Logout clicked");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Home Button */}
                <Link to="/student-dashboard" style={{ textDecoration: 'none', flexGrow: 1 }}>
                    <Button color="inherit">
                        <HomeIcon style={{ marginRight: '8px' }} />
                        {/* Add Home Icon */}
                    </Button>
                </Link>

                {/* Profile Button */}
                <Link to="/student-dashboard" style={{ textDecoration: 'none' }}>
                    <Button color="inherit">
                        <AccountCircleIcon style={{ marginRight: '8px' }} />
                        {/* Add Profile Icon */}

                    </Button>
                </Link>

                {/* Logout Button */}
                <Button color="inherit" onClick={handleLogout}>
                    <LogoutIcon style={{ marginRight: '8px' }} />
                </Button>
            </Toolbar>   
        </AppBar>
    )
}

export default StudentNavbar;
