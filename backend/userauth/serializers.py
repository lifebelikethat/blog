from rest_framework import serializers
from django.contrib.auth import get_user_model
from userauth.models import UserProfile
import secrets

user_model = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_model
        fields = ('id', 'username', 'email', 'is_superuser', 'is_active', 'is_staff', 'date_joined')


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    liked_blogs = serializers.SerializerMethodField('get_liked_blogs')

    def get_liked_blogs(self, object):
        return object.liked_blogs.all()

    class Meta:
        model = UserProfile
        fields = ('__all__')


class RegisterUserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(default='')

    class Meta:
        model = user_model
        fields = ('username', 'email', 'password', 'display_name')

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.get('password')
        display_name = validated_data.get('display_name')

        if display_name == "":
            display_name = username

        user_obj = user_model.objects.create(
                username=username,
                )
        user_obj.set_password(password)
        user_obj.save()

        user_profile = UserProfile.objects.create(
                user=user_obj,
                username=username,
                email=email,
                display_name=display_name,
                email_confirmation_token=secrets.token_hex(32)
                )
        user_profile.save()

        return user_obj


class ConfirmEmailSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=32)
    token = serializers.CharField(max_length=64)

    def create(self, validated_data):
        print(validated_data)
        username = validated_data.get('username')
        token = validated_data.get('token')

        try:
            user = user_model.objects.get(username=username)

        except:
            print(user.userprofile.email_confirmation_token)

        print('try successful')
        if token == user.userprofile.email_confirmation_token:
            user.userprofile.email_confirmation_token = ''
            user.email = user.userprofile.email

            user.save()
            user.userprofile.save()

        return "verified"


class GenerateResetPasswordTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=32)


class ResetPasswordSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(max_length=64)

    class Meta:
        model = UserProfile
        fields = ('password_reset_token', 'new_password')


class ChangePasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=32)
    password = serializers.CharField(max_length=32)
    password1 = serializers.CharField(max_length=32)
    password2 = serializers.CharField(max_length=32)

