import secrets
from .serializers import (
        UserSerializer,
        RegisterUserSerializer,
        ConfirmEmailSerializer,
        GenerateResetPasswordTokenSerializer,
        ResetPasswordSerializer,
        ChangePasswordSerializer,
        )
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from userauth import models as userauth_models

user_model = get_user_model()


# Create your views here.
class UserList(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = user_model.objects.all()


class UserDetail(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    queryset = user_model.objects.all()
    lookup_field = 'username'
    lookup_url_kwarg = 'username'


class RegisterUser(generics.CreateAPIView):
    serializer_class = RegisterUserSerializer
    queryset = user_model.objects.all()


class ConfirmEmail(generics.CreateAPIView):
    serializer_class = ConfirmEmailSerializer

    def post(self, request):
        serializer = ConfirmEmailSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.data.get('username')
            token = serializer.data.get('token')

            try:
                user = user_model.objects.get(username=username)

            except:
                print('user not found')

            if token == user.userprofile.email_confirmation_token:
                user.userprofile.email_confirmation_token = ''
                user.email = user.userprofile.email

                user.save()
                user.userprofile.save()

            return Response('email verified')
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

            """
            send email
            """

            token = secrets.token_urlsafe(64)
            user.userprofile.password_reset_token = token
            user.userprofile.save()

            return Response('Email sent')
        return Response('No user with that email exists', status=400)


class ResetPassword(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.data.get('password_reset_token')
            password = serializer.data.get('password')

            try:
                user = user_model.userprofile.objects.get(password_reset_token=token)
            except:
                return Response('Invalid URL', status=400)

            user.set_password(password)
            user.userprofile.password_reset_token = ''

            user.save()
            user.userprofile.save()

            return Response('password changed', status=200)
        return Response('invalid password', status=400)


class ChangePassword(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')
            password1 = serializer.data.get('password1')
            password2 = serializer.data.get('password2')

            try:
                user = user_model.objects.get(username=username)
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
