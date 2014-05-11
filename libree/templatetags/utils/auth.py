
"""
Server-side authentication routines
"""

from django.conf import settings
import urllib, urllib2, urlparse
import json

class AuthError(Exception):
    pass

def authenticate(req, authId):

    if authId == "github":
        return authGithub(req)

    return None

def authGithub(req):
    """
    Take a request containing a "code", and exchange it for an API
    access token

    Return the access token, or throw AuthError if something is wrong
    """

    if "code" not in req.GET:
        raise AuthError

    url = "https://github.com/login/oauth/access_token"

    values = {'code' : req.GET["code"],
              'client_id' : settings.AUTHINFO["github"]["clientId"],
              'client_secret' : settings.AUTHINFO["github"]["clientSecret"] }

    headers = {'Accept': 'application/json'}

    data = urllib.urlencode(values)
    request = urllib2.Request(url, data, headers)

    resp = urllib2.urlopen(request)

    if (resp.getcode() != 200):
        raise AuthError

    return resp.read()

