import React from "react";
import { AppBar, Toolbar, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutUser } from '../Slices/authSlice';


const StudentNavbar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login')
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Home Button */}
                <Link to="/student-dashboard" style={{ textDecoration: 'none', flexGrow: 1 }}>
                    <Button color="secondary">
                        <HomeIcon style={{ marginRight: '8px' }} />
                        {/* Add Home Icon */}
                    </Button>
                </Link>

                {/* Profile Button */}
                <Link to="/student-dashboard" style={{ textDecoration: 'none' }}>
                    <Button color="secondary">
                        <AccountCircleIcon style={{ marginRight: '8px' }} />
                        {/* Add Profile Icon */}

                    </Button>
                </Link>

                {/* Logout Button */}
                <Button color="secondary" onClick={handleLogout}>
                    <LogoutIcon style={{ marginRight: '8px' }} />
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default StudentNavbar;
