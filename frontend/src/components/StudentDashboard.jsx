import React, { useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";


const StudentDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const handleBookSession = () => {
        console.log("Session booked for:", selectedDate.format("YYYY-MM-DD"));
    }
    return (
        <div>
            <StudentNavbar />
            <Container>
                <Box pb={8}>
                    <Typography variant="h4" align="center" gutterBottom mt={4}>
                        Welcome to the Student Dashboard
                    </Typography>

                {/* Book a Session */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Book a Session</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                            />
                        </LocalizationProvider>
                        <Box mt={2}>
                            <Button variant="contained" color="primary" onClick={handleBookSession}>
                                Book Session
                            </Button>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Manage Appointments */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Manage Appointments</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem secondaryAction={<Button color="error">Cancel</Button>}>
                                <ListItemText primary="Session with Dr. Smith" secondary="Date: 2025-10-15" />
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>

                {/* View History */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">View History</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <list>
                            <ListItem>
                                <ListItemText primary="Session with Dr. Maleek" secondary="Date: 2024-10-15" />
                            </ListItem>
                        </list>
                    </AccordionDetails>
                </Accordion>

                {/* Find Therapist */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Find Therapist</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TextField label="Search by name, specialization ..." fullWidth />
                        <Box mt={2}>
                            <List>
                                <ListItem secondaryAction={<Button variant="outlined">View Profile</Button>}>
                                    <ListItemText primary="Dr. Jane Doe" secondary="Specialization: Physical Therapy"/>
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

export default StudentDashboard;