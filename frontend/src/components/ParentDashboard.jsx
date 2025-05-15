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
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
    TableContainer,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { fetchAllTherapists } from "../Slices/GetSlice"
import { bookAppointment, getAppointmentsByTherapistId } from '../Slices/authSlice'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import ParentNavbar from "./parentNavbar";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

const ParentDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [sortBy, setSortBy] = useState('first_name'); // Default sorting by first name
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
    const [availableTimes, setAvailableTimes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [openTimesModal, setOpenTimesModal] = useState(false);
    const [therapistAppointments, setTherapistAppointments] = useState([]);
    
    
    const [selectedChild, setSelectedChild] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [childEmail, setChildEmail] = useState('');
    const [childPassword, setChildPassword] = useState('');
    const children = ["John Doe", "Jane Smith", "Alice Johnson"];
    const user = useSelector((state) => state.auth.user);

    useEffect(() => { 
        fetchAllTherapists(setTherapists);
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'guardian') {
            navigate('/login');
        }
    }, [user, navigate, setTherapists]);

    useEffect(() => {
        if (selectedTherapistId) {
            dispatch(getAppointmentsByTherapistId(selectedTherapistId))
                .then((result) => {
                    if (getAppointmentsByTherapistId.fulfilled.match(result)) {
                        setTherapistAppointments(result.payload);
                    } else {
                        console.error("Failed to fetch appointments", result.payload);
                    }
                });
        }
    }, [dispatch, selectedTherapistId]);

    if (!user) {
        return <div>Loading...</div>;
    }
    
    const allSpecializations = [...new Set(therapists.map(t => t.specialization))];
    
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else { 
            setSortBy(column);
            setSortOrder('asc');
        }
    };
    
    const trimmedQuery = searchQuery.trim().toLowerCase();

    let filteredTherapists = therapists;

    if (selectedSpecialization !== '') {
        filteredTherapists = therapists.filter(
            (therapist) => therapist.specialization === selectedSpecialization
        );
    } else if (trimmedQuery !== '') {
        filteredTherapists = therapists.filter((therapist) => {
            const fullName = `${therapist.first_name} ${therapist.last_name}`.toLowerCase();
            return fullName.includes(trimmedQuery);
        });
    }
    
    
    const sortedTherapists = [...filteredTherapists].sort((a, b) => { 
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    
    const selectedTherapist = therapists.find(
        (therapist) => String(therapist.therapist_id) === String(selectedTherapistId)
    );
    
    const availableDates = selectedTherapist ? new Set(JSON.parse(selectedTherapist.default_availability || '[]')
    .map(slot =>
            dayjs(slot.start).format('YYYY-MM-DD')
        )
        ) : new Set();
    
    const shouldDisableDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        const isPast = date.isBefore(dayjs(), 'day');
        const isNotAvailable = !availableDates.has(dateStr);
        
        // Check if all possible slots for the day are booked
        const availabilityArray = JSON.parse(selectedTherapist?.default_availability || '[]');
        const sessionDuration = parseInt(selectedTherapist?.session_duration || "60", 10);
        
        const slotsForDay = availabilityArray.filter(slot =>
            dayjs(slot.start).format('YYYY-MM-DD') === dateStr
        );
        
        let totalPossibleSlots = 0;
        let bookedCount = 0;
        
        slotsForDay.forEach(slot => {
            let current = dayjs(slot.start);
            const end = dayjs(slot.end);
        
            while (current.isBefore(end) || current.isSame(end)) {
                const sessionEnd = current.add(sessionDuration, 'minute');
                if (sessionEnd.isAfter(end)) break;
        
                const minute = current.minute();
                const isValidStart =
                    sessionDuration === 45 ? minute % 15 === 0 :
                    sessionDuration === 30 ? minute % 30 === 0 :
                    sessionDuration === 60 ? minute === 0 :
                    false;
        
                if (isValidStart) {
                    totalPossibleSlots++;
                    const formattedTime = current.format('HH:mm');
                    const isBooked = therapistAppointments.some(
                        appt => appt.date === dateStr && appt.time === formattedTime
                    );
                    if (isBooked) {
                        bookedCount++;
                    }
                    current = current.add(sessionDuration, 'minute');
                } else {
                    current = current.add(15, 'minute');
                }
            }
        });
        
        const isFullyBooked = totalPossibleSlots > 0 && bookedCount === totalPossibleSlots;
        
        return isPast || isNotAvailable || isFullyBooked;
    };
    
    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        const selectedDateStr = newValue.format('YYYY-MM-DD');
    
        if (selectedTherapist) {
            try {
                const availabilityArray = JSON.parse(selectedTherapist.default_availability || '[]');
                const sessionDuration = parseInt(selectedTherapist.session_duration || "60", 10);
    
                const matchingSlots = availabilityArray.filter(slot =>
                    dayjs(slot.start).format('YYYY-MM-DD') === selectedDateStr
                );
    
                let generatedSlots = [];
    
                matchingSlots.forEach(slot => {
                    let current = dayjs(slot.start);
                    const end = dayjs(slot.end);
    
                    while (current.isBefore(end) || current.isSame(end)) {
                        const sessionEnd = current.add(sessionDuration, 'minute');
                        if (sessionEnd.isAfter(end)) break;
    
                        const minute = current.minute();
                        const isValidStart =
                            sessionDuration === 45 ? minute % 15 === 0 :
                            sessionDuration === 30 ? minute % 30 === 0 :
                            sessionDuration === 60 ? minute === 0 :
                            false;
    
                        if (isValidStart) {
                            const formattedTime = current.format('HH:mm');
    
                            // Exclude booked time slots
                            const isBooked = therapistAppointments.some(
                                appt => appt.date === selectedDateStr && appt.time === formattedTime
                            );
    
                            if (!isBooked) {
                                generatedSlots.push(formattedTime);
                            }
    
                            current = current.add(sessionDuration, 'minute');
                        } else {
                            current = current.add(15, 'minute');
                        }
                    }
                });
    
                setAvailableTimes(generatedSlots);
                setOpenTimesModal(generatedSlots.length > 0);
            } catch (error) {
                console.error("Error parsing availability or generating slots:", error);
                setAvailableTimes([]);
                setOpenTimesModal(false);
            }
        }
    };
        
    
    const handleBookSession = async () => {
        if (!selectedTherapistId || !selectedTime || !selectedDate) {
            alert("Please select a therapist, date, and time.");
            return;
        }
            
        const appointmentData = {
            student_id: 1,  // child_id
            therapist_id: selectedTherapistId,
            date: selectedDate.format("YYYY-MM-DD"),
            time: selectedTime,
            location: "Online",
        };
            
        const result = await dispatch(bookAppointment(appointmentData));

        if (bookAppointment.fulfilled.match(result)) {
            alert("Appointment booked successfully and is now pending.");
        } else {
            alert(result.payload || "Failed to book appointment. Please try again.");
        }
    };

    const handleLinkChild = async () => {
        console.log("Linking child with:", childEmail, childPassword);
        // TODO: Replace with actual API call
        setDialogOpen(false);
        setChildEmail('');
        setChildPassword('');
        alert("Child account linked successfully!");
    };


    return (
        <div>
            <ParentNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome, {user.first_name} {user.last_name}

                    </Typography>

                    {/* Manage Child Section */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Manage Child</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/guardian-register-child')}
                                >
                                    Create Your Child’s Account
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setDialogOpen(true)}
                                >
                                    Link to Current Child Account
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    {/* Book a Session & Find Therapist */}
                    <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Book a Session</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between">
                            {/* ✅ Always show calendar */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    shouldDisableDate={shouldDisableDate}
                                />
                            </LocalizationProvider>
                        </Box>
                            <Typography variant="h6" mb={2}>
                                Find a Therapist
                            </Typography>

                            {/* Search Field */}
                            <TextField
                                label="Search Therapist by Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <TextField
                                select
                                label="Filter by Specialization"
                                value={selectedSpecialization}
                                onChange={(e) => setSelectedSpecialization(e.target.value)}
                                fullWidth
                                margin="normal"
                            >
                                <MenuItem value="">All Specializations</MenuItem>
                                {allSpecializations.map((spec, idx) => (
                                    <MenuItem key={idx} value={spec}>{spec}</MenuItem>
                                ))}
                            </TextField>

                            {/* Therapist Table */}
                            <Box flexGrow={1}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell onClick={() => handleSort('first_name')} style={{ cursor: 'pointer' }}>
                                                    First Name {sortBy === 'first_name' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                                </TableCell>
                                                <TableCell onClick={() => handleSort('last_name')} style={{ cursor: 'pointer' }}>
                                                    Last Name {sortBy === 'last_name' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                                </TableCell>
                                                <TableCell onClick={() => handleSort('specialization')} style={{ cursor: 'pointer' }}>
                                                    Specialization {sortBy === 'specialization' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                                </TableCell>
                                                <TableCell>Select</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {sortedTherapists.map((therapist) => (
                                                <TableRow
                                                    key={therapist.therapist_id}
                                                    hover
                                                    onClick={() => setSelectedTherapistId(therapist.therapist_id)}
                                                    sx={{cursor: 'pointer'}}
                                                >
                                                    <TableCell>{therapist.first_name}</TableCell>
                                                    <TableCell>{therapist.last_name}</TableCell>
                                                    <TableCell>{therapist.specialization}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            onClick={() => setSelectedTherapistId(therapist.therapist_id)}
                                                            variant={selectedTherapistId === therapist.therapist_id ? "contained" : "outlined"}
                                                        >
                                                            Select
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                            <Box mt={2}>
                                <Button variant="contained" color="primary" onClick={handleBookSession}>
                                    Book Session
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
    
                    {/* Manage Appointments */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Manage Appointments</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem
                                    secondaryAction={
                                        
                                        <Box display="flex" gap={1}>
                                            <Button variant="contained" color="error">Cancel</Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText primary="Session with Dr. Smith" secondary="Date: 2025-10-15, 10:00 AM" />
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
                                <ListItem
                                    onClick={() => navigate('/student-dashboard')}
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
                                    <ListItemText primary="Dr. Maleek" secondary="Last Session Date: 2024-10-15 02:00 PM" />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Link to Child Account</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Child's Email"
                            type="email"
                            fullWidth
                            value={childEmail}
                            onChange={(e) => setChildEmail(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Child's Password"
                            type="password"
                            fullWidth
                            value={childPassword}
                            onChange={(e) => setChildPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleLinkChild} disabled={!childEmail || !childPassword}>
                            Link
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default ParentDashboard;