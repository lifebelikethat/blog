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
                'delete': 'destroy',
                }
            ), name='blog-detail'),
        path('blogs/author=<str:author>/', views.BlogList.as_view({'get': 'list'})),
        path('blogs/following/', views.BlogFollowing.as_view(), name='blogs-following'),
        path('user/', views.CurrentUser.as_view(), name='current-user'),
        path('userprofile/', views.CurrentUserProfile.as_view(), name='current-userprofile'),
        path('users/', views.UserList.as_view(), name='users'),
        path('users/<str:username>/', views.UserDetail.as_view(), name='user-detail'),
        path('users/<str:username>/blogs/', views.UserBlogList.as_view(), name='user-blogs'),
        path('userprofiles/', views.UserProfileList.as_view(), name='userprofile-list'),
        path('userprofiles/<str:username>/', views.UserProfileDetail.as_view({
            'get': 'retrieve',
            'put': 'partial_update',
            }), name='userprofile-detail'),
        path('userprofiles/<str:username>/following/', views.UserProfileFollowingList.as_view(), name='userprofile-following'),
        path('userprofiles/<str:username>/followers/', views.UserProfileFollowerList.as_view(), name='userprofile-followers'),
        path('userprofiles/<str:username>/blocked/', views.UserProfileBlockedList.as_view(), name='userprofile-blocked'),
        path('relationships/', views.RelationshipList.as_view(), name='relationships'),
        path('relationships/<str:from_person>/<str:to_person>/', views.RelationshipDetail.as_view({
            'get': 'retrieve',
            'put': 'partial_update',
            'delete': 'destroy',
            }), name='relationship-detail'),
        ]
