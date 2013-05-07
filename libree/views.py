from django.template import RequestContext, loader
from django.http import HttpResponse

from templatetags.utils import tool_registry

def top_level_page(request, template):
    """Get a "simple" top-level page with no arguments, like "index" or
    "about"
    """
    t = loader.get_template(template)
    c = RequestContext(request, {})
    return HttpResponse(t.render(c))

def index(request):
    return top_level_page(request, "index.html")

def faq(request):
    return top_level_page(request, "faq.html")

def contribute(request):
    return top_level_page(request, "contribute.html")

def contact(request):
    return top_level_page(request, "contact.html")

def topic_directory(request, topic):

    t = loader.get_template('topic_directory.html')
    c = RequestContext(request, {
        'topicId': topic
    })
    return HttpResponse(t.render(c))

def tool(request, toolId):
    #print tool_registry.ToolRegistry.tools
    template = tool_registry.registry[toolId]['template']
    #template = "resistor_codes.html"
    t = loader.get_template(template)
    c = RequestContext(request, {
        'toolId': toolId
    })
    return HttpResponse(t.render(c))

def test(request, testId):

    template = "test.html"
    t = loader.get_template(template)
    c = RequestContext(request, {
        'testId': testId
    })
    return HttpResponse(t.render(c))
