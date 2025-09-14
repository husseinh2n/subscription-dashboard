import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Subscription API functions
export const subscriptionAPI = {
  // Get all subscriptions with optional filters
  getSubscriptions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.billing_cycle) params.append('billing_cycle', filters.billing_cycle);
      
      const response = await api.get(`/subscriptions/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.response?.data?.error || error.message}`);
    }
  },

  // Get single subscription by ID
  getSubscription: async (id) => {
    try {
      const response = await api.get(`/subscriptions/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error.response?.data?.error || error.message}`);
    }
  },

  // Create new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions/', subscriptionData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.response?.data?.error || error.message}`);
    }
  },

  // Update subscription (full update)
  updateSubscription: async (id, subscriptionData) => {
    try {
      const response = await api.put(`/subscriptions/${id}/`, subscriptionData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.response?.data?.error || error.message}`);
    }
  },

  // Partial update subscription
  patchSubscription: async (id, updates) => {
    try {
      const response = await api.patch(`/subscriptions/${id}/`, updates);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.response?.data?.error || error.message}`);
    }
  },

  // Delete subscription (soft delete)
  deleteSubscription: async (id) => {
    try {
      await api.delete(`/subscriptions/${id}/`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete subscription: ${error.response?.data?.error || error.message}`);
    }
  },

  // Get subscription statistics
  getStats: async () => {
    try {
      const response = await api.get('/subscriptions/stats/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.response?.data?.error || error.message}`);
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/subscriptions/categories/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.response?.data?.error || error.message}`);
    }
  },

  // Update renewal date manually
  updateRenewalDate: async (id, renewalDate) => {
    try {
      const response = await api.patch(`/subscriptions/${id}/update_renewal_date/`, {
        renewal_date: renewalDate
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update renewal date: ${error.response?.data?.error || error.message}`);
    }
  },
};

// Utility functions for data formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysUntilRenewal = (renewalDate) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isRenewalUpcoming = (renewalDate, daysThreshold = 7) => {
  const daysUntil = getDaysUntilRenewal(renewalDate);
  return daysUntil <= daysThreshold && daysUntil >= 0;
};

export default api;
