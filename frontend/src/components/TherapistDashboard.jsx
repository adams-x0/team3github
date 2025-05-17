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
    FormControl,
    FormLabel,
    Checkbox,
    Select,
    MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import TherapistNavbar from "./therapistNavbar";
import {
    fetchTherapistAvailabilityByUserId,
    updateDefaultAvailability,
    updateSessionDuration,
    getAppointmentsByUserId,
    cancelAppointment,
    acceptAppointment,
    fetchSessionDuration
} from '../Slices/authSlice'
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
    const hasFetchedAvailability = useRef(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [applyToNext5Weeks, setApplyToNext5Weeks] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const sessionDuration = useSelector((state) => state.auth.sessionDuration);
    const therapistAppointments = useSelector((state) => state.auth.therapistAppointments)
    const nonPendingAppointments = therapistAppointments?.filter((appointment) => appointment?.status !== 'pending')
    const pendingAppointments = therapistAppointments?.filter((appointment) => appointment?.status === 'pending')
    const cancellationStatus = useSelector((state) => state.auth.cancellationStatus)
    const availabilityLoading = useSelector((state) => state.auth.availabilityLoading)
    const accepted = useSelector((state) => state.auth.acceptStatus)

    useEffect(() => {
        if (user ||
            cancellationStatus === 'succeeded' ||
            cancellationStatus === 'loading' ||
            accepted === 'loading' ||
            accepted === 'succeeded') {
            dispatch(getAppointmentsByUserId(user.user_id))
        }
    }, [user, dispatch, cancellationStatus, accepted])

    useEffect(() => {
        if (user) {
            dispatch(fetchSessionDuration(user.user_id));
        }
    }, [user, dispatch])

    //Use Effect updates the Backend with new availability
    useEffect(() => {
        if (user && !availabilityLoading) {
            const formattedAvailability = events.map(event => ({
                title: event.title,
                start: event.start,
                end: event.end,
            }));
            dispatch(updateDefaultAvailability(formattedAvailability));
        }
    }, [events, user, dispatch, availabilityLoading]);

    // Fetch therapist availability when the user changes
    useEffect(() => {
        if (user && !hasFetchedAvailability.current) {
            dispatch(fetchTherapistAvailabilityByUserId(user.user_id));
            hasFetchedAvailability.current = true;
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (defaultAvailability?.default_availability) {
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
    }, [defaultAvailability]);

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
                                        color="error"
                                        onClick={() => setIsResetModalOpen(true)}
                                    >
                                        Reset Default Availability
                                    </Button>
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <FormLabel>Preferred Appointment Length</FormLabel>
                                        <Select
                                            value={sessionDuration}
                                            onChange={(e) => dispatch(updateSessionDuration(e.target.value))}
                                            size="small"
                                        >
                                            <MenuItem value="30">30 Minutes</MenuItem>
                                            <MenuItem value="45">45 Minutes</MenuItem>
                                            <MenuItem value="60">60 Minutes</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                            checked={applyToNext5Weeks}
                                            onChange={() => setApplyToNext5Weeks(!applyToNext5Weeks)}
                                            />
                                        }
                                        label="Repeat for next 5 weeks"
                                    />
                                </Box>
                                {/* Right Column for Calendar */}
                                <Box flex={1}>
                                    <Typography fontSize={40} fontWeight={2}>
                                        Default Availability Schedule
                                    </Typography>
                                    <FullCalendar
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
                                    />
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
                            {/* List of Non-Pending Appointments */}
                            <List>
                                {nonPendingAppointments.length === 0 ? (
                                    <Typography>No accepted appointments found.</Typography>
                                ) : ( nonPendingAppointments?.map((appointment, index) => (
                                        <ListItem
                                            key={index}
                                            onClick={() => navigate('/therapist-dashboard')}
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
                                            secondaryAction={
                                                <Box display="flex" gap={1}>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => dispatch(cancelAppointment(appointment.appointment_id))}
                                                >
                                                    Cancel
                                                </Button>
                                                </Box>
                                            }
                                        >
                                        <ListItemText
                                            primary={appointment.student_name}
                                            secondary={`${appointment.date} - ${appointment.time}`}
                                        />
                                        </ListItem>
                                    )
                                ))}
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
                                {pendingAppointments.length === 0 ? (
                                    <Typography>No pending appointments found.</Typography>
                                ) : ( pendingAppointments?.map((appointment, index) => (
                                        <ListItem
                                            key={index}
                                            onClick={() => navigate('/therapist-dashboard')}
                                            sx={{
                                            border: '1px dashed #aaa',
                                            borderRadius: 2,
                                            mb: 1,
                                            transition: 'background-color 0.3s',
                                            '&:hover': { backgroundColor: 'action.hover' },
                                            '&:focus': {
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                            }
                                            }}
                                            secondaryAction={
                                            <Box display="flex" gap={1}>
                                                <Button onClick={() => dispatch(acceptAppointment(appointment.appointment_id))} variant="outlined" color="primary">Accept</Button>
                                                <Button onClick={() => dispatch(cancelAppointment(appointment.appointment_id))} variant="contained" color="error">Reject</Button>
                                            </Box>
                                            }
                                        >
                                        <ListItemText
                                            primary={appointment.student_name}
                                            secondary={`Requested: ${appointment.date} - ${appointment.time}`}
                                        />
                                        </ListItem>
                                    )
                                ))}
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