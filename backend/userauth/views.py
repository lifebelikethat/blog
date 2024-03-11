import secrets
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
        UserSerializer,
        RegisterUserSerializer,
        ConfirmEmailSerializer,
        GenerateResetPasswordTokenSerializer,
        ResetPasswordSerializer,
        ChangePasswordSerializer,
        ResendConfirmEmailSerializer,
        )
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from userauth import models as userauth_models

user_model = get_user_model()


# Create your views here.


class RegisterUser(generics.CreateAPIView):
    serializer_class = RegisterUserSerializer
    queryset = user_model.objects.all()


class ConfirmEmail(generics.CreateAPIView):
    serializer_class = ConfirmEmailSerializer

    def post(self, request):
        serializer = ConfirmEmailSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.data.get('token')

            try:
                user = userauth_models.UserProfile.objects.get(email_confirmation_token=token).user
            except:
                return Response('user not found', status=404)

            if token == user.userprofile.email_confirmation_token:
                user.userprofile.email_confirmation_token = ''
                user.email = user.userprofile.email

                user.save()
                user.userprofile.save()

            else:
                return Response('Invalid URL')

            return Response('email verified')
        return Response(status=400)


class ResendConfirmEmail(APIView):
    def post(self, request):
        serializer = ResendConfirmEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data.get('email')
            user = get_object_or_404(userauth_models.UserProfile, email=email).user

            if user.email and user.email == user.userprofile.email:
                return Response("email already verified", status=400)
            token = user.userprofile.email_confirmation_token
            send_mail(
                    'confirmation email',
                    f'http://127.0.0.1:5173/confirm/{token}/',
                    'settings.EMAIL_HOST_USER',
                    [email],
                    fail_silently=True,
                    )
            return Response('email sent')
        return Response(status=400)


class GenerateResetPasswordToken(generics.CreateAPIView):
    serializer_class = GenerateResetPasswordTokenSerializer

    def post(self, request):
        serializer = GenerateResetPasswordTokenSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.data.get('email')

            try:
                user = user_model.objects.get(email=email)
            except:
                return Response('user not found', status=400)

            token = secrets.token_hex(32)
            user.userprofile.password_reset_token = token
            user.userprofile.save()

            send_mail(
                    "reset password",
                    f"http://127.0.0.1:5173/reset-password/{token}/",
                    "Don't Reply <noreply@domain.example",
                    [email,],
                    fail_silently=False,
                    )

            return Response('Email sent')
        return Response('No user with that email exists', status=400)


class ResetPassword(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.data.get('password_reset_token')
            password = serializer.data.get('new_password')

            try:
                userprofile = userauth_models.UserProfile.objects.get(password_reset_token=token)
                user = userprofile.user
            except:
                return Response('Invalid URL', status=400)

            user.set_password(password)
            userprofile.password_reset_token = ''

            user.save()
            userprofile.save()

            print('password changed')
            print(password)
            print(user.password)

            return Response('password changed', status=200)
        return Response(serializer.errors, status=400)


class ChangePassword(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            password = serializer.data.get('password')
            password1 = serializer.data.get('password1')
            password2 = serializer.data.get('password2')

            try:
                user = request.user
            except:
                return Response('user not found', status=400)

            valid_user = user.check_password(password)
            if not valid_user:
                return Response('no user found', status=400)
            elif password1 != password2:
                return Response('passwords must match', status=400)

            user.set_password(password1)
            user.save()
            return Response('password changed', status=200)
        return Response(serializer.errors, status=400)
