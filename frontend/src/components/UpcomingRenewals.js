import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Celebration as CelebrationIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../services/api';

const UpcomingRenewals = ({ renewals = [], onRefresh }) => {
  const theme = useTheme();

  const getRenewalStatus = (daysUntil) => {
    if (daysUntil < 0) {
      return { 
        status: 'Overdue', 
        color: 'error', 
        icon: <WarningIcon />,
        severity: 'error'
      };
    }
    if (daysUntil <= 1) {
      return { 
        status: 'Tomorrow', 
        color: 'error', 
        icon: <WarningIcon />,
        severity: 'error'
      };
    }
    if (daysUntil <= 3) {
      return { 
        status: 'This Week', 
        color: 'warning', 
        icon: <WarningIcon />,
        severity: 'warning'
      };
    }
    if (daysUntil <= 7) {
      return { 
        status: 'Next Week', 
        color: 'info', 
        icon: <ScheduleIcon />,
        severity: 'info'
      };
    }
    return { 
      status: 'Upcoming', 
      color: 'success', 
      icon: <CheckCircleIcon />,
      severity: 'success'
    };
  };

  const getStatusColor = (color) => {
    switch (color) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const sortedRenewals = [...renewals].sort((a, b) => a.days_until_renewal - b.days_until_renewal);

  const urgentRenewals = sortedRenewals.filter(r => r.days_until_renewal <= 3);
  const upcomingRenewals = sortedRenewals.filter(r => r.days_until_renewal > 3 && r.days_until_renewal <= 7);
  const normalRenewals = sortedRenewals.filter(r => r.days_until_renewal > 7);

  if (renewals.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              Upcoming Renewals
            </Typography>
            {onRefresh && (
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            )}
          </Box>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CelebrationIcon />
              No upcoming renewals in the next 7 days!
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Upcoming Renewals ({renewals.length})
          </Typography>
          {onRefresh && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </Box>

        {/* Urgent Renewals (3 days or less) */}
        {urgentRenewals.length > 0 && (
          <Box mb={2}>
            <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Urgent: {urgentRenewals.length} renewal{urgentRenewals.length > 1 ? 's' : ''} due soon!
              </Typography>
            </Alert>
            <List dense>
              {urgentRenewals.map((renewal) => {
                const status = getRenewalStatus(renewal.days_until_renewal);
                return (
                  <ListItem
                    key={renewal.id}
                    sx={{
                      bgcolor: `${getStatusColor(status.color)}10`,
                      borderRadius: 1,
                      mb: 1,
                      border: `1px solid ${getStatusColor(status.color)}30`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          color: getStatusColor(status.color),
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {status.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight="medium">
                            {renewal.name}
                          </Typography>
                          <Chip
                            label={status.status}
                            size="small"
                            color={status.color}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(renewal.renewal_date)} • {formatCurrency(renewal.cost)}/{renewal.billing_cycle}
                          </Typography>
                          <Typography variant="caption" color={getStatusColor(status.color)} fontWeight="medium">
                            {renewal.days_until_renewal === 0 
                              ? 'Due today!' 
                              : renewal.days_until_renewal === 1 
                                ? 'Due tomorrow!' 
                                : `${renewal.days_until_renewal} days remaining`
                            }
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Upcoming Renewals (4-7 days) */}
        {upcomingRenewals.length > 0 && (
          <Box mb={2}>
            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon />
                Upcoming: {upcomingRenewals.length} renewal{upcomingRenewals.length > 1 ? 's' : ''} this week
              </Typography>
            </Alert>
            <List dense>
              {upcomingRenewals.map((renewal) => {
                const status = getRenewalStatus(renewal.days_until_renewal);
                return (
                  <ListItem
                    key={renewal.id}
                    sx={{
                      bgcolor: `${getStatusColor(status.color)}08`,
                      borderRadius: 1,
                      mb: 1,
                      border: `1px solid ${getStatusColor(status.color)}20`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          color: getStatusColor(status.color),
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {status.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight="medium">
                            {renewal.name}
                          </Typography>
                          <Chip
                            label={status.status}
                            size="small"
                            color={status.color}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(renewal.renewal_date)} • {formatCurrency(renewal.cost)}/{renewal.billing_cycle}
                          </Typography>
                          <Typography variant="caption" color={getStatusColor(status.color)}>
                            {renewal.days_until_renewal} days remaining
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Normal Renewals (more than 7 days) */}
        {normalRenewals.length > 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 1, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Future: {normalRenewals.length} renewal{normalRenewals.length > 1 ? 's' : ''} coming up
              </Typography>
            </Alert>
            <List dense>
              {normalRenewals.slice(0, 3).map((renewal) => {
                const status = getRenewalStatus(renewal.days_until_renewal);
                return (
                  <ListItem
                    key={renewal.id}
                    sx={{
                      bgcolor: `${getStatusColor(status.color)}05`,
                      borderRadius: 1,
                      mb: 1,
                      border: `1px solid ${getStatusColor(status.color)}15`,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          color: getStatusColor(status.color),
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {status.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight="medium">
                            {renewal.name}
                          </Typography>
                          <Chip
                            label={status.status}
                            size="small"
                            color={status.color}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(renewal.renewal_date)} • {formatCurrency(renewal.cost)}/{renewal.billing_cycle}
                          </Typography>
                          <Typography variant="caption" color={getStatusColor(status.color)}>
                            {renewal.days_until_renewal} days remaining
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            {normalRenewals.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                ... and {normalRenewals.length - 3} more
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingRenewals;
