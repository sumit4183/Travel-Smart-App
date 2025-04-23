#!/bin/bash

echo "Running at $(date)" >> /tmp/flight_alerts_debug.log
echo "Whoami: $(whoami)" >> /tmp/flight_alerts_debug.log
echo "Path: $PATH" >> /tmp/flight_alerts_debug.log

export DJANGO_SECRET_KEY='django-insecure-8#y-c$-&8qs##0o#l(q+(9@8##pcb4l=k^wsn3ep@*cpkcnd3_'
cd /Users/uchang/Documents/GitHub/Travel-Smart-App/backend

# activate the virtualenv manually
source ./venv/bin/activate

# run using active venv's python
python manage.py check_flight_alerts >> /tmp/flight_alerts_debug.log 2>&1