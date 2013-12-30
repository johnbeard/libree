import json

from django import template
from django.conf import settings

register = template.Library()

@register.simple_tag
def require_config():

    paths = {
        "jquery.flot" :
            'external/flot/flot-0.8.1/jquery.flot.min',
        "jquery.flot.resize" :
            'external/flot/flot-0.8.1/jquery.flot.resize.min',
        "jquery.flot.axislabels" :
            'external/flot/flot-0.8.1/jquery.flot.axislabels',
        "qunit" :
            'external/qunit/1.12.0/qunit-1.12.0',
        "raphael" :
            'external/raphael/raphael-min',
        "raphael.g" :
            'external/raphael/g.raphael-min',
        "raphael.g.line" :
            'external/raphael/g.line-min',
    }

    if (settings.USE_CDN):
        paths['jquery'] = "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min"
        paths['jquery.bootstrap'] = "//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap"
        paths['mathjax'] = "https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"
    else:
        paths['jquery'] = "external/jquery-2.0.3.min"
        paths['jquery.bootstrap'] = "external/bootstrap/3.0.0/js/bootstrap"
        paths['mathjax'] = "external/mathjax/MathJax"

    shims = {
        "jquery" : {
            "exports" : "jQuery"
            },
        "jquery.bootstrap": {
            "deps": ["jquery"]
            },
        "jquery.flot": {
            "deps": ["jquery"]
            },
        "jquery.flot.resize": {
            "deps": ["jquery.flot"]
            },
        "jquery.flot.axislabels": {
            "deps": ["jquery.flot"]
            },
        "qunit": {
            "deps": ["jquery"],
            "exports": 'QUnit'
            },
        "raphael.g": {
            "deps": ["raphael"]
            },
        "raphael.g.line": {
            "deps": ["raphael.g"]
            },
        }

    jsn = {'paths': paths,
        'shim': shims
        }

    jsn['baseUrl'] = settings.STATIC_URL

    if not settings.REQUIRE_DEBUG:
        jsn['baseUrl'] + '/min'

    return "require.config(%s);" % json.dumps(jsn)
