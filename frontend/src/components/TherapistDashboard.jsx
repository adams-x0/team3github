import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import TherapistNavbar from "./therapistNavbar";
import { fetchTherapistAvailabilityByUserId, updateDefaultAvailability } from '../Slices/authSlice'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';



const TherapistDashboard = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const defaultAvailability = useSelector((state) => state.auth.defaultAvailability);
    const [events, setEvents] = useState([]);
    const [calendarType, setCalendarType] = useState('default'); // default or specificDate

    // UseEffect to update backend when events change
    useEffect(() => {
        if (calendarType === 'default' && events.length > 0 && user) {
            const formattedAvailability = events.map(event => ({
                title: event.title,
                start: event.start,
                end: event.end,
            }));
            dispatch(updateDefaultAvailability(formattedAvailability));
        }
    }, [events, calendarType, user, dispatch]);

    // Fetch therapist availability when the user changes
    useEffect(() => {
        if (user) {
            dispatch(fetchTherapistAvailabilityByUserId(user.user_id));
        }
    }, [user, dispatch]);

    useEffect(() => {
        defaultAvailability?.default_availability && setEvents(JSON.parse(defaultAvailability?.default_availability))
    }, [defaultAvailability, calendarType]);
    
    useEffect(() => { 
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'therapist') {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <TherapistNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome, {user.first_name} {user.last_name}
                    </Typography>

                    {/* Calendar to Select Day */}
                    <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Manage Availability</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex">
                                {/* Left Column for Buttons */}
                                <Box display="flex" flexDirection="column" mr={4}>
                                    <Button
                                        variant="contained"
                                        onClick={() => setCalendarType('default')}
                                        sx={{ mb: 2 }}>
                                        Show & Change Default Availability
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setCalendarType('specificDate')}>
                                        Show & Change Specific Date Availability
                                    </Button>
                                </Box>

                                {/* Right Column for Calendar */}
                                <Box flex={1}>
                                    <Typography fontSize={40} fontWeight={2}>
                                        {calendarType === 'default' ? 'Default Availability Schedule' : 'Weekly Availability Schedule'}
                                    </Typography>
                                    {calendarType === 'default' ? <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        themeSystem="bootstrap5"
                                        initialView="timeGridWeek"  // Use dayGridWeek for week view without dates
                                        initialDate="2025-01-01"   // Set the start date for the calendar (generic week)
                                        selectable={true}
                                        editable={true}
                                        events={events}
                                        dayHeaderFormat={{ weekday: 'short' }}  // Show only weekday names
                                        headerToolbar={{  // Remove navigation controls (previous, next, today)
                                            left: '',
                                            center: 'title',
                                            right: ''
                                        }}
                                        eventClick={(info) => {
                                            alert('Event: ' + info.event.title);
                                        }}
                                        select={(info) => {
                                            const title = 'Available'
                                            const newEvent = {
                                                title,
                                                start: info.startStr,
                                                end: info.endStr,
                                            };
                                            setEvents([...events, newEvent]);
                                        }}
                                        height="600px"
                                    /> :<FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        themeSystem="bootstrap5"
                                        initialDate="2025-01-01"   // Set the start date for the calendar (generic week)
                                        initialView="timeGridWeek"
                                        selectable={true}
                                        editable={true}
                                        events={events}
                                        select={(info) => {
                                            const title = prompt('Enter session title:');
                                            if (title) {
                                                const newEvent = {
                                                    title,
                                                    start: info.startStr,
                                                    end: info.endStr,
                                                };
                                                setEvents([...events, newEvent]);
                                        }
                                        }}
                                        eventClick={(info) => {
                                            alert('Event: ' + info.event.title);
                                        }}
                                        height="600px"
                                    />}
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
                                Filter by date
                            </Typography>
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
                            <Typography variant="h6">View Session History</Typography>
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