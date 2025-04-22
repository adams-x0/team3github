import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"

export const addStudent = async (studentData) => {
    try{
        await axios.post(`${BASE_URL}/addStudents`, studentData)
    } catch (error) {
        console.error("Error adding student:", error);
    }
}

export const addGuardian = async (guardianData) => {
    try{
        await axios.post(`${BASE_URL}/addGuardians`, guardianData)
    } catch (error) {
        console.error("Error adding guardian:", error);
    }
}

export const addTherapist = async (therapistData) => {
    try{
        await axios.post(`${BASE_URL}/addTherapists`, therapistData)
    } catch (error) {
        console.error("Error adding therapists:", error);
    }
}

export const addUser = async (userData) => {
    try {
        const response = await axios.post(`${BASE_URL}/addUsers`, userData);
        return response.data;  // or return true;
    } catch (error) {
        console.error("Error adding users:", error);
        return false;
    }
}

export const bookAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(`${BASE_URL}/bookAppointment`, appointmentData);
        return response.data;  // or return true;
    } catch (error) {
        console.error("Error booking appointment:", error);
        return false;
    }
};
