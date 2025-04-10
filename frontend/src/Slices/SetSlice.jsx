import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"

export const addStudent = async (studentData) => {
    try{
        await axios.post(`${BASE_URL}/students`, studentData)
    } catch (error) {
        console.error("Error adding student:", error);
    }
}

export const addGuardian = async (guardianData) => {
    try{
        await axios.post(`${BASE_URL}/guardians`, guardianData)
    } catch (error) {
        console.error("Error adding guardian:", error);
    }
}

export const addTherapist = async (therapistData) => {
    try{
        await axios.post(`${BASE_URL}/therapists`, therapistData)
    } catch (error) {
        console.error("Error adding therapists:", error);
    }
}

export const addUser = async (userData) => {
    try{
        await axios.post(`${BASE_URL}/users`, userData)
    } catch (error) {
        console.error("Error adding users:", error);
    }
}