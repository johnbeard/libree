from django.conf import settings

from django import template

register = template.Library()

@register.filter
def value_from_settings(setting):
    return settings.__getattr__(str(setting))
