import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from '../alert/alertSlice';

// Load token from localStorage if it exists
const token = localStorage.getItem('token');

const initialState = {
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  user: null,
  error: null,
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Register User
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify({ name, email, password });
      const res = await axios.post('/api/auth/register', body, config);
      
      setAuthToken(res.data.token);
      
      dispatch(
        setAlert({ msg: 'Registration successful!', alertType: 'success' })
      );
      
      return res.data;
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => 
          dispatch(setAlert({ msg: error.msg || 'Registration failed', alertType: 'error' }))
        );
      }
      return rejectWithValue(err.response?.data || 'Registration failed');
    }
  }
);

// Login User
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify({ email, password });

      const res = await axios.post('/api/auth/login', body, config);
      
      setAuthToken(res.data.token);
      
      dispatch(
        setAlert({ msg: 'Login successful!', alertType: 'success' })
      );
      
      return res.data;
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => 
          dispatch(setAlert({ msg: error.msg || 'Login failed', alertType: 'error' }))
        );
      } else if (err.response?.data?.message) {
        dispatch(setAlert({ msg: err.response.data.message, alertType: 'error' }));
      }
      return rejectWithValue(err.response?.data || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loadUser: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        const { token } = action.payload;
        localStorage.setItem('token', token);
        state.token = token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token } = action.payload;
        localStorage.setItem('token', token);
        state.token = token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state) => {
        localStorage.removeItem('token');
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        localStorage.removeItem('token');
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { loadUser, logout } = authSlice.actions;

export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectUser = state => state.auth.user;

export default authSlice.reducer;
