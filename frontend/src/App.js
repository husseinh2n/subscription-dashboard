import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <AnalyticsIcon sx={{ fontSize: 'inherit' }} />
          Subscription Dashboard
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Manage your subscriptions and track your spending
        </Typography>
      </Box>
      
      <Dashboard />
    </Container>
  );
}

export default App;
