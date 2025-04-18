import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"

export const fetchAllStudents = async (setStudents) => {
    try {
        const response = await axios.get(`${BASE_URL}/getStudents`)
        setStudents(response.data)
    } catch (error) {
        console.error("Error fetching students:", error)
    }
}

export const fetchAllGuardians = async (setGuardians) => {
    try {
        const response = await axios.get(`${BASE_URL}/getGuardians`)
        setGuardians(response.data)
    } catch (error) {
        console.error("Error fetching guardians:", error)
    }
}

export const fetchAllTherapists = async (setTherapists) => {
    try {
        const response = await axios.get(`${BASE_URL}/getTherapists`)
        setTherapists(response.data)
    } catch (error) {
        console.error("Error fetching therapist:", error)
    }
}

export const fetchAllUsers = async (setUsers) => {
    try {
        const response = await axios.get(`${BASE_URL}/getUsers`)
        setUsers(response.data)
    } catch (error) {
        console.error("Error fetching users:", error)
    }
}
