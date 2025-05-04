import React, { useEffect, useRef, useState } from "react";
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
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Checkbox
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
    const hasFetchedAvailability = useRef(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [applyToNext5Weeks, setApplyToNext5Weeks] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    //Use Effect updates the Backend with new availability
    useEffect(() => {
        if (calendarType === 'default' && user) {
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
        if (user && !hasFetchedAvailability.current) {
            dispatch(fetchTherapistAvailabilityByUserId(user.user_id));
            hasFetchedAvailability.current = true;
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (calendarType === 'default' && defaultAvailability?.default_availability) {
            try {
                const parsed = JSON.parse(defaultAvailability.default_availability);
                setEvents(parsed);
            } catch (err) {
                console.error("Failed to parse default availability:", err);
                setEvents([]); // fail gracefully
            }
        } else {
            setEvents([]); // clear events if switching or empty
        }
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
                                        color="error"
                                        onClick={() => setIsResetModalOpen(true)}
                                    >
                                        Reset Default Availability
                                    </Button>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                            checked={applyToNext5Weeks}
                                            onChange={() => setApplyToNext5Weeks(!applyToNext5Weeks)}
                                            />
                                        }
                                        label="Repeat for next 5 weeks"
                                    />
                                    {/*
                                    <Button
                                        variant="contained"
                                        onClick={() => setCalendarType('specificDate')}
                                        disabled={true}
                                    >
                                        Show & Change Specific Date Availability
                                    </Button>
                                    */}
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
                                        initialDate={new Date()}   // Set the start date for the calendar (generic week)
                                        selectable={true}
                                        editable={true}
                                        events={events}
                                        eventClick={(info) => {
                                            setSelectedEvent(info.event);
                                            setIsModalOpen(true);
                                        }}
                                        select={(info) => {
                                            const title = 'Available';
                                            const startDate = new Date(info.start);
                                            const endDate = new Date(info.end);
                                            const newEvents = [];
                                            const generateEvent = (offset) => {
                                                const start = new Date(startDate);
                                                const end = new Date(endDate);
                                                start.setDate(start.getDate() + offset);
                                                end.setDate(end.getDate() + offset);
                                                const startStr = start.toISOString();
                                                const endStr = end.toISOString();
                                                // Check for existing identical event
                                                const exists = events.some(
                                                    (event) => event.start === startStr && event.end === endStr
                                                );
                                                if (!exists) {
                                                    newEvents.push({ title, start: startStr, end: endStr });
                                                }
                                            };
                                            generateEvent(0); // current week
                                            if (applyToNext5Weeks) {
                                                for (let i = 1; i <= 5; i++) {
                                                    generateEvent(i * 7);
                                                }
                                            }
                                            setEvents((prev) => [...prev, ...newEvents]);
                                        }}
                                        height="600px"
                                    /> : <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        themeSystem="bootstrap5"
                                        initialDate={new Date()}   // Set the start date for the calendar (generic week)
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
                                            setSelectedEvent(info.event);
                                            setIsModalOpen(true);
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
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle>Delete Availability</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this availability?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => {
                                setEvents(events.filter(
                                e => !(
                                    new Date(e.start).getTime() === new Date(selectedEvent.start).getTime() &&
                                    new Date(e.end).getTime() === new Date(selectedEvent.end).getTime()
                                )
                                ));
                                setIsModalOpen(false);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
                    <DialogTitle>Confirm Reset</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to reset all default availability? This cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
                        <Button
                        color="error"
                        onClick={() => {
                            setEvents([]); // Clear calendar UI
                            dispatch(updateDefaultAvailability([])); // Update backend
                            setIsResetModalOpen(false);
                        }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );    
};

export default TherapistDashboard;