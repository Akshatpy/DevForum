import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from '../alert/alertSlice';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
};

// Register User
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { dispatch }) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ name, email, password });

    try {
      const res = await axios.post('/api/auth/register', body, config);
      dispatch(
        setAlert({ msg: 'Registration successful', alertType: 'success' })
      );
      return res.data;
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => dispatch(setAlert({ msg: error.msg, alertType: 'error' })));
      }
      throw err;
    }
  }
);

// Login User
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch }) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ email, password });

    try {
      const res = await axios.post('/api/auth/login', body, config);
      dispatch(
        setAlert({ msg: 'Login successful', alertType: 'success' })
      );
      return res.data;
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => dispatch(setAlert({ msg: error.msg, alertType: 'error' })));
      } else if (err.response?.data?.message) {
        dispatch(setAlert({ msg: err.response.data.message, alertType: 'error' }));
      }
      throw err;
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
