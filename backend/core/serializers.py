from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from .settings import REST_FRAMEWORK
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        print(user.username)
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["email"] = str(self.user.email)
        data["username"] = str(self.user.username)

        return data
