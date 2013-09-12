# Django settings for the LibreEE project.
# These settings are local to the server that LibrEE is served on -
# change then to suit your installation

import os

# Turn this off on a public-facing site! Turn it on to allow simple
# serving via runserver
DEBUG = True 

# True to use CDN services to serve common statics, False to serve from
# the LibrEE copy. Turn this off for offline development!
USE_CDN = False

TEMPLATE_DEBUG = DEBUG

ADMINS = (
     ('Admin McGuire', 'admin@example.com'),
)

DatabasePath = '/home/USERNAME/db/libreeDB/db.sqlite'

TIME_ZONE = 'America/Chicago'

# path on the local filesystem where files will be collected
STATIC_ROOT = '/home/USERNAME/public_html/libreestatic/'

# publically accessible location (corresponding to STATIC_ROOT)
#STATIC_URL = '/static/' # for local serving
STATIC_URL = 'http://libreeclone.org/libreestatic/' 

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'supersecreycodekeypassphrasegoeshere-hellomrNSAagehowareyoutoday'
