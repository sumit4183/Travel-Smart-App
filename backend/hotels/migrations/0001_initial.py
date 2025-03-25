# Generated by Django 5.1.6 on 2025-03-13 07:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='HotelSearch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city_code', models.CharField(max_length=100)),
                ('check_in_date', models.DateField()),
                ('check_out_date', models.DateField()),
                ('adults', models.PositiveIntegerField()),
                ('rooms', models.PositiveIntegerField(default=1)),
                ('rating', models.CharField(blank=True, max_length=20, null=True)),
                ('price_range', models.CharField(blank=True, max_length=50, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
