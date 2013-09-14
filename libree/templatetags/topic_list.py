from django import template
from django.conf import settings

from utils import tool_registry

register = template.Library()

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
    
    if 'desc' in tool_registry.categories[topicId]:
        return tool_registry.categories[topicId]['desc']
    else:
        return ""

def render_topic_item(topicId):
    topicClass = "topic-item"
    topicImgClass = "topic-item-img"

    out = ''
    out += '<div class="col-lg-3 %s">' % topicClass

    out += '<a href="%s">' % topic_url(topicId)
    out += '<div class="%s">' % topicImgClass
    out += '<img src="%s"/>' % topic_icon(topicId)
    out += '</div>'

    out += tool_registry.categories[topicId]['name']
    out += '</a></div>'

    return out


@register.simple_tag
def topic_list():

    out = ''
    i = 0
    for topicId in topicList:

        #start a new row
        if (i % 4) == 0:
            out += '<div class="row">\n'

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
    return tool_registry.categories[topicId]['name']

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

@register.simple_tag
def topic_menu():
    
    
    out = ''
    
    for topic in topicList:
        name = tool_registry.categories[topic]['name']
        
        link = '<a href="/topic/%s">%s</a>' % (topic, name)
        
        out += '<li>\n%s\n</li>\n' % link
    
    return out;
