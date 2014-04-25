
from django import template
from django.conf import settings

from utils import tool_registry

import os

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

    extn = '.svg'
    for ext in ['.png', '.jpg', '.jpeg', '.gif']:
        if icon.endswith(ext):
            extn = ext
            icon = icon[:-len(extn)]
            break

    return icon + "-48" + extn

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

@register.filter
def get_test_js(testId):
    jsLoc = settings.STATIC_URL + "tests/" + testId

    if os.path.isdir(os.path.join(settings.STATIC_ROOT, "tests", testId)):
        jsLoc += "/main.js"
    else:
        jsLoc += ".js"

    return jsLoc


@register.inclusion_tag('components/input-with-dropdown.html')
def input_with_dropdown(title, choices, default, idName, leftSide, splitChar=' '):

    choices = choices.split(splitChar);

    if type(title) is int and title < len(choices) :
        title = choices[title]

    return {
        'button_left' : leftSide,
        'dropdown_title': title,
        'dropdown_items': choices,
        'default_value': default,
        'group_id': idName
    }

@register.inclusion_tag('components/list-select.html')
def list_select(id, choices, splitChar=' '):

    choices = choices.split(splitChar);

    return {
        'id' : id,
        'choices': choices
    }

@register.inclusion_tag('components/menubar-buttons.html')
def menubar(id, groupId, prefix, choiceIds, choiceDisplay, splitChar=' '):

    choices = choices.split(splitChar);

    return {
        'groupId' : groupId,
        'btnClass': "btn-default"
    }


