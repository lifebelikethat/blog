from django.db import models
from django.contrib.auth import get_user_model
user_model = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(user_model, on_delete=models.CASCADE)
    username = models.CharField(max_length=32)
    display_name = models.CharField(max_length=32)
    email = models.EmailField(max_length=32, default='')
    email_confirmation_token = models.CharField(max_length=64, default='')
    password_reset_token = models.CharField(max_length=64, default='')
    relationships = models.ManyToManyField(
            'self',
            through='Relationship',
            symmetrical=False,
            related_name='related_to',
            )

    def __str__(self):
        return self.user.username

    def add_relationship(self, to_person, status):
        relation = Relationship.objects.create(
                from_person=self,
                to_person=to_person,
                status=status,
                )
        relation.save()
        return relation

    def remove_relationship(self, to_person):
        relation = Relationship.objects.get(
                from_person=self,
                to_person=to_person,
                )
        relation.delete()
        return relation

    def get_relationship(self, status):
        related_to_queryset = self.relationships.filter(
                to_people__from_person=self,
                to_people__status=status,
                )
        return related_to_queryset

    def get_related_to(self, status):
        related_to_queryset = self.related_to.filter(
                from_people__to_person=self,
                from_people__status=status,
                )
        return related_to_queryset

    def get_following(self):
        following_queryset = self.get_relationship(1)
        return following_queryset

    def get_followers(self):
        followers_queryset = self.get_related_to(1)
        return followers_queryset

    def get_blocked(self, to_person):
        blocked_queryset = self.get_relationship(2)
        return blocked_queryset


relationship_choices = (
        (1, 'Following'),
        (2, 'Blocked'),
        )


class Relationship(models.Model):
    from_person = models.ForeignKey(UserProfile, related_name='from_people', on_delete=models.CASCADE)
    to_person = models.ForeignKey(UserProfile, related_name='to_people', on_delete=models.CASCADE)
    status = models.IntegerField(choices=relationship_choices)

