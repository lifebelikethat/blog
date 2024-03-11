from django.db import models
import userauth.models as userauth
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

user_model = get_user_model()


# upload image function
def upload_to(instance, filename):
    return 'posts/{filename}'.format(filename=filename)


# Create your models here.
class Blog(models.Model):
    author = models.ForeignKey(user_model, on_delete=models.CASCADE)
    content = models.CharField(max_length=800, blank=False)
    image = models.ImageField(_("Image"), upload_to=upload_to, default='posts/default.jpg')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now_add=True)
