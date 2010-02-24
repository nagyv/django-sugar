from django.conf.urls.defaults import *
from views import *

urlpatterns = patterns('',
    url(r'^update_content_object_list/$',
        get_objects, name='admin_update_list'),
    url(r'^get_absolute_url/$', get_absolute_url, 
        name='admin_get_url'),
    url(r'^get_values/$', get_values,
        name='admin_get_values'),
    url(r'^get_values_ct/$', get_values_via_contenttype,
        name='admin_get_values_via_contenttype'),
)
