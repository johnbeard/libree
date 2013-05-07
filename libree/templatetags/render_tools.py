
from django import template
from django.conf import settings

from utils import tool_registry

from ..libree_html import html_markup as H

register = template.Library()

@register.filter
def tool_title(toolId):
    return tool_registry.registry[toolId]['title']
    
@register.filter
def tool_topic(toolId):
    return tool_registry.registry[toolId]['categories'][0]

@register.simple_tag
def tool_description(toolId):
    return tool_registry.registry[toolId]['description']

@register.simple_tag
def tool_icon(toolId):
    icon = tool_registry.registry[toolId]['icon']

    return icon

@register.simple_tag
def tool_scripts(toolId):
    """add the tool's script deps"""
    out = ''

    try:
        for script in tool_registry.registry[toolId]['scripts']['common']:
            url = settings.STATIC_URL+'js/%s' % script
            out += H.enclose("script", attr={'src':url})
    except KeyError:
        pass

    return out

@register.simple_tag
def inline_file(filename):
    return open(settings.STATIC_ROOT + filename, 'r').read()

