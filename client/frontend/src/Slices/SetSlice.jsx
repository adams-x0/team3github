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
// Might only need this user one if we add to both the user table
// and whatever other child table(so student role = to student table) in the backend
export const addUser = async (userData) => {
    try{
        await axios.post(`${BASE_URL}/addUsers`, userData)
    } catch (error) {
        console.error("Error adding users:", error);
    }
}
