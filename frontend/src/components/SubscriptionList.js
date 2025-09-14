import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate, getDaysUntilRenewal, isRenewalUpcoming } from '../services/api';
import SubscriptionForm from './SubscriptionForm';

const SubscriptionList = ({ 
  subscriptions, 
  categories, 
  onCreate, 
  onUpdate, 
  onDelete, 
  onRefresh 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [billingCycleFilter, setBillingCycleFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const handleOpenForm = (subscription = null) => {
    setEditingSubscription(subscription);
    setFormOpen(true);
    handleCloseMenu();
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingSubscription(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSubscription) {
        await onUpdate(editingSubscription.id, formData);
      } else {
        await onCreate(formData);
      }
      handleCloseForm();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleDelete = async (subscription) => {
    if (window.confirm(`Are you sure you want to delete "${subscription.name}"?`)) {
      try {
        await onDelete(subscription.id);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event, subscription) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubscription(subscription);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSubscription(null);
  };

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || subscription.category === categoryFilter;
    const matchesBillingCycle = !billingCycleFilter || subscription.billing_cycle === billingCycleFilter;
    
    return matchesSearch && matchesCategory && matchesBillingCycle;
  });

  const getBillingCycleColor = (cycle) => {
    return cycle === 'monthly' ? 'primary' : 'secondary';
  };

  const getCategoryColor = (category) => {
    const categoryColorMap = {
      'Productivity': 'success', // Green for productivity
      'Entertainment': 'secondary', // Pink for entertainment
      'Music': 'primary', // Purple for music
      'Software': 'info', // Blue for software
      'Health': 'warning', // Orange for health
      'Uncategorized': 'default', // Default for uncategorized
    };
    
    return categoryColorMap[category] || 'default';
  };

  const getRenewalStatus = (renewalDate) => {
    const daysUntil = getDaysUntilRenewal(renewalDate);
    if (daysUntil < 0) return { status: 'overdue', color: 'error' };
    if (daysUntil <= 3) return { status: 'urgent', color: 'error' };
    if (daysUntil <= 7) return { status: 'upcoming', color: 'warning' };
    return { status: 'normal', color: 'success' };
  };

  if (isMobile) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Subscriptions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Add
            </Button>
          </Box>

          {/* Mobile Filters */}
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField
              size="small"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" gap={1}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Billing</InputLabel>
                <Select
                  value={billingCycleFilter}
                  onChange={(e) => setBillingCycleFilter(e.target.value)}
                  label="Billing"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Mobile Card List */}
          {filteredSubscriptions.map(subscription => {
            const renewalStatus = getRenewalStatus(subscription.renewal_date);
            return (
              <Card key={subscription.id} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="div">
                      {subscription.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, subscription)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip 
                      label={subscription.billing_cycle} 
                      size="small" 
                      color={getBillingCycleColor(subscription.billing_cycle)}
                    />
                    {subscription.category && (
                      <Chip 
                        label={subscription.category} 
                        size="small" 
                        color={getCategoryColor(subscription.category)}
                      />
                    )}
                    <Chip 
                      label={`${renewalStatus.status} (${getDaysUntilRenewal(subscription.renewal_date)} days)`}
                      size="small" 
                      color={renewalStatus.color}
                    />
                  </Box>

                  <Typography variant="h6" color="primary" gutterBottom>
                    {formatCurrency(parseFloat(subscription.cost))}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Renews: {formatDate(subscription.renewal_date)}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}

          {filteredSubscriptions.length === 0 && (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No subscriptions found matching your criteria.
            </Typography>
          )}
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleOpenForm(selectedSubscription)}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedSubscription)}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Form Dialog */}
        <SubscriptionForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          subscription={editingSubscription}
          categories={categories}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Subscriptions ({filteredSubscriptions.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Subscription
          </Button>
        </Box>

        {/* Desktop Filters */}
        <Box display="flex" gap={2} mb={3} alignItems="center">
          <TextField
            size="small"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Billing Cycle</InputLabel>
            <Select
              value={billingCycleFilter}
              onChange={(e) => setBillingCycleFilter(e.target.value)}
              label="Billing Cycle"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Desktop Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell>Billing Cycle</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Renewal Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.map(subscription => {
                const renewalStatus = getRenewalStatus(subscription.renewal_date);
                return (
                  <TableRow key={subscription.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {subscription.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary" fontWeight="medium">
                        {formatCurrency(parseFloat(subscription.cost))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={subscription.billing_cycle} 
                        size="small" 
                        color={getBillingCycleColor(subscription.billing_cycle)}
                      />
                    </TableCell>
                    <TableCell>
                      {subscription.category && (
                        <Chip 
                          label={subscription.category} 
                          size="small" 
                          color={getCategoryColor(subscription.category)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(subscription.renewal_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`${getDaysUntilRenewal(subscription.renewal_date)} days until renewal`}>
                        <Chip 
                          label={`${getDaysUntilRenewal(subscription.renewal_date)} days`}
                          size="small" 
                          color={renewalStatus.color}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, subscription)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredSubscriptions.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            No subscriptions found matching your criteria.
          </Typography>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOpenForm(selectedSubscription)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedSubscription)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <SubscriptionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        subscription={editingSubscription}
        categories={categories}
      />
    </Card>
  );
};

export default SubscriptionList;
