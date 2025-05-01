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

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  defaultAvailability: null,  // Store therapist availability
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
    },
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
        state.loading = false;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // loginUser error
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // registerUser pending
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // registerUser success
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // registerUser error
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.defaultAvailability = action.payload; // Store only the default availability
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTherapistAvailabilityByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

// Export actions and reducer
export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;

