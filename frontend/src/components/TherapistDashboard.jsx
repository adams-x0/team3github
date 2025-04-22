import React, { useState } from "react";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import { useNavigate } from 'react-router-dom';
import TherapistNavbar from "./therapistNavbar";



const TherapistDashboard = () => {
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState(dayjs());

    return (
        <div>
            <TherapistNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome to the Therapist Dashboard
                    </Typography>
    
                    {/* Calendar to Select Day */}
                    <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Manage Availability</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box
                                display="flex"
                                flexDirection={{ xs: "column", md: "row" }} gap={2} mt={3} 
                                justifyContent="space-between"
                            >
                                {/* Date Picker */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={(newValue) => setSelectedDate(newValue)}
                                    />
                                </LocalizationProvider>
    
                                {/* Action Buttons */}
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        fullWidth
                                        sx={{ mb: 3 }}
                                    >
                                        Cancel Availability
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Add Availability
                                    </Button>

                                    <Box mt={3}>
                                        <Typography variant="subtitle1">
                                            Available times for {selectedDate.format("MMMM Do, YYYY")}: None
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
    
                    {/* Manage Appointments */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Manage Appointments</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {/* Filters */}

                                <Typography variant="subtitle1" gutterBottom>
                                Filter by date</Typography>


                            {/* List of Appointments */}
                            <List>
                                {/* Sample Appointment 1 */}
                                <ListItem
                                    onClick={() => navigate('/therapist-dashboard')}
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
                                    secondaryAction={
                                        <Box display="flex" gap={1}>
                                            <Button variant="outlined" color="primary">Reschedule</Button>
                                            <Button variant="contained" color="error">Cancel</Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary="John Doe"
                                        secondary= "Monday, August 15, 2025 - 10:00 PM"
                                    />

                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* Pending Appointment Request */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Pending Appointment Request(s)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {/* Sample Pending Request 1 */}
                                <ListItem
                                    onClick={() => navigate('/therapist-dashboard')}
                                    sx={{
                                        border: '1px dashed #aaa',
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
                                    secondaryAction={
                                        <Box display="flex" gap={1}>
                                            <Button variant="outlined" color="primary">Accept</Button>
                                            <Button variant="contained" color="error">Reject</Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary="Liam Smith"
                                        secondary= "Requested: August 15, 2025 - 10:00 PM"
                                    />
                                </ListItem>
                            </List>

                        </AccordionDetails>
                    </Accordion>
    
                    {/* View History */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">View Past Session History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {/* Sample Session 1 */}
                                <ListItem
                                    onClick={() => navigate('/therapist-dashboard')}
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
                                    secondaryAction={
                                        <Button variant="outlined" color="primary">View Notes</Button>
                                    }
                                >
                                    <ListItemText
                                        primary="Martin Johnson"
                                        secondary= "Last session: August 15, 2023 - 10:00 PM"
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
    
                    {/* Find Student */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Find Student</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                label="Search by name"
                                fullWidth
                            />
                            <Box mt={2}>
                                <List>
                                    <ListItem
                                        onClick={() => navigate('/therapist-dashboard')}
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

export default TherapistDashboard;