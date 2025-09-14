from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Subscription
from .serializers import SubscriptionSerializer, SubscriptionStatsSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subscriptions with CRUD operations.
    """
    queryset = Subscription.objects.filter(is_active=True)
    serializer_class = SubscriptionSerializer
    
    def get_queryset(self):
        """
        Optionally filter by category or billing cycle.
        """
        queryset = Subscription.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        billing_cycle = self.request.query_params.get('billing_cycle', None)
        
        if category:
            queryset = queryset.filter(category=category)
        if billing_cycle:
            queryset = queryset.filter(billing_cycle=billing_cycle)
            
        return queryset.order_by('renewal_date')
    
    def perform_destroy(self, instance):
        """
        Soft delete by setting is_active=False instead of hard delete.
        """
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get subscription statistics and analytics.
        """
        active_subscriptions = Subscription.objects.filter(is_active=True)
        all_subscriptions = Subscription.objects.all()  # Include inactive for total spent calculation
        
        # Calculate total costs
        total_monthly_cost = sum(
            sub.get_monthly_equivalent_cost() for sub in active_subscriptions
        )
        total_yearly_cost = sum(
            sub.get_yearly_equivalent_cost() for sub in active_subscriptions
        )
        
        # Count active subscriptions
        total_active_subscriptions = active_subscriptions.count()
        
        # Calculate total spent since first subscription
        total_spent = Decimal('0.00')
        time_since_first_subscription = None
        
        if all_subscriptions.exists():
            # Get the earliest start date
            first_subscription = all_subscriptions.order_by('start_date').first()
            first_start_date = first_subscription.start_date
            
            # Calculate time since first subscription
            today = datetime.now().date()
            time_since_first_subscription = (today - first_start_date).days
            
            # Calculate total spent for each subscription
            for subscription in all_subscriptions:
                if subscription.start_date:
                    # Calculate how many billing cycles have occurred
                    days_since_start = (today - subscription.start_date).days
                    
                    if subscription.billing_cycle == 'monthly':
                        # Approximate months since start (30 days per month)
                        cycles_since_start = max(0, days_since_start // 30)
                        total_spent += subscription.cost * cycles_since_start
                    else:  # yearly
                        # Approximate years since start (365 days per year)
                        cycles_since_start = max(0, days_since_start // 365)
                        total_spent += subscription.cost * cycles_since_start
        
        # Get upcoming renewals (next 7 days)
        today = datetime.now().date()
        next_week = today + timedelta(days=7)
        upcoming_renewals = active_subscriptions.filter(
            renewal_date__range=[today, next_week]
        ).values('id', 'name', 'renewal_date', 'cost', 'billing_cycle')
        
        # Add days until renewal to upcoming renewals
        upcoming_renewals_list = []
        for renewal in upcoming_renewals:
            renewal_date = renewal['renewal_date']
            days_until = (renewal_date - today).days
            upcoming_renewals_list.append({
                'id': renewal['id'],
                'name': renewal['name'],
                'renewal_date': renewal['renewal_date'],
                'cost': float(renewal['cost']),
                'billing_cycle': renewal['billing_cycle'],
                'days_until_renewal': days_until
            })
        
        # Category breakdown
        category_breakdown = {}
        for subscription in active_subscriptions:
            category = subscription.category or 'Uncategorized'
            monthly_cost = subscription.get_monthly_equivalent_cost()
            if category in category_breakdown:
                category_breakdown[category] += float(monthly_cost)
            else:
                category_breakdown[category] = float(monthly_cost)
        
        stats_data = {
            'total_monthly_cost': float(total_monthly_cost),
            'total_yearly_cost': float(total_yearly_cost),
            'total_active_subscriptions': total_active_subscriptions,
            'upcoming_renewals': upcoming_renewals_list,
            'category_breakdown': category_breakdown,
            'total_spent': float(total_spent),
            'time_since_first_subscription': time_since_first_subscription
        }
        
        serializer = SubscriptionStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get list of all unique categories.
        """
        categories = Subscription.objects.filter(
            is_active=True, 
            category__isnull=False
        ).values_list('category', flat=True).distinct()
        
        return Response(list(categories))
    
    @action(detail=True, methods=['patch'])
    def update_renewal_date(self, request, pk=None):
        """
        Manually update the renewal date for a specific subscription.
        """
        try:
            subscription = self.get_object()
            new_renewal_date = request.data.get('renewal_date')
            
            if not new_renewal_date:
                return Response(
                    {'error': 'renewal_date is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate the date format and that it's not in the past
            try:
                from datetime import datetime
                renewal_date = datetime.strptime(new_renewal_date, '%Y-%m-%d').date()
                if renewal_date < datetime.now().date():
                    return Response(
                        {'error': 'Renewal date cannot be in the past'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the renewal date manually
            subscription.update_renewal_date_manually(renewal_date)
            
            # Return the updated subscription
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
            
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'Subscription not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )