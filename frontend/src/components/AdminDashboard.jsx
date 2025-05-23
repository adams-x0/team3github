import React, { use, useEffect, useState } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from 'react-router-dom';
import AdminNavbar from "./adminNavbar";
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAppointmentsByAdmin } from "../Slices/authSlice";

import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
} from '@mui/material';

const openComplaints = 5


const AdminDashboard = () => {
    const dispatch = useDispatch();
    const adminAppointments = useSelector((state) => state.auth.adminAppointments);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [pendingTherapists, setPendingTherapists] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'admin') {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => { 
        dispatch(fetchAllAppointmentsByAdmin());
    }, [dispatch]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/getPendingTherapists')
            .then(res => res.json())
            .then(data => setPendingTherapists(data))
            .catch(err => console.error('Failed to fetch therapists', err));
    }, []);



    const approveTherapist = (therapist_id) => {
        fetch('http://127.0.0.1:5000/verifyTherapist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ therapist_id }),
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            setPendingTherapists(prev => prev.filter(t => t.therapist_id !== therapist_id));
        });
    };

    const rejectTherapist = (therapist_id) => {
        fetch('http://127.0.0.1:5000/rejectTherapist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ therapist_id }),
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            setPendingTherapists(prev => prev.filter(t => t.therapist_id !== therapist_id));
        });
    };

    if (!user) {
        return <div>Loading...</div>;
    }


    return (
        <div>
            <AdminNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome, {user.first_name} {user.last_name}

                    </Typography>

                    {/* View Complaints */}
                    <Box sx={{ mb: 5, mt: 5 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin-dashboard')}
                            startIcon={
                                <Badge badgeContent={openComplaints} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            }
                        >
                            View Complaints / Tickets
                        </Button>
                    </Box>
                    {/* Approve Therapist Requests Accordion */}
                    <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Approve Therapist Requests</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {pendingTherapists.length === 0 ? (
                                    <Typography>No pending therapist requests.</Typography>
                                ) : (
                                    pendingTherapists.map(t => (
                                        <ListItem
                                            key={t.therapist_id}
                                            sx={{
                                                border: "1px solid #ccc",
                                                borderRadius: 2,
                                                mb: 1,
                                                transition: 'background-color 0.3s',
                                                '&:hover': { backgroundColor: 'action.hover' },
                                                '&:focus': {
                                                    backgroundColor: 'primary.main',
                                                    color: 'white',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={`${t.first_name} ${t.last_name}`}
                                                secondary={`Specialization: ${t.specialization} | Email: ${t.email}`}
                                            />
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => approveTherapist(t.therapist_id)}
                                                >
                                                    Approve
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => rejectTherapist(t.therapist_id)}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* Monitor Appointments */}
                    <Accordion sx={{mt: 5, mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Monitor Appointments</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Student</strong></TableCell>
                                            <TableCell><strong>Therapist</strong></TableCell>
                                            <TableCell><strong>Specialization</strong></TableCell>
                                            <TableCell><strong>Appointment Date</strong></TableCell>
                                            <TableCell><strong>Appointment Time</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {adminAppointments && adminAppointments.length > 0 ? (
                                            adminAppointments.map((appt, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{appt.student}</TableCell>
                                                    <TableCell>{appt.therapist}</TableCell>
                                                    <TableCell>{appt.specialization}</TableCell>
                                                    <TableCell>{appt.date}</TableCell>
                                                    <TableCell>{appt.time}</TableCell>
                                                    <TableCell>{appt.status}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    No appointments found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* View All History Button */}
                            <Box display={"flex"} justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/admin-dashboard')}
                                >
                                    View History
                                </Button>
                            </Box>

                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>
        </div>
    );
};

export default AdminDashboard;
