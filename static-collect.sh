#!/bin/sh

while inotifywait -r -q -e modify -e create -e delete "libree"; do
    python manage.py collectstatic --noinput
done
