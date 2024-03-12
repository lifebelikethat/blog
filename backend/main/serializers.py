from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator
from django.shortcuts import get_object_or_404
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
        extra_kwargs = {
                'char': {'trim_whitespace': False},
                'text': {'trim_whitespace': False},
                }


class CreateBlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = home.Blog
        fields = ('__all__')


class EditBlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = home.Blog
        fields = ('likes',)


class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = userauth_models.Relationship
        fields = ('__all__')


class CreateRelationshipSerializer(serializers.ModelSerializer):
    from_person = serializers.CharField(max_length=200)
    to_person = serializers.CharField(max_length=200)

    class Meta:
        model = userauth_models.Relationship
        fields = ('__all__')

    def create(self, validated_data):
        from_person_username = validated_data.get('from_person')
        to_person_username = validated_data.get('to_person')
        status = validated_data.get('status')

        from_person_obj = userauth_models.UserProfile.objects.get(username=from_person_username)
        to_person_obj = userauth_models.UserProfile.objects.get(username=to_person_username)

        if from_person_obj == to_person_obj:
            raise serializers.ValidationError({"detail": "from_person and to_person must be unique"})

        relationship = None
        try:
            relationship = get_object_or_404(
                    userauth_models.Relationship,
                    from_person=from_person_obj,
                    to_person=to_person_obj,
                    )
            raise serializers.ValidationError("Relationship already exists")
            return None
        except:
            pass
        
        if relationship is None:
            relationshipObj = userauth_models.Relationship.objects.create(
                    from_person=from_person_obj,
                    to_person=to_person_obj,
                    status=status,
                    )
            relationshipObj.save()
            return relationshipObj


class EditRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = userauth_models.Relationship
        fields = ('status',)
