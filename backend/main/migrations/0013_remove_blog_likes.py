# Generated by Django 5.0.1 on 2024-02-07 04:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_alter_blog_created_alter_blog_updated'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blog',
            name='likes',
        ),
    ]
