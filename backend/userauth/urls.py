from django.urls import path
from . import views

urlpatterns = [
        path('register/', views.RegisterUser.as_view(), name='register'),
        path('confirm-email/', views.ConfirmEmail.as_view(), name='confirm-email'),
        path('reset-password-email/', views.GenerateResetPasswordToken.as_view(), name='reset-password-email'),
        path('reset-password/', views.ResetPassword.as_view(), name='reset-password'),
        path('change-password/', views.ChangePassword.as_view(), name='change-password'),
        ]
