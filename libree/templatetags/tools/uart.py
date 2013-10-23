"""
Tags for the uart generator
"""

from django import template

register = template.Library()


@register.inclusion_tag('components/input-with-dropdown.html')
def baudrate_selector():
    return {
        'dropdown_items': [9600, 48000, 115200],
        'dropdown_title': 'Common baudrates',
        'group_id': 'baudrate-input',
        'default_value' : 115200
    }
