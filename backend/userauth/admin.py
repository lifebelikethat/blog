from django.contrib import admin
import userauth.models as userauth

# Register your models here.
admin.site.register(userauth.UserProfile)
admin.site.register(userauth.Relationship)
