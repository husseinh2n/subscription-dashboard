import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Alert,
  Collapse,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Calculate as CalculateIcon,
  Lightbulb as LightbulbIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../services/api';

const SavingsCalculator = ({ subscriptions = [], stats = null }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Calculate potential savings using actual pricing data
  const savingsData = useMemo(() => {
    if (!subscriptions.length) return null;

    // Filter subscriptions that have both pricing options available
    const subscriptionsWithBothPrices = subscriptions.filter(sub => 
      sub.monthly_price && sub.yearly_price
    );

    if (subscriptionsWithBothPrices.length === 0) {
      return {
        monthlyToYearly: [],
        yearlyToMonthly: [],
        totalMonthlySavings: 0,
        totalYearlySavings: 0,
        totalYearlyCostIncrease: 0,
        hasSavings: false,
        hasPricingData: false,
      };
    }

    // Calculate actual savings from switching monthly to yearly
    const monthlyToYearlySavings = subscriptionsWithBothPrices
      .filter(sub => sub.billing_cycle === 'monthly')
      .map(sub => {
        const monthlyCost = parseFloat(sub.monthly_price);
        const yearlyCost = parseFloat(sub.yearly_price);
        const monthlyYearlyEquivalent = monthlyCost * 12;
        const savings = monthlyYearlyEquivalent - yearlyCost;
        
        return {
          ...sub,
          currentCost: monthlyCost,
          potentialCost: yearlyCost / 12, // Monthly equivalent of yearly price
          yearlySavings: savings,
          monthlySavings: savings / 12,
          savingsPercentage: (savings / monthlyYearlyEquivalent) * 100,
        };
      });

    // Calculate cost increase from switching yearly to monthly
    const yearlyToMonthlySavings = subscriptionsWithBothPrices
      .filter(sub => sub.billing_cycle === 'yearly')
      .map(sub => {
        const monthlyCost = parseFloat(sub.monthly_price);
        const yearlyCost = parseFloat(sub.yearly_price);
        const monthlyYearlyEquivalent = monthlyCost * 12;
        const extraCost = monthlyYearlyEquivalent - yearlyCost;
        
        return {
          ...sub,
          currentCost: yearlyCost / 12, // Monthly equivalent of yearly price
          potentialCost: monthlyCost,
          yearlySavings: -extraCost, // Negative savings (cost increase)
          monthlySavings: -extraCost / 12,
          savingsPercentage: -(extraCost / yearlyCost) * 100,
        };
      });

    const totalMonthlySavings = monthlyToYearlySavings.reduce((sum, sub) => sum + sub.monthlySavings, 0);
    const totalYearlySavings = monthlyToYearlySavings.reduce((sum, sub) => sum + sub.yearlySavings, 0);
    const totalYearlyCostIncrease = yearlyToMonthlySavings.reduce((sum, sub) => sum + Math.abs(sub.yearlySavings), 0);

    return {
      monthlyToYearly: monthlyToYearlySavings,
      yearlyToMonthly: yearlyToMonthlySavings,
      totalMonthlySavings,
      totalYearlySavings,
      totalYearlyCostIncrease,
      hasSavings: totalMonthlySavings > 0,
      hasPricingData: true,
    };
  }, [subscriptions]);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };


  if (!savingsData || subscriptions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon />
            Savings Calculator
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              Add some subscriptions to see potential savings from switching billing cycles!
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!savingsData.hasPricingData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon />
            Savings Calculator
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              Add both monthly and yearly prices to your subscriptions to see potential savings!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Edit your subscriptions to include both pricing options for accurate savings calculations.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { 
    monthlyToYearly, 
    yearlyToMonthly, 
    totalMonthlySavings, 
    totalYearlySavings,
    totalYearlyCostIncrease,
    hasSavings 
  } = savingsData;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon />
            Savings Calculator
          </Typography>
          <IconButton onClick={handleToggleExpanded} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Summary */}
        <Box mb={2}>
          {hasSavings ? (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  You could save {formatCurrency(totalMonthlySavings)}/month!
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                That's {formatCurrency(totalYearlySavings)} per year by switching monthly subscriptions to yearly billing
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Click to expand and see which subscriptions to switch
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                sx={{ mt: 2 }}
                onClick={handleToggleExpanded}
                startIcon={<CalculateIcon />}
              >
                View Savings Details
              </Button>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon />
                You're already on optimal billing cycles!
              </Typography>
            </Alert>
          )}
        </Box>

        <Collapse in={expanded}>
          <Box>
            {/* Monthly to Yearly Savings */}
            {monthlyToYearly.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  Switch Monthly → Yearly (Recommended)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These subscriptions offer significant savings when paid annually:
                </Typography>
                <List dense>
                  {monthlyToYearly.map((sub) => (
                    <ListItem
                      key={sub.id}
                      sx={{
                        bgcolor: 'success.50',
                        borderRadius: 2,
                        mb: 2,
                        border: `2px solid ${theme.palette.success.main}30`,
                        '&:hover': {
                          bgcolor: 'success.100',
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold" color="success.dark">
                              {sub.name}
                            </Typography>
                            <Chip
                              label={`Save ${formatCurrency(sub.monthlySavings)}/mo`}
                              size="medium"
                              color="success"
                              icon={<TrendingUpIcon />}
                              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              Current: {formatCurrency(sub.currentCost)}/month
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="success.dark">
                              Switch to: {formatCurrency(sub.potentialCost)}/month (yearly billing)
                            </Typography>
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'success.100', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LightbulbIcon />
                                Annual savings: {formatCurrency(sub.yearlySavings)} ({sub.savingsPercentage.toFixed(1)}% off)
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Yearly to Monthly Warning */}
            {yearlyToMonthly.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon />
                  Keep Yearly Billing (You're Saving Money!)
                </Typography>
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Switching these to monthly would cost you an extra {formatCurrency(totalYearlyCostIncrease)}/year!
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    You're already getting the best deal with yearly billing.
                  </Typography>
                </Alert>
                <List dense>
                  {yearlyToMonthly.map((sub) => (
                    <ListItem
                      key={sub.id}
                      sx={{
                        bgcolor: 'warning.50',
                        borderRadius: 2,
                        mb: 2,
                        border: `2px solid ${theme.palette.warning.main}30`,
                        '&:hover': {
                          bgcolor: 'warning.100',
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold" color="warning.dark">
                              {sub.name}
                            </Typography>
                            <Chip
                              label={`+${formatCurrency(Math.abs(sub.monthlySavings))}/mo extra`}
                              size="medium"
                              color="warning"
                              icon={<TrendingDownIcon />}
                              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body1" fontWeight="medium" color="success.dark">
                              Current: {formatCurrency(sub.currentCost)}/month (yearly billing)
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="warning.dark">
                              If monthly: {formatCurrency(sub.potentialCost)}/month
                            </Typography>
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.100', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon />
                                Extra cost: {formatCurrency(Math.abs(sub.yearlySavings))}/year
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Tips */}
            <Box>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon />
                Tips for Maximum Savings
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        • Many services offer 10-20% discount for annual billing
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        • Consider your cash flow before switching to yearly
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        • Some services offer better deals during promotions
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Collapse>

        {/* Action Button */}
        {hasSavings && (
          <Box mt={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CalculateIcon />}
              onClick={handleToggleExpanded}
              sx={{ borderRadius: 2 }}
            >
              {expanded ? 'Hide' : 'Show'} Detailed Breakdown
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsCalculator;
