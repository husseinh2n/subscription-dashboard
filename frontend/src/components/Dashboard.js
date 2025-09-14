import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  PhoneAndroid as PhoneAndroidIcon,
} from '@mui/icons-material';
import { subscriptionAPI } from '../services/api';
import StatsCard from './StatsCard';
import SubscriptionList from './SubscriptionList';
import UpcomingRenewals from './UpcomingRenewals';
import SavingsCalculator from './SavingsCalculator';
import Chart from './Chart';

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subscriptionsData, statsData, categoriesData] = await Promise.all([
        subscriptionAPI.getSubscriptions(),
        subscriptionAPI.getStats(),
        subscriptionAPI.getCategories(),
      ]);

      setSubscriptions(subscriptionsData.results || []);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
      showSnackbar('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubscriptionCreate = async (subscriptionData) => {
    try {
      const newSubscription = await subscriptionAPI.createSubscription(subscriptionData);
      setSubscriptions(prev => [...prev, newSubscription]);
      await fetchStats(); // Refresh stats
      showSnackbar('Subscription created successfully!', 'success');
      return newSubscription;
    } catch (err) {
      showSnackbar('Failed to create subscription: ' + err.message, 'error');
      throw err;
    }
  };

  const handleSubscriptionUpdate = async (id, updates) => {
    try {
      const updatedSubscription = await subscriptionAPI.patchSubscription(id, updates);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? updatedSubscription : sub)
      );
      await fetchStats(); // Refresh stats
      showSnackbar('Subscription updated successfully!', 'success');
      return updatedSubscription;
    } catch (err) {
      showSnackbar('Failed to update subscription: ' + err.message, 'error');
      throw err;
    }
  };

  const handleSubscriptionDelete = async (id) => {
    try {
      await subscriptionAPI.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      await fetchStats(); // Refresh stats
      showSnackbar('Subscription deleted successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to delete subscription: ' + err.message, 'error');
      throw err;
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await subscriptionAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <br />
        <strong>Make sure the Django backend is running at http://localhost:8000</strong>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stats Cards Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Monthly Cost"
            value={stats?.total_monthly_cost || 0}
            icon={<AttachMoneyIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Yearly Cost"
            value={stats?.total_yearly_cost || 0}
            icon={<CalendarTodayIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Subscriptions"
            value={stats?.total_active_subscriptions || 0}
            icon={<PhoneAndroidIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Spent"
            value={stats?.total_spent || 0}
            icon={<AttachMoneyIcon />}
            color="info"
            subtitle={stats?.time_since_first_subscription ? 
              `in ${stats.time_since_first_subscription} days${
                stats.time_since_first_subscription >= 365 ? 
                  ` (${Math.floor(stats.time_since_first_subscription / 365)} year${Math.floor(stats.time_since_first_subscription / 365) !== 1 ? 's' : ''})` :
                stats.time_since_first_subscription >= 30 ? 
                  ` (${Math.floor(stats.time_since_first_subscription / 30)} month${Math.floor(stats.time_since_first_subscription / 30) !== 1 ? 's' : ''})` :
                  ''
              }` : 
              null
            }
          />
        </Grid>
      </Grid>

      {/* Main Content Row */}
      <Grid container spacing={3}>
        {/* Left Column - Charts */}
        <Grid item xs={12} lg={8}>
          <Chart 
            data={stats?.category_breakdown || {}} 
            subscriptions={subscriptions}
          />
        </Grid>

        {/* Right Column - Savings Calculator and Upcoming Renewals */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SavingsCalculator 
                subscriptions={subscriptions}
                stats={stats}
              />
            </Grid>
            <Grid item xs={12}>
              <UpcomingRenewals 
                renewals={stats?.upcoming_renewals || []}
                onRefresh={handleRefresh}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Subscription List */}
      <Box sx={{ mt: 4 }}>
        <SubscriptionList
          subscriptions={subscriptions}
          categories={categories}
          onCreate={handleSubscriptionCreate}
          onUpdate={handleSubscriptionUpdate}
          onDelete={handleSubscriptionDelete}
          onRefresh={handleRefresh}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
