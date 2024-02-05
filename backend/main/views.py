from django.shortcuts import render
from rest_framework import generics
import userauth.serializers as userauth_serializers
from . import serializers as main_serializers
from . import models as home_models
from userauth import models as userauth_models
from rest_framework import viewsets
from django.contrib.auth import get_user_model

user_model = get_user_model()


# Create your views here.
class UserList(generics.ListAPIView):
    serializer_class = userauth_serializers.UserSerializer
    queryset = user_model.objects.all()


class UserDetail(generics.RetrieveAPIView):
    serializer_class = userauth_serializers.UserSerializer
    queryset = user_model.objects.all()
    lookup_field = 'username'
    lookup_url_kwarg = 'username'


class BlogList(viewsets.ModelViewSet):
    queryset = home_models.Blog.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return main_serializers.BlogSerializer
        if self.action == 'create':
            return main_serializers.CreateBlogSerializer


class BlogDetail(viewsets.ModelViewSet):
    queryset = home_models.Blog.objects.all()
    lookup_url_kwarg = 'id'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return main_serializers.BlogSerializer
        if self.action == 'update':
            return main_serializers.EditBlogSerializer


class UserBlogList(generics.ListCreateAPIView):
    serializer_class = main_serializers.BlogSerializer

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = user_model.objects.get(username=username)
        print(user.blog_set.all())
        return home_models.Blog.objects.filter(author=user)


class UserProfileList(generics.ListAPIView):
    queryset = userauth_models.UserProfile.objects.all()
    serializer_class = userauth_serializers.UserProfileSerializer


class UserProfileDetail(generics.RetrieveAPIView):
    serializer_class = userauth_serializers.UserProfileSerializer
    queryset = userauth_models.UserProfile.objects.all()
    lookup_url_kwarg = 'username'
    lookup_field = 'username'


class UserProfileFollowingList(generics.ListAPIView):
    serializer_class = userauth_serializers.UserProfileSerializer

    def get_queryset(self):
        queryset = userauth_models.UserProfile.objects.get(id=self.kwargs['id']).get_following()
        return queryset


class UserProfileFollowerList(generics.ListAPIView):
    serializer_class = userauth_serializers.UserProfileSerializer

    def get_queryset(self):
        queryset = userauth_models.UserProfile.objects.get(id=self.kwargs['id']).get_followers()
        return queryset
