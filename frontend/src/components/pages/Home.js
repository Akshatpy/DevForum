import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to DevConnect
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {isAuthenticated ? `Hello, ${user?.username || 'User'}` : 'Please login or register to get started'}
        </Typography>
        <Typography variant="body1">
          A platform for developers to ask questions, share knowledge, and connect with other developers.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
