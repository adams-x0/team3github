import React from "react";
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
    const navigate = useNavigate()

    return (
        <div>
            <AdminNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome to the Admin Dashboard
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
                                {/* Sample: Pending Therapist Request 1 */}
                                <ListItem
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: 2,
                                        mb: 1,
                                        transition: 'background-color 0.3s',
                                        '&:hover': { backgroundColor: 'action.hover',
                                        },
                                        '&:focus': {
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                        }
                                    }}
                                    onClick={() => navigate('/admin-dashboard')}
                                >
                                    <ListItemText
                                        primary="Dr. Olivia Brown"
                                        secondary="Specialization: Clinical Psychology | Requested: August 15, 2024 - 10:00 PM"
                                    />
                                    <Box display="flex" gap={1}>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the ListItem onClick
                                            }}
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the ListItem onClick
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </Box>

                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>


                    {/* Monitor Appointments */}
                    <Accordion sx={{ mb: 5 }}>
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
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Sample Appointment 1 */}
                                        <TableRow>
                                            <TableCell>John Doe</TableCell>
                                            <TableCell>Dr. Smith</TableCell>
                                            <TableCell>Clinical Psychology</TableCell>
                                            <TableCell>August 15, 2025</TableCell>
                                            <TableCell>10:00 PM</TableCell>
                                        </TableRow>
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
                    {/* Find Student / Therapist */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Find Student / Therapist</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                label="Search by name / specialization"
                                fullWidth
                            />
                            <Box mt={2}>
                                <List>
                                    <ListItem
                                        onClick={() => navigate('/admin-dashboard')}
                                        sx={{
                                            border: '1px solid #ccc',
                                            borderRadius: 2,
                                            mb: 1,
                                            transition: 'background-color 0.3s',
                                            '&:hover': { backgroundColor: 'action.hover',
                                            },
                                            '&:focus': {
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary="Mark Kuzo"
                                            secondary="Role: Student"
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>
        </div>
    );
};

export default AdminDashboard;