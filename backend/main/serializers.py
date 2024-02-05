from rest_framework import serializers
from . import models as home
from main import serializers as main_serializers
from userauth import serializers as userauth_serializers
from userauth import models as userauth_models
import datetime


class BlogSerializer(serializers.ModelSerializer):
    likes = userauth_serializers.UserProfileSerializer(many=True, read_only=True)
    time_since = serializers.SerializerMethodField('get_time_since')
    author = userauth_serializers.UserSerializer(many=False)

    def get_time_since(self, object):
        return datetime.datetime.now().timestamp() - object.created.timestamp()

    class Meta:
        model = home.Blog
        fields = ('id', 'author', 'content', 'image', 'likes', 'created', 'updated', 'time_since')


class CreateBlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = home.Blog
        fields = ('__all__')


class EditBlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = home.Blog
        fields = ('likes',)
