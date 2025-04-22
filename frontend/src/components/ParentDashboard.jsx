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
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { fetchAllTherapists } from "../Slices/GetSlice";
import { bookAppointment } from "../Slices/SetSlice";
import dayjs from "dayjs";
import { useNavigate } from 'react-router-dom';
import ParentNavbar from "./parentNavbar";



const ParentDashboard = () => {
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedChild, setSelectedChild] = useState('');
    const children = ["John Doe", "Jane Smith", "Alice Johnson"];

    useEffect(() => {
        fetchAllTherapists(setTherapists);
    }, [setTherapists]);

    const handleBookSession = async () => {
        if (!selectedTherapistId || !selectedTime) {
            alert("Please select a therapist and time.");
            return;
        }
        
        const appointmentData = {
            student_id: 1,  // Replace with actual student_id from auth or context
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

    const selectedTherapist = therapists.find(
        (therapist) => String(therapist.therapist_id) === String(selectedTherapistId)
    );

    const dayOfWeek = selectedDate ? selectedDate.format('dddd') : null;
    let availableTimes = [];
    if (selectedTherapist && selectedTherapist.availability) {
        try {
            const availabilityObj = JSON.parse(selectedTherapist.availability);
            availableTimes = availabilityObj[dayOfWeek] || [];
        } catch (err) {
            console.error('Failed to parse availability JSON:', err);
        }
    }

    return (
        <div>
            <ParentNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome to the Parent Dashboard
                    </Typography>
    
                    {/* Add Child Section */}
                    <Box mt={4} mb={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/register')}
                        >
                            Add a Child
                        </Button>
                    </Box>
    
                    {/* Book a Session */}
                    <Accordion defaultExpanded sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Book a Session</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box
                                display="flex"
                                flexDirection={{ xs: "column", md: "row" }}
                                justifyContent="space-between"
                            >
                                {/* Date Picker */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={(newValue) => setSelectedDate(newValue)}
                                    />
                                </LocalizationProvider>
    
                                {/* Child and Therapist Selection */}
                                <Box ml={{ md: 4 }} mt={{ xs: 2, md: 0 }} flexGrow={1}>
                                    {/* Child Selection */}
                                    <Typography variant="subtitle1" gutterBottom>
                                        Select a Child:
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 5 }}>
                                        <InputLabel id="child-select-label">Child</InputLabel>
                                        <Select
                                            labelId="child-select-label"
                                            value={selectedChild}
                                            label="Child"
                                            onChange={(e) => setSelectedChild(e.target.value)}
                                        >
                                            {children.map((child) => (
                                                <MenuItem key={child} value={child}>
                                                    {child}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
    
                                    {/* Therapist Selection */}
                                    <Typography variant="subtitle1" gutterBottom>
                                        Select a Therapist:
                                    </Typography>
                                    <RadioGroup
                                        value={selectedTherapistId}
                                        onChange={(e) => setSelectedTherapistId(e.target.value)}
                                    >
                                        {therapists.map((therapist) => (
                                            <FormControlLabel
                                                key={therapist.therapist_id}
                                                value={therapist.therapist_id}
                                                control={<Radio />}
                                                label={`${therapist.first_name} ${therapist.last_name} — ${therapist.specialization}`}
                                            />
                                        ))}
                                    </RadioGroup>
    
                                    {/* Available Times */}
                                    {availableTimes.length > 0 ? (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1">
                                                Available times for {selectedDate.format("MMMM Do, YYYY")}:
                                            </Typography>
                                            <RadioGroup
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                row
                                            >
                                                {availableTimes.map((time) => (
                                                    <FormControlLabel
                                                        key={time}
                                                        value={time}
                                                        control={<Radio />}
                                                        label={time}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </Box>
                                    ) : (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1">
                                                Available times for {selectedDate.format("MMMM Do, YYYY")}: None
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
    
                            <Box mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleBookSession}
                                >
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
                                <ListItem secondaryAction={<Button color="error">Cancel</Button>}>
                                    <ListItemText
                                        primary="Session with Dr. Smith"
                                        secondary="Date: 2025-10-15"
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
    
                    {/* View History */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">View History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="Session with Dr. Maleek"
                                        secondary="Date: 2024-10-15"
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
    
                    {/* Find Therapist */}
                    <Accordion sx={{ mb: 5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Find Therapist</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                label="Search by name, specialization ..."
                                fullWidth
                            />
                            <Box mt={2}>
                                <List>
                                    <ListItem secondaryAction={<Button variant="outlined">View Profile</Button>}>
                                        <ListItemText
                                            primary="Dr. Jane Doe"
                                            secondary="Specialization: Physical Therapy"
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

export default ParentDashboard;