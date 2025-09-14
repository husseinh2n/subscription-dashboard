import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';
import { formatCurrency } from '../services/api';

const Chart = ({ data = {}, subscriptions = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  // Prepare data for different chart types
  const chartData = useMemo(() => {
    // Category breakdown for pie chart
    const categoryData = Object.entries(data).map(([category, amount]) => ({
      name: category,
      value: parseFloat(amount),
      percentage: ((parseFloat(amount) / Object.values(data).reduce((sum, val) => sum + parseFloat(val), 0)) * 100).toFixed(1)
    }));

    // Monthly vs Yearly comparison
    const billingData = subscriptions.reduce((acc, sub) => {
      const cost = parseFloat(sub.cost);
      if (sub.billing_cycle === 'monthly') {
        acc.monthly += cost;
        acc.monthlyCount += 1;
      } else {
        acc.yearly += cost;
        acc.yearlyCount += 1;
      }
      return acc;
    }, { monthly: 0, yearly: 0, monthlyCount: 0, yearlyCount: 0 });

    // Calculate what it would cost if ALL subscriptions were monthly (annual equivalent)
    const totalIfAllMonthly = subscriptions.reduce((sum, sub) => {
      const monthlyPrice = parseFloat(sub.monthly_price || 0);
      return sum + (monthlyPrice * 12); // Convert monthly to annual
    }, 0);

    // Calculate what it would cost if ALL subscriptions were yearly
    const totalIfAllYearly = subscriptions.reduce((sum, sub) => {
      const yearlyPrice = parseFloat(sub.yearly_price || 0);
      return sum + yearlyPrice; // Already annual
    }, 0);

    const billingComparisonData = [
      {
        name: 'Monthly',
        cost: billingData.monthly,
        count: billingData.monthlyCount,
        yearlyEquivalent: billingData.monthly * 12,
      },
      {
        name: 'Yearly',
        cost: billingData.yearly,
        count: billingData.yearlyCount,
        monthlyEquivalent: billingData.yearly / 12,
        yearlyEquivalent: billingData.yearly, // Yearly subscriptions are already yearly
      }
    ];

    // Monthly spending trend (simulated for demo)
    const monthlyTrendData = [
      { month: 'Jan', cost: 120 },
      { month: 'Feb', cost: 135 },
      { month: 'Mar', cost: 128 },
      { month: 'Apr', cost: 142 },
      { month: 'May', cost: 138 },
      { month: 'Jun', cost: 145 },
    ];

    return {
      categoryData,
      billingComparisonData,
      monthlyTrendData,
      totalIfAllYearly,
      totalIfAllMonthly,
    };
  }, [data, subscriptions]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Category-specific color mapping
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Productivity': '#4CAF50', // Green for productivity
      'Entertainment': '#E91E63', // Pink for entertainment
      'Music': '#9C27B0', // Purple for music
      'Software': '#2196F3', // Blue for software
      'Health': '#FF5722', // Deep orange for health
      'Uncategorized': '#607D8B', // Blue grey for uncategorized
    };
    
    return categoryColors[category] || theme.palette.primary.main;
  };

  // Color palette for charts (fallback for non-category charts)
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    '#9C27B0',
    '#FF9800',
    '#795548',
    '#607D8B',
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="subtitle2" fontWeight="medium">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
      <PieChart>
        <Pie
          data={chartData.categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={isMobile ? 80 : 100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );


  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
      <LineChart data={chartData.monthlyTrendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="cost" 
          stroke={theme.palette.primary.main} 
          strokeWidth={3}
          name="Monthly Spending"
          dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Analytics
          </Typography>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
            sx={{ 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Add subscriptions to see analytics and charts
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon />
          Analytics
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="Category Breakdown" />
          <Tab label="Billing Comparison" />
          <Tab label="Spending Trend" />
        </Tabs>

        <Box sx={{ minHeight: isMobile ? 250 : 300 }}>
          {activeTab === 0 && renderPieChart()}
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Billing Cycle Analysis:
              </Typography>
              
              {/* Total Monthly vs Total Yearly Comparison Chart */}
              <Box sx={{ mb: 3, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Total if all Monthly', cost: chartData.totalIfAllMonthly },
                    { name: 'Total if all Yearly', cost: chartData.totalIfAllYearly }
                  ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value), 'Annual Cost']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="cost" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'primary.50',
                    border: `1px solid ${theme.palette.primary.main + '20'}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                    If All Monthly
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(chartData.totalIfAllMonthly / 12)}/month
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual cost: {formatCurrency(chartData.totalIfAllMonthly)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'secondary.50',
                    border: `1px solid ${theme.palette.secondary.main + '20'}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                    If All Yearly
                  </Typography>
                  <Typography variant="h6" color="secondary.main">
                    {formatCurrency(chartData.totalIfAllYearly / 12)}/month
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual cost: {formatCurrency(chartData.totalIfAllYearly)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          {activeTab === 2 && renderLineChart()}
        </Box>

        {/* Chart Summary */}
        {activeTab === 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Category Breakdown Summary:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {chartData.categoryData.map((item, index) => (
                <Box
                  key={item.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: `${COLORS[index % COLORS.length]}15`,
                    border: `1px solid ${COLORS[index % COLORS.length]}30`,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLORS[index % COLORS.length],
                    }}
                  />
                  <Typography variant="caption" fontWeight="medium">
                    {item.name}: {formatCurrency(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}


        {activeTab === 2 && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Spending Trend (Last 6 Months):
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This shows your monthly subscription spending pattern over time.
              {chartData.monthlyTrendData.length > 0 && (
                <span>
                  {' '}Average monthly spending: {formatCurrency(
                    chartData.monthlyTrendData.reduce((sum, item) => sum + item.cost, 0) / chartData.monthlyTrendData.length
                  )}
                </span>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Chart;
