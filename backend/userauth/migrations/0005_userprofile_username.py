# Generated by Django 5.0.1 on 2024-02-05 05:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userauth', '0004_userprofile_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='username',
            field=models.CharField(default='aaa', max_length=32),
            preserve_default=False,
        ),
    ]
