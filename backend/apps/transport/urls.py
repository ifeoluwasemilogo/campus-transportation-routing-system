from django.urls import path
from rest_framework.routers import DefaultRouter

from .admin_api import AdminRouteViewSet, AdminServiceNoticeViewSet, AdminTripViewSet, AdminVehicleViewSet
from .views import AdminBookingListView, AdminDashboardView, BookingCancelView, BookingListCreateView, StudentDashboardView

router = DefaultRouter()
router.register('admin/routes', AdminRouteViewSet, basename='admin-routes')
router.register('admin/vehicles', AdminVehicleViewSet, basename='admin-vehicles')
router.register('admin/trips', AdminTripViewSet, basename='admin-trips')
router.register('admin/notices', AdminServiceNoticeViewSet, basename='admin-notices')

urlpatterns = [
    path('dashboard/student/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-bookings'),
    path('bookings/', BookingListCreateView.as_view(), name='bookings'),
    path('bookings/<int:booking_id>/', BookingCancelView.as_view(), name='booking-cancel'),
] + router.urls
