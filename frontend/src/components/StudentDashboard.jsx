import React, { use, useEffect, useState } from "react";
import StudentNavbar from "./studentNavbar";
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
    Radio,
    RadioGroup,
    FormControlLabel,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
    TableContainer,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { fetchAllTherapists } from "../Slices/GetSlice"
import { bookAppointment } from "../Slices/SetSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [sortBy, setSortBy] = useState('first_name'); // Default sorting by first name
    const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
    const [availableTimes, setAvailableTimes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const user = useSelector((state) => state.auth.user);

    useEffect(() => { 
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'student') {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }
    useEffect(() => {
        fetchAllTherapists(setTherapists);
    }, [setTherapists]);

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

    const availableDays = selectedTherapist ? Object.keys(JSON.parse(selectedTherapist.availability || '{}')) : [];

    const currentMonday = dayjs().startOf('isoWeek');
    const twoWeeksLater = currentMonday.add(13, 'day');

    const shouldDisableDate = (date) => { 
        const isPast = date.isBefore(dayjs(), 'day');
        const isOutOfRange = !date.isBetween(currentMonday.subtract(1, 'day'), twoWeeksLater.add(1, 'day'), null, '[]'); 
        const dayName = date.format('dddd');
        const isUnavailable = !availableDays.includes(dayName);
        return isPast || isOutOfRange || isUnavailable;
    }

    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        const dayOfWeek = newValue.format('dddd');
        if (selectedTherapist && selectedTherapist.availability) {
            try {
                const availabilityObj = JSON.parse(selectedTherapist.availability);
                setAvailableTimes(availabilityObj[dayOfWeek] || []);
            } catch (error) {
                console.error("Error parsing availability:", error);
                setAvailableTimes([]); // Reset available times if there's an error
            }
        }
        
    };


    const handleBookSession = async () => {
        if (!selectedTherapistId || !selectedTime) {
            alert("Please select a therapist and time.");
            return;
        }

        const appointmentData = {
            student_id: user.user_id,
            therapist_id: selectedTherapistId,
            date: selectedDate.format("YYYY-MM-DD"),
            time: selectedTime,
            location: "Online",
        };
    
        const success = await bookAppointment(appointmentData);
        if (success) {
            alert("Appointment booked successfully and is now pending.");
        } else {
            alert("Failed to book appointment. Please try again.");
        }
    };

    return (
        <div>
            <StudentNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome, {user.first_name} {user.last_name}
                    </Typography>

                {/* Book a Session & Find Therapist */}
                <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Book a Session</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between">
                                {/* Date Picker */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        shouldDisableDate={shouldDisableDate}
                                    />
                                </LocalizationProvider>

                                {selectedTherapist && availableTimes.length > 0 && (
                                    <Box mt={3}>
                                        <Typography variant="subtitle1">Available Times:</Typography>
                                        {availableTimes.map((time) => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? "contained" : "outlined"}
                                                sx={{ m: 0.5 }}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </Box>
                                )}
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
                                        <Button variant="outlined" color="primary">Reschedule</Button>
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
            </Container>
        </div>
    );
};

export default StudentDashboard;