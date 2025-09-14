from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from subscriptions.models import Subscription


class Command(BaseCommand):
    help = 'Load sample subscription data for demonstration'

    def handle(self, *args, **options):
        """
        Create sample subscriptions based on the implementation plan.
        """
        # Sample data with realistic monthly and yearly pricing
        sample_subscriptions = [
            {
                "name": "Netflix",
                "monthly_price": 15.99,
                "yearly_price": 159.99,  # ~17% savings
                "cost": 15.99,
                "billing_cycle": "monthly",
                "category": "Entertainment",
                "start_date": date(2024, 1, 1)
            },
            {
                "name": "Spotify Premium",
                "monthly_price": 9.99,
                "yearly_price": 99.99,  # ~17% savings
                "cost": 9.99,
                "billing_cycle": "monthly",
                "category": "Music",
                "start_date": date(2024, 1, 15)
            },
            {
                "name": "Adobe Creative Cloud",
                "monthly_price": 52.99,
                "yearly_price": 599.99,  # ~6% savings
                "cost": 52.99,
                "billing_cycle": "monthly",
                "category": "Software",
                "start_date": date(2024, 1, 1)
            },
            {
                "name": "Microsoft 365",
                "monthly_price": 9.99,
                "yearly_price": 99.99,  # ~17% savings
                "cost": 99.99,
                "billing_cycle": "yearly",
                "category": "Productivity",
                "start_date": date(2024, 1, 1)
            },
            {
                "name": "Gym Membership",
                "monthly_price": 49.99,
                "yearly_price": 499.99,  # ~17% savings
                "cost": 49.99,
                "billing_cycle": "monthly",
                "category": "Health",
                "start_date": date(2024, 1, 10)
            },
            {
                "name": "Dropbox Plus",
                "monthly_price": 9.99,
                "yearly_price": 99.99,  # ~17% savings
                "cost": 99.99,
                "billing_cycle": "yearly",
                "category": "Storage",
                "start_date": date(2024, 2, 1)
            }
        ]

        # Clear existing sample data (optional - comment out if you want to keep existing data)
        Subscription.objects.filter(name__in=[sub['name'] for sub in sample_subscriptions]).delete()

        created_count = 0
        for sub_data in sample_subscriptions:
            subscription, created = Subscription.objects.get_or_create(
                name=sub_data['name'],
                defaults={
                    'monthly_price': sub_data.get('monthly_price'),
                    'yearly_price': sub_data.get('yearly_price'),
                    'cost': sub_data['cost'],
                    'billing_cycle': sub_data['billing_cycle'],
                    'category': sub_data['category'],
                    'start_date': sub_data['start_date'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created subscription: {subscription.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Subscription already exists: {subscription.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {created_count} sample subscriptions!')
        )
        
        # Display summary
        total_subscriptions = Subscription.objects.filter(is_active=True).count()
        total_monthly_cost = sum(
            sub.get_monthly_equivalent_cost() 
            for sub in Subscription.objects.filter(is_active=True)
        )
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'Total active subscriptions: {total_subscriptions}')
        self.stdout.write(f'Total monthly cost: ${total_monthly_cost:.2f}')
        self.stdout.write(f'Total yearly cost: ${total_monthly_cost * 12:.2f}')
