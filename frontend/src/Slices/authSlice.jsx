import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000';


export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/addUsers`, userData);
      return response.data.user; // adjust this depending on backend response shape
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

// Async thunk to update default availability
export const updateDefaultAvailability = createAsyncThunk(
  'auth/updateDefaultAvailability',
  async (availabilityData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth; // get current user
      const response = await axios.post(`${BASE_URL}/updateAvailability`, {
        user_id: user.user_id,
        default_availability: availabilityData,
      });

      return response.data; // backend just returns a message
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Update failed');
    }
  }
);

export const fetchTherapistAvailabilityByUserId = createAsyncThunk(
  'auth/fetchTherapistAvailabilityByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getTherapistAvailabilityByUserId/${userId}`);
      return response.data; // expected to be the availability array
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Fetch availability failed');
    }
  }
);

export const linkChild = createAsyncThunk(
  'auth/linkChild',
  async ({ user_id, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/link-child`, {
        user_id,
        email,
        password
      });
      return response.data; // Contains message and linked_student_id
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Linking failed');
    }
  }
);

// Get all guardians linked to a student
export const fetchLinkedGuardians = createAsyncThunk(
  'auth/fetchLinkedGuardians',
  async ({ user_id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/get-linked-guardians`, { user_id, role });
      return response.data.guardians;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch linked guardians');
    }
  }
);

// Get all students linked to a guardian
export const fetchLinkedStudents = createAsyncThunk(
  'auth/fetchLinkedStudents',
  async ({ user_id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/get-linked-students`, { user_id, role });
      return response.data.students;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch linked students');
    }
  }
);

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const updateSessionDuration = createAsyncThunk(
  'auth/updateSessionDuration',
  async (sessionDuration, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      await axios.post(`${BASE_URL}/updateSessionDuration`, {
        user_id: user.user_id,
        session_duration: sessionDuration,
      });
      return sessionDuration; // we return the new value directly
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update session duration');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'auth/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/bookAppointment`, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to book appointment');
    }
  }
);

export const getAppointmentsByTherapistId = createAsyncThunk(
  'auth/getAppointmentsByTherapistId',
  async (therapistId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getAppointmentsByTherapist/${therapistId}`);
      return response.data; // expected to be an array of appointments
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

// Async thunk to fetch appointments by student ID
export const getAppointmentsByStudentId = createAsyncThunk(
  'auth/getAppointmentsByStudentId',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getAppointmentsByStudent/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student appointments:', error);
      return rejectWithValue(error.response?.data || 'Server Error');
    }
  }
);

// Async thunk to fetch all appointments for admin view
export const fetchAllAppointmentsByAdmin = createAsyncThunk(
  'auth/fetchAllAppointmentsByAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getAppointmentsByAdmin`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin appointments:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin appointments');
    }
  }
);


export const fetchSessionDuration = createAsyncThunk(
  'auth/fetchSessionDuration',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getSessionDuration/${userId}`);
      return response.data.session_duration;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch session duration');
    }
  }
);

export const getAppointmentsForStudent = createAsyncThunk(
  'auth/getAppointmentsForStudent',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getAppointmentsForStudent/${userId}`);
      return response.data; // expected to be an array of appointments with therapist names
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments for student');
    }
  }
);

export const getAppointmentsByUserId = createAsyncThunk(
  'auth/getAppointmentsByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getAppointmentsByUserId/${userId}`);
      return response.data; // expected to be an array of appointments
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments by user ID');
    }
  }
);

// Async thunk to cancel appointment
export const cancelAppointment = createAsyncThunk(
  'auth/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/cancelAppointment/${appointmentId}`);
      return response.data;  // Expected: { message: "Appointment cancelled and emails sent." }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Appointment cancellation failed');
    }
  }
);

export const acceptAppointment = createAsyncThunk(
  'auth/acceptAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/acceptAppointment/${appointmentId}`);
      return response.data; // expected: { message: "Appointment status updated to accepted." }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to accept appointment');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  defaultAvailability: JSON.parse(localStorage.getItem('defaultAvailability')) || null,
  therapistAppointments: [],
  studentAppointments: [],
  sessionDuration: null,
  loading: false,
  error: null,
  registrationError: null,
  adminAppointmentError: null,

  cancellationStatus: null,
  availabilityLoading: false,
  acceptStatus: 'idle',
  bookingStatus: 'idle',
  bookingError: null,
  linkStatus: 'idle',
  linkError: null,
  linkedStudentId: null,
  guardianRelationship: [],
  studentRelationship: [],
  relationshipStatus: 'idle',
  adminAppointments: [],
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.defaultAvailability = null; // clear it
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('defaultAvailability');
      state.therapistAppointments = [];
      state.studentAppointments = [];
      state.cancellationStatus = null;
      state.availabilityLoading = false;
      state.bookingStatus = null;
      state.bookingError = null;
      state.acceptStatus = 'idle';
      state.linkStatus = 'idle';
      state.linkError = null;
      state.linkedStudentId = null;
      state.guardianRelationship = [];
      state.studentRelationship = [];
      state.relationshipStatus = 'idle'
    },
    clearUser: (state) => {
      localStorage.removeItem('user');
      state.user = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginUser pending
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // loginUser success
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.defaultAvailability = null;
        state.loading = false;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // loginUser error
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(linkChild.pending, (state) => {
        state.linkStatus = 'loading';
        state.linkError = null;
        state.linkedStudentId = null;
      })
      // linkChild fulfilled
      .addCase(linkChild.fulfilled, (state, action) => {
        state.linkStatus = 'succeeded';
        state.linkError = null;
        state.linkedStudentId = action.payload.linked_student_id || null;
      })
      // linkChild rejected
      .addCase(linkChild.rejected, (state, action) => {
        state.linkStatus = 'failed';
        state.linkError = action.payload;
        state.linkedStudentId = null;
      })
      // registerUser pending
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registrationError = null;
      })
      // registerUser success
      .addCase(registerUser.fulfilled, (state, action) => {
        if (state.user?.role !== 'guardian') {
          state.user = action.payload;
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
        state.defaultAvailability = null;
        state.loading = false;
        state.registrationError = null;
      })
      // registerUser error
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;

        if (typeof action.payload === 'string') {
          alert(`Registration failed: ${action.payload}`);
        } else {
          alert('Unsuccessful Registration !');
        }
      })
      //Update default availability Success
      .addCase(updateDefaultAvailability.fulfilled, (state, action) => {
        state.successMessage = action.payload.message; // or skip if not needed
      })
      .addCase(updateDefaultAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      //Update default availability error
      .addCase(updateDefaultAvailability.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchTherapistAvailabilityByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTherapistAvailabilityByUserId.fulfilled, (state, action) => {
        state.defaultAvailability = action.payload;
        localStorage.setItem('defaultAvailability', JSON.stringify(action.payload));
        state.availabilityLoading = false;
        state.error = null;
      })
      .addCase(fetchTherapistAvailabilityByUserId.rejected, (state, action) => {
        state.availabilityLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSessionDuration.pending, (state) => {
        state.availabilityLoading = true;
        state.error = null;
      })
      .addCase(updateSessionDuration.fulfilled, (state, action) => {
        state.sessionDuration = action.payload;
        state.loading = false;
      })
      .addCase(updateSessionDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.bookingStatus = 'loading';
        state.bookingError = null;
      })
      .addCase(bookAppointment.fulfilled, (state) => {
        state.bookingStatus = 'succeeded';
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.bookingStatus = 'failed';
        state.bookingError = action.payload;
      })
      .addCase(getAppointmentsByTherapistId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByTherapistId.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.therapistAppointments = action.payload;
      })
      .addCase(getAppointmentsByTherapistId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAppointmentsByStudentId.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(getAppointmentsByStudentId.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAppointments = action.payload;
        state.error = null;
      })
      .addCase(getAppointmentsByStudentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAppointmentsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.therapistAppointments = action.payload;
      })
      .addCase(getAppointmentsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.cancellationStatus = 'loading'
        state.error = null;
      })
      // cancelAppointment success
      .addCase(cancelAppointment.fulfilled, (state) => {
        state.cancellationStatus = 'succeeded';
        state.error = null;
      })
      // cancelAppointment error
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.cancellationStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(acceptAppointment.pending, (state) => {
        state.acceptStatus = 'loading';
      })
      .addCase(acceptAppointment.fulfilled, (state) => {
        state.acceptStatus = 'succeeded';
      })
      .addCase(acceptAppointment.rejected, (state, action) => {
        state.acceptStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchSessionDuration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionDuration.fulfilled, (state, action) => {
        state.sessionDuration = action.payload;
        state.loading = false;
      })
      .addCase(fetchSessionDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLinkedGuardians.pending, (state) => {
        state.relationshipStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchLinkedGuardians.fulfilled, (state, action) => {
        state.guardianRelationship = action.payload;
        state.error = false;
        state.relationshipStatus = 'succeeded';
      })
      .addCase(fetchLinkedGuardians.rejected, (state, action) => {
        state.relationshipLoading = false;
        state.error = action.payload;
        state.relationshipStatus = 'failed';
      })
      .addCase(fetchLinkedStudents.pending, (state) => {
        state.relationshipStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchLinkedStudents.fulfilled, (state, action) => {
        state.studentRelationship = action.payload;
        state.relationshipLoading = false;
        state.relationshipStatus = 'succeeded';
      })
      .addCase(fetchLinkedStudents.rejected, (state, action) => {
        state.relationshipLoading = false;
        state.relationshipError = action.payload;
        state.relationshipStatus = 'failed';
      })
      .addCase(getAppointmentsForStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentsForStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAppointments = action.payload;
      })
      .addCase(getAppointmentsForStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllAppointmentsByAdmin.pending, (state) => {
        state.loading = true;
        state.adminAppointmentError = null;
      })
      .addCase(fetchAllAppointmentsByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminAppointments = action.payload;
      })
      .addCase(fetchAllAppointmentsByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.adminAppointmentError = action.payload;
      })
  },  
});

// Export actions and reducer
export const { logoutUser } = authSlice.actions;
export const { clearUser } = authSlice.actions;
export default authSlice.reducer;

