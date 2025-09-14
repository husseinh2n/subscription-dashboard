from rest_framework import serializers
from .models import Subscription
from datetime import datetime


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Subscription model with additional computed fields.
    """
    days_until_renewal = serializers.SerializerMethodField()
    monthly_equivalent_cost = serializers.SerializerMethodField()
    yearly_equivalent_cost = serializers.SerializerMethodField()
    available_pricing_options = serializers.SerializerMethodField()
    savings_opportunity = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'name', 'monthly_price', 'yearly_price', 'cost', 'billing_cycle', 
            'start_date', 'renewal_date', 'is_active', 'category', 'created_at', 
            'updated_at', 'days_until_renewal', 'monthly_equivalent_cost',
            'yearly_equivalent_cost', 'available_pricing_options', 'savings_opportunity'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'renewal_date', 'cost']
    
    def get_days_until_renewal(self, obj):
        """Calculate days until renewal."""
        return obj.get_days_until_renewal()
    
    def get_monthly_equivalent_cost(self, obj):
        """Get monthly equivalent cost."""
        return float(obj.get_monthly_equivalent_cost())
    
    def get_yearly_equivalent_cost(self, obj):
        """Get yearly equivalent cost."""
        return float(obj.get_yearly_equivalent_cost())
    
    def get_available_pricing_options(self, obj):
        """Get available pricing options for this subscription."""
        return obj.get_available_pricing_options()
    
    def get_savings_opportunity(self, obj):
        """Get savings opportunity information."""
        savings = obj.get_savings_opportunity()
        if savings:
            # Convert Decimal to float for JSON serialization
            return {
                'monthly_cost': float(savings['monthly_cost']),
                'yearly_cost': float(savings['yearly_cost']),
                'monthly_yearly_equivalent': float(savings['monthly_yearly_equivalent']),
                'savings': float(savings['savings']),
                'savings_percentage': float(savings['savings_percentage']),
                'recommendation': savings['recommendation']
            }
        return None
    
    
    def validate_monthly_price(self, value):
        """Validate that monthly price is positive if provided."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Monthly price must be greater than 0")
        return value
    
    def validate_yearly_price(self, value):
        """Validate that yearly price is positive if provided."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Yearly price must be greater than 0")
        return value
    
    def validate(self, data):
        """Validate that at least one pricing option is provided."""
        monthly_price = data.get('monthly_price')
        yearly_price = data.get('yearly_price')
        
        if not monthly_price and not yearly_price:
            raise serializers.ValidationError(
                "At least one pricing option (monthly or yearly) must be provided"
            )
        
        # Validate that the current billing cycle has a corresponding price
        billing_cycle = data.get('billing_cycle')
        
        if billing_cycle == 'monthly' and not monthly_price:
            raise serializers.ValidationError(
                "Monthly price is required when billing cycle is monthly"
            )
        
        if billing_cycle == 'yearly' and not yearly_price:
            raise serializers.ValidationError(
                "Yearly price is required when billing cycle is yearly"
            )
        
        return data
    
    def validate_renewal_date(self, value):
        """Validate that renewal date is not in the past."""
        if value < datetime.now().date():
            raise serializers.ValidationError("Renewal date cannot be in the past")
        return value


class SubscriptionStatsSerializer(serializers.Serializer):
    """
    Serializer for subscription statistics and analytics.
    """
    total_monthly_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_yearly_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_active_subscriptions = serializers.IntegerField()
    upcoming_renewals = serializers.ListField()
    category_breakdown = serializers.DictField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    time_since_first_subscription = serializers.IntegerField(allow_null=True)
