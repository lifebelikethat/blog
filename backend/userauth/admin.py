from django.contrib import admin
import userauth.models as userauth

# Register your models here.
admin.site.register(userauth.UserProfile)


@admin.register(userauth.Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_person', 'to_person',)
