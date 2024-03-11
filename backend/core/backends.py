from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
user_model = get_user_model()


class EmailOrUsernameAndPassword(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = user_model.objects.get(user=username)
        except:
            user = user_model.objects.get(email=username)

        valid_login = user.check_password(password)
        if valid_login:
            return user

    def get_user(self, user_id):
        try:
            return user_model.objects.get(id=user_id)
        except user_model.DoesNotExist:
            return None


class EmailOrUsername(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = user_model.objects.get(user=username)
        except:
            user = user_model.objects.get(email=username)

        valid_login = user.check_password(password)
        if valid_login:
            return user

    def get_user(self, user_id):
        try:
            return user_model.objects.get(id=user_id)
        except user_model.DoesNotExist:
            return None
