# Generated by Django 5.0.1 on 2024-01-27 04:31

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('userauth', '0002_alter_relationship_from_person_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(blank=True, max_length=800)),
                ('likes', models.ManyToManyField(to='userauth.userprofile')),
            ],
        ),
    ]
