from django.db import models
from datetime import datetime, timedelta
from decimal import Decimal


class Subscription(models.Model):
    """
    Model representing a subscription service with auto-renewal calculation.
    """
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    name = models.CharField(max_length=200, help_text="Name of the subscription service")
    
    # Pricing options - users can enter both monthly and yearly prices
    monthly_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Monthly subscription price (optional)"
    )
    yearly_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Yearly subscription price (optional)"
    )
    
    # Current billing setup
    billing_cycle = models.CharField(
        max_length=10, 
        choices=BILLING_CYCLE_CHOICES,
        help_text="Current billing frequency"
    )
    cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Current subscription cost (based on billing cycle)"
    )
    start_date = models.DateField(help_text="When the subscription started")
    renewal_date = models.DateField(help_text="Next renewal date (auto-calculated)")
    is_active = models.BooleanField(
        default=True, 
        help_text="Whether the subscription is currently active"
    )
    category = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Category for grouping subscriptions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['renewal_date']
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
    
    def save(self, *args, **kwargs):
        """
        Override save method to automatically calculate renewal_date
        based on billing_cycle and start_date.
        """
        # Always recalculate renewal_date when start_date or billing_cycle changes
        self.calculate_renewal_date()
        super().save(*args, **kwargs)
    
    def update_renewal_date_manually(self, new_renewal_date):
        """
        Manually update the renewal date without recalculating from start_date.
        This allows users to set custom renewal dates.
        """
        self.renewal_date = new_renewal_date
        self.save(update_fields=['renewal_date'])
    
    def calculate_renewal_date(self):
        """
        Calculate the next upcoming renewal date based on billing cycle and start date.
        This finds the next renewal date that is in the future, not just the first one.
        """
        if not self.start_date or not self.billing_cycle:
            return
            
        from datetime import date
        today = date.today()
        
        if self.billing_cycle == 'monthly':
            # Calculate the next monthly renewal date
            self.renewal_date = self._get_next_monthly_renewal(today)
        elif self.billing_cycle == 'yearly':
            # Calculate the next yearly renewal date
            self.renewal_date = self._get_next_yearly_renewal(today)
    
    def _get_next_monthly_renewal(self, today):
        """
        Get the next monthly renewal date that is in the future.
        """
        from datetime import date
        
        # Start with the first renewal date (1 month after start)
        if self.start_date.month == 12:
            next_renewal = self.start_date.replace(year=self.start_date.year + 1, month=1)
        else:
            next_renewal = self.start_date.replace(month=self.start_date.month + 1)
        
        # Keep adding months until we find a date in the future
        while next_renewal <= today:
            if next_renewal.month == 12:
                next_renewal = next_renewal.replace(year=next_renewal.year + 1, month=1)
            else:
                next_renewal = next_renewal.replace(month=next_renewal.month + 1)
        
        return next_renewal
    
    def _get_next_yearly_renewal(self, today):
        """
        Get the next yearly renewal date that is in the future.
        """
        from datetime import date
        
        # Start with the first renewal date (1 year after start)
        next_renewal = self.start_date.replace(year=self.start_date.year + 1)
        
        # Keep adding years until we find a date in the future
        while next_renewal <= today:
            next_renewal = next_renewal.replace(year=next_renewal.year + 1)
        
        return next_renewal
    
    def get_days_until_renewal(self):
        """
        Calculate days until next renewal.
        """
        today = datetime.now().date()
        delta = self.renewal_date - today
        return delta.days
    
    def get_monthly_equivalent_cost(self):
        """
        Get the monthly equivalent cost regardless of billing cycle.
        Uses actual pricing data when available, falls back to calculated values.
        """
        if self.billing_cycle == 'monthly':
            return self.cost
        else:  # yearly
            # If we have actual yearly price, use it; otherwise calculate from monthly
            if self.yearly_price:
                return self.yearly_price / 12
            else:
                return self.cost / 12
    
    def get_yearly_equivalent_cost(self):
        """
        Get the yearly equivalent cost regardless of billing cycle.
        Uses actual pricing data when available, falls back to calculated values.
        """
        if self.billing_cycle == 'yearly':
            return self.cost
        else:  # monthly
            # If we have actual monthly price, use it; otherwise calculate from yearly
            if self.monthly_price:
                return self.monthly_price * 12
            else:
                return self.cost * 12
    
    def get_available_pricing_options(self):
        """
        Get all available pricing options for this subscription.
        Returns a dict with available pricing information.
        """
        options = {}
        
        if self.monthly_price:
            options['monthly'] = {
                'price': self.monthly_price,
                'billing_cycle': 'monthly',
                'is_current': self.billing_cycle == 'monthly'
            }
        
        if self.yearly_price:
            options['yearly'] = {
                'price': self.yearly_price,
                'billing_cycle': 'yearly',
                'is_current': self.billing_cycle == 'yearly'
            }
        
        return options
    
    def get_savings_opportunity(self):
        """
        Calculate potential savings from switching billing cycles.
        Returns savings info if both pricing options are available.
        """
        if not (self.monthly_price and self.yearly_price):
            return None
        
        monthly_yearly_cost = self.monthly_price * 12
        savings = monthly_yearly_cost - self.yearly_price
        savings_percentage = (savings / monthly_yearly_cost) * 100 if monthly_yearly_cost > 0 else 0
        
        return {
            'monthly_cost': self.monthly_price,
            'yearly_cost': self.yearly_price,
            'monthly_yearly_equivalent': monthly_yearly_cost,
            'savings': savings,
            'savings_percentage': savings_percentage,
            'recommendation': 'yearly' if savings > 0 else 'monthly'
        }
    
    def __str__(self):
        return f"{self.name} - ${self.cost}/{self.billing_cycle}"
