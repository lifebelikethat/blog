from django.shortcuts import render, get_object_or_404
from rest_framework import generics
import userauth.serializers as userauth_serializers
from . import serializers as main_serializers
from . import models as home_models
from userauth import models as userauth_models
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly

user_model = get_user_model()


# Create your views here.
class UserList(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserSerializer
    queryset = user_model.objects.all()


class UserDetail(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserSerializer
    queryset = user_model.objects.all()
    lookup_field = 'username'
    lookup_url_kwarg = 'username'


class CurrentUser(generics.RetrieveUpdateAPIView):
    serializer_class = userauth_serializers.UserSerializer
    queryset = user_model.objects.all()

    def get_object(self):
        return self.request.user


class CurrentUserProfile(generics.RetrieveAPIView):
    serializer_class = userauth_serializers.UserProfileSerializer
    queryset = userauth_models.UserProfile.objects.all()

    def get_object(self):
        return self.request.user.userprofile


class BlogList(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    ordering_fields = ['id', 'created']

    def get_queryset(self):
        author = self.kwargs.get('author')
        if author is not None:
            return home_models.Blog.objects.filter(author__username=author)
        return home_models.Blog.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return main_serializers.BlogSerializer
        if self.action == 'create':
            return main_serializers.CreateBlogSerializer


class BlogDetail(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    queryset = home_models.Blog.objects.all()
    lookup_url_kwarg = 'id'

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'destroy':
            return main_serializers.BlogSerializer
        if self.action == 'update':
            return main_serializers.EditBlogSerializer


class BlogFollowing(generics.ListAPIView):
    serializer_class = main_serializers.BlogSerializer

    def get_queryset(self):
        current_user = self.request.user
        followed_userprofiles = current_user.userprofile.get_following()
        followed_users = [userprofile.user for userprofile in followed_userprofiles]
        queryset = home_models.Blog.objects.filter(author__in=followed_users)
        return queryset


class UserBlogList(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly)
    serializer_class = main_serializers.BlogSerializer

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = user_model.objects.get(username=username)
        print(user.blog_set.all())
        return home_models.Blog.objects.filter(author=user)


class UserProfileList(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly)
    queryset = userauth_models.UserProfile.objects.all()
    serializer_class = userauth_serializers.UserProfileSerializer


class UserProfileDetail(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserProfileSerializer
    queryset = userauth_models.UserProfile.objects.all()
    lookup_url_kwarg = 'username'
    lookup_field = 'username'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return userauth_serializers.UserProfileSerializer
        if self.action == 'partial_update':
            return userauth_serializers.EditUserProfileSerializer


class UserProfileFollowingList(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserProfileSerializer

    def get_queryset(self):
        queryset = userauth_models.UserProfile.objects.get(username=self.kwargs['username']).get_following()
        return queryset


class UserProfileFollowerList(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserProfileSerializer

    def get_queryset(self):
        queryset = userauth_models.UserProfile.objects.get(username=self.kwargs['username']).get_followers()
        return queryset


class UserProfileBlockedList(generics.ListAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = userauth_serializers.UserProfileSerializer

    def get_queryset(self):
        queryset = userauth_models.UserProfile.objects.get(username=self.kwargs['username']).get_blocked()
        return queryset


class RelationshipList(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    serializer_class = main_serializers.CreateRelationshipSerializer
    queryset = userauth_models.Relationship.objects.all()


class RelationshipDetail(viewsets.ModelViewSet):
    queryset = userauth_models.Relationship.objects.all()

    def get_object(self):
        queryset = self.get_queryset()
        from_person_username = self.kwargs.get('from_person')
        to_person_username = self.kwargs.get('to_person')

        from_person_obj = userauth_models.UserProfile.objects.get(username=from_person_username)
        to_person_obj = userauth_models.UserProfile.objects.get(username=to_person_username)

        obj = get_object_or_404(queryset, from_person=from_person_obj, to_person=to_person_obj)
        return obj

    def get_serializer_class(self):
        if self.action == 'retrieve' and 'destroy':
            return main_serializers.RelationshipSerializer
        if self.action == 'partial_update':
            return main_serializers.EditRelationshipSerializer
