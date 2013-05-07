from django import template
from django.conf import settings

from utils import tool_registry

register = template.Library()

topics = {
    "mathematics": {'name': "Mathematics"},
    "electronics": {'name': "Electronic engineering and computing", 
        "desc": "Resources related to electrical, electronic and computer engineering, as well as programming and networking."},
    "physics": {'name': "Physics"},
    "chemistry": {'name': "Chemistry"},
    "mechanics": {'name': "Mechanical engineering"},
    "biology": {'name': "Biology"},
    "medicine": { 'name': "Medicine"},
    "economics": {'name': "Economics"},
    }
    
topicList = ["mathematics", "electronics", "physics", "chemistry",
                    "mechanics", "biology", "medicine", "economics"]

#FIXME
def topic_url(topicId):
    return '/topic/%s' % topicId

@register.filter
def topic_icon(topicId):
    return settings.STATIC_URL + 'icons/topic-' + topicId + '-48.svg'

@register.filter
def topic_bg(topicId):
    return settings.STATIC_URL + 'background/blueprint-bg-48.png'
    #return settings.STATIC_URL + 'icons/topic-bg-' + topicId + '-48.svg'

@register.filter
def topic_name(topicId):
    """Returns the display name of a given id"""
    return topics[topicId]['name']

@register.filter
def topic_desc(topicId):
    """Returns the description of a given topic"""
    
    if 'desc' in topics[topicId]:
        return topics[topicId]['desc']
    else:
        return ""

def render_topic_item(topicId):
    topicClass = "topic-item"
    topicImgClass = "topic-item-img"

    out = ''
    out += '<div class="span3 %s">' % topicClass

    out += '<a href="%s">' % topic_url(topicId)
    out += '<div class="%s">' % topicImgClass
    out += '<img src="%s"/>' % topic_icon(topicId)
    out += '</div>'

    out += topics[topicId]['name']
    out += '</a></div>'

    return out


@register.simple_tag
def topic_list():

    out = ''
    i = 0
    for topicId in topicList:

        #start a new row
        if (i % 4) == 0:
            out += '<div class="row-fluid">\n'

        #add the topic
        out += render_topic_item(topicId)

        #end row
        if ((i+1) % 4) == 0 or i == len(topicList):
            out += '</div>'

        i += 1

    return out

@register.filter
def topic_name(topicId):
    """Returns the display name of a given id"""
    return topics[topicId]['name']

@register.simple_tag
def topic_tools_list(topicId):
    out = ''
    tools = tool_registry.registry
    
    theseTools = [tool for tool in tools if topicId in tools[tool]['categories']]
    
    if len(theseTools):
        for tool in theseTools:
            out += '<li>'
            out += '<a href="/tool/%s">%s</a>' % (tool, tools[tool]['title'])
            out += '</li>\n'
    else:
        out += '<div class="alert alert-info">'
        out += 'Sorry, there are no tools under this category yet'
        out += '</div>'

    return out


