from django import template
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

register = template.Library()

local_resources = {
    'bootstrap.css' : 'external/bootstrap/3.0.0/css/bootstrap.css',
}

cdn_resources = {
    'bootstrap.css': '//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css',
}

def local_resource(resource):
    return settings.STATIC_URL + local_resources[resource]

@register.simple_tag
def cdn(resource): 
    
    res = ''

    if settings.USE_CDN:
        if resource in cdn_resources:
            res = cdn_resources[resource]
        elif resource in local_resources:
            logger.warning('CDN resource "%s" not found, falling back to local version: %s' 
                % (resource, local_resources[resource]))
            res = local_resource(resource)
        else:
            logger.error('CDN resource "%s" not found, no local resource available' 
                % (resource))
    else:
        if resource in local_resources:
            res = local_resource(resource)
        else:
            logger.error('Local resource "%s" not found' % (resource))
        
    return res
