from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """
    Admin interface for Subscription model with enhanced functionality.
    """
    list_display = [
        'name', 'cost', 'billing_cycle', 'category', 
        'start_date', 'renewal_date', 'is_active', 'days_until_renewal'
    ]
    list_filter = ['billing_cycle', 'category', 'is_active', 'start_date']
    search_fields = ['name', 'category']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at', 'renewal_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'cost', 'billing_cycle', 'category')
        }),
        ('Dates', {
            'fields': ('start_date', 'renewal_date', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def days_until_renewal(self, obj):
        """Display days until renewal in admin list."""
        return obj.days_until_renewal
    days_until_renewal.short_description = 'Days Until Renewal'
    
    def save_model(self, request, obj, form, change):
        """
        Override save to ensure renewal_date is calculated.
        """
        if not obj.renewal_date:
            obj._calculate_renewal_date()
        super().save_model(request, obj, form, change)
