from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator
from userauth.models import UserProfile
import secrets

user_model = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_model
        fields = ('id', 'username', 'email',)
        extra_kwargs = {
                'email': {
                    'validators': {
                        UniqueValidator(
                            queryset=user_model.objects.all(),
                            message='A user with that email already exists.',
                            )
                        },
                    'required': False,
                    },
                'username': {
                    'required': False,
                    }
                }

    def update(self, instance, validated_data):
        validated_data_fields = list(validated_data.keys())
        validated_data_fields.remove('email')
        userprofile_fields = [field.name for field in UserProfile._meta.get_fields()]

        for field in validated_data_fields:
            setattr(instance, field, validated_data.get(field))

            # check for fields that are in user_model and UserProfile
            if field in userprofile_fields:
                user_field_value = getattr(instance, field)
                setattr(instance.userprofile, field, user_field_value)

        token = secrets.token_urlsafe(32)
        email = validated_data.get('email')

        if email == instance.email:
            raise serializers.ValidationError({"email": "choose another email"})

        instance.userprofile.email = email
        instance.userprofile.email_confirmation_token = token
        send_mail(
                "change email",
                f'http://127.0.0.1:5173/confirm/{token}/',
                "settings.EMAIL_HOST_USER",
                [email,],
                fail_silently=False,
                )

        instance.save()
        instance.userprofile.save()
        return instance


class EditUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_model
        fileds = ('username',)


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ('__all__')


class EditUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('liked_blogs',)


class RegisterUserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(default='')

    class Meta:
        model = user_model
        fields = ('username', 'email', 'password', 'display_name')
        extra_kwargs = {
                'password': {
                    'write_only': True,
                    'style': {'input_type': 'password'},
                    },
                'username': {
                    'validators': {
                        UniqueValidator(
                            queryset=model.objects.all()
                            )
                        },
                    'min_length': 8,
                    },
                'email': {
                    'validators': {
                        UniqueValidator(
                            queryset=model.objects.all()
                            )
                        }
                    }
                }

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.get('password')
        display_name = validated_data.get('display_name')

        if user_model.objects.filter(email=email):
            raise serializers.ValidationError({"email": "user with that email already exists"})

        if display_name == "":
            display_name = username

        user_obj = user_model.objects.create(
                username=username,
                )
        user_obj.set_password(password)
        user_obj.save()

        token = secrets.token_hex(32)
        user_profile = UserProfile.objects.create(
                user=user_obj,
                username=username,
                email=email,
                display_name=display_name,
                email_confirmation_token=token
                )
        user_profile.save()

        send_mail(
                "reset password",
                f"http://127.0.0.1:5173/confirm/{token}/",
                "settings.EMAIL_HOST_USER",
                [email,],
                fail_silently=False,
                )
        return user_obj


class ConfirmEmailSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=64)

    def create(self, validated_data):
        token = validated_data.get('token')

        try:
            user = UserProfile.objects.get(email_confirmation_token=token).user
            user.save()
        except:
            raise serializers.ValidationError({"token": "invalid URL"})

        return "verified"


class ResendConfirmEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=32)


class GenerateResetPasswordTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=32)


class ResetPasswordSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(max_length=64)

    class Meta:
        model = UserProfile
        fields = ('password_reset_token', 'new_password')
        extra_kwargs = {
                'password_reset_token': {
                    'required': True,
                    },
                }


class ChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=32)
    password1 = serializers.CharField(max_length=32)
    password2 = serializers.CharField(max_length=32)

