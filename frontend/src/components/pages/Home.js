import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { loadUser } from '../../features/auth/authSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (localStorage.token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to DevConnect
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {isAuthenticated ? `Hello, ${user?.name || 'User'}` : 'Please login or register to get started'}
        </Typography>
        <Typography variant="body1">
          A platform for developers to ask questions, share knowledge, and connect with other developers.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
