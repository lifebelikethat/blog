from . import views
from userauth import views as userauth_views
from django.urls import path

urlpatterns = [
        path('blogs/', views.BlogList.as_view({
            'get': 'list',
            'post': 'create',
            }), name='blog-list'),
        path('blogs/<int:id>/', views.BlogDetail.as_view(
            {
                'get': 'retrieve',
                'put': 'update',
                }
            ), name='blog-detail'),
        path('users/', views.UserList.as_view(), name='users'),
        path('users/<str:username>/', views.UserDetail.as_view(), name='user-detail'),
        path('users/<str:username>/blogs/', views.UserBlogList.as_view(), name='user-blogs'),
        path('userprofiles/', views.UserProfileList.as_view(), name='userprofile-list'),
        path('userprofiles/<str:username>/', views.UserProfileDetail.as_view(), name='userprofile-detail'),
        path('userprofiles/<str:username>/following/', views.UserProfileFollowingList.as_view(), name='userprofile-following'),
        path('userprofiles/<str:username>/followers/', views.UserProfileFollowerList.as_view(), name='userprofile-followers'),
        ]
