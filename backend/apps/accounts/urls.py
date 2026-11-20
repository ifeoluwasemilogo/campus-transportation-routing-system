from django.urls import path

from .views import login, logout, refresh_token, register_student

urlpatterns = [
    path('register/', register_student, name='register-student'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('token/refresh/', refresh_token, name='token-refresh'),
]
