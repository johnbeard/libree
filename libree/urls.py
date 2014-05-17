from django.conf.urls import patterns, include, url, static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'libree.views.index', name='index'),
    url(r'^faq$', 'libree.views.faq', name='faq'),
    url(r'^contribute$', 'libree.views.contribute', name='contribute'),
    url(r'^topic/([^/]+)$', 'libree.views.topic_directory', name='topic_directory'),
    url(r'^tool/([^/]+)$', 'libree.views.tool', name='tool'),
    url(r'^test/([^/]+)$', 'libree.views.test', name='test'),
    url(r'^auth$', 'libree.views.authinfo', name='authinfo'),
    url(r'^auth/internal/([^/]+)$', 'libree.views.authinternal', name='authinternal'),
    url(r'^auth/([^/]+)$', 'libree.views.authView', name='auth'),
    # url(r'^libree/', include('libree.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),

    #staticfiles_urlpatterns()
)

def javascript_settings():
    return {
        'github': {
            'clientId':  settings.AUTHINFO["github"]["clientId"],
        },
    }
