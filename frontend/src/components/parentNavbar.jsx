import React, { useState} from "react";
import {
    AppBar,
    Toolbar,
    Button,
    Drawer,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutUser } from '../Slices/authSlice';


const ParentNavbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate()
    const dispatch = useDispatch();
    
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login')
    };

    // Dummy children list
    const children = ["John Doe", "Jane Smith", "Alice Johnson"];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Drawer Toggle */}
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Home Button */}
                    <Link to="/parent-dashboard" style={{ textDecoration: 'none', flexGrow: 1 }}>
                        <Button color="secondary">
                            <HomeIcon style={{ marginRight: '8px' }} />
                            {/* Add Home Icon */}
                        </Button>
                    </Link>

                    {/* Profile Button */}
                    <Link to="/parent-dashboard" style={{ textDecoration: 'none' }}>
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
            {/* Side Drawer */}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div style={{ width: 250 }}>
                    <Typography variant="h6" style={{ padding: "16px" }}>
                        Children List
                    </Typography>
                
                    <Divider />
                    <List>
                        {children.map((child, index) => (
                            <ListItem button key={index}>
                                <ListItemText primary={child} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            
            </Drawer>
        </>
    )
}

export default ParentNavbar;
