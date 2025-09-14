import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

// Helper function to calculate the next renewal date
const calculateNextRenewalDate = (startDate, billingCycle) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextRenewal;
  
  if (billingCycle === 'monthly') {
    // Start with the first renewal date (1 month after start)
    nextRenewal = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    
    // Keep adding months until we find a date in the future
    while (nextRenewal <= today) {
      nextRenewal = new Date(nextRenewal.getFullYear(), nextRenewal.getMonth() + 1, nextRenewal.getDate());
    }
  } else if (billingCycle === 'yearly') {
    // Start with the first renewal date (1 year after start)
    nextRenewal = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    
    // Keep adding years until we find a date in the future
    while (nextRenewal <= today) {
      nextRenewal = new Date(nextRenewal.getFullYear() + 1, nextRenewal.getMonth(), nextRenewal.getDate());
    }
  }
  
  return format(nextRenewal, 'MMM dd, yyyy');
};

const SubscriptionForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  subscription = null, 
  categories = [] 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    monthly_price: '',
    yearly_price: '',
    cost: '',
    billing_cycle: 'monthly',
    start_date: new Date(),
    category: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or subscription changes
  useEffect(() => {
    if (open) {
      if (subscription) {
        setFormData({
          name: subscription.name || '',
          monthly_price: subscription.monthly_price || '',
          yearly_price: subscription.yearly_price || '',
          cost: subscription.cost || '',
          billing_cycle: subscription.billing_cycle || 'monthly',
          start_date: subscription.start_date ? new Date(subscription.start_date) : new Date(),
          category: subscription.category || '',
        });
      } else {
        setFormData({
          name: '',
          monthly_price: '',
          yearly_price: '',
          cost: '',
          billing_cycle: 'monthly',
          start_date: new Date(),
          category: '',
        });
      }
      setErrors({});
    }
  }, [open, subscription]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // Auto-update cost when billing cycle or pricing changes
      if (field === 'billing_cycle' || field === 'monthly_price' || field === 'yearly_price') {
        if (field === 'billing_cycle') {
          // Set cost based on selected billing cycle
          if (value === 'monthly' && prev.monthly_price) {
            newData.cost = prev.monthly_price;
          } else if (value === 'yearly' && prev.yearly_price) {
            newData.cost = prev.yearly_price;
          }
        } else if (field === 'monthly_price' && prev.billing_cycle === 'monthly') {
          // Update cost if currently on monthly billing
          newData.cost = value;
        } else if (field === 'yearly_price' && prev.billing_cycle === 'yearly') {
          // Update cost if currently on yearly billing
          newData.cost = value;
        }
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      start_date: date,
    }));
    
    if (errors.start_date) {
      setErrors(prev => ({
        ...prev,
        start_date: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Name must be less than 200 characters';
    }

    // Pricing validation - at least one pricing option must be provided
    const monthlyPrice = parseFloat(formData.monthly_price);
    const yearlyPrice = parseFloat(formData.yearly_price);
    
    if (!formData.monthly_price && !formData.yearly_price) {
      newErrors.monthly_price = 'At least one pricing option is required';
      newErrors.yearly_price = 'At least one pricing option is required';
    } else {
      // Validate monthly price if provided
      if (formData.monthly_price) {
        if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
          newErrors.monthly_price = 'Monthly price must be a positive number';
        }
      }
      
      // Validate yearly price if provided
      if (formData.yearly_price) {
        if (isNaN(yearlyPrice) || yearlyPrice <= 0) {
          newErrors.yearly_price = 'Yearly price must be a positive number';
        }
      }
    }
    
    // Cost validation (should match the selected billing cycle)
    if (!formData.cost) {
      newErrors.cost = 'Cost is required';
    } else {
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost <= 0) {
        newErrors.cost = 'Cost must be a positive number';
      } else {
        // Validate that cost matches the selected billing cycle pricing
        if (formData.billing_cycle === 'monthly' && formData.monthly_price) {
          if (cost !== monthlyPrice) {
            newErrors.cost = 'Cost must match the monthly price';
          }
        } else if (formData.billing_cycle === 'yearly' && formData.yearly_price) {
          if (cost !== yearlyPrice) {
            newErrors.cost = 'Cost must match the yearly price';
          }
        }
      }
    }

    // Billing cycle validation
    if (!formData.billing_cycle) {
      newErrors.billing_cycle = 'Billing cycle is required';
    }

    // Start date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    // Allow past dates for both new and existing subscriptions
    // Users should be able to add subscriptions that started in the past

    // Category validation (optional but if provided, check length)
    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price).toFixed(2) : null,
        yearly_price: formData.yearly_price ? parseFloat(formData.yearly_price).toFixed(2) : null,
        cost: parseFloat(formData.cost).toFixed(2),
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        category: formData.category.trim() || null,
      };

      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            {subscription ? 'Edit Subscription' : 'Add New Subscription'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subscription Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., Netflix, Spotify Premium"
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Price"
                  type="number"
                  value={formData.monthly_price}
                  onChange={handleInputChange('monthly_price')}
                  error={!!errors.monthly_price}
                  helperText={errors.monthly_price}
                  placeholder="0.00"
                  inputProps={{ 
                    step: "0.01", 
                    min: "0" 
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Yearly Price"
                  type="number"
                  value={formData.yearly_price}
                  onChange={handleInputChange('yearly_price')}
                  error={!!errors.yearly_price}
                  helperText={errors.yearly_price}
                  placeholder="0.00"
                  inputProps={{ 
                    step: "0.01", 
                    min: "0" 
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange('cost')}
                  error={!!errors.cost}
                  helperText={errors.cost || "Auto-filled based on billing cycle"}
                  placeholder="0.00"
                  inputProps={{ 
                    step: "0.01", 
                    min: "0" 
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.billing_cycle}>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={formData.billing_cycle}
                    onChange={handleInputChange('billing_cycle')}
                    label="Billing Cycle"
                    disabled={loading}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                  {errors.billing_cycle && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.billing_cycle}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={handleDateChange}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.start_date}
                      helperText={errors.start_date}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category (Optional)</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    label="Category (Optional)"
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>No Category</em>
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Preview of calculated renewal date */}
              {formData.start_date && formData.billing_cycle && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Renewal:</strong> {calculateNextRenewalDate(formData.start_date, formData.billing_cycle)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Saving...' : (subscription ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubscriptionForm;
