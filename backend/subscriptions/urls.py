from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'subscriptions', SubscriptionViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('api/', include(router.urls)),
]
