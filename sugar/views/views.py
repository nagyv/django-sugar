from django.http import HttpResponse, Http404
from django.db import models
from django.core import serializers
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType

@login_required
def get_objects(request):
    """Returns all the instances of a model object"""
    if not request.method=='GET':
        return Http404
    ct = ContentType.objects.get(pk=int(request.GET['content_type']))
    object_list = ct.model_class().objects.all()
    return render_to_response("sugar/views/select_list.html", 
        {'object_list': object_list}
        )

@login_required
def get_absolute_url(request):
    '''
    Returns the default url for a content_object
    '''
    if not request.method=='GET':
        return Http404
    ct = ContentType.objects.get(pk=int(request.GET['content_type']))
    object = ct.get_object_for_this_type(pk=int(request.GET['object_id']))
    return HttpResponse(object.get_absolute_url())

@login_required
def get_values(request):
    '''
    Returns an object's data as JSON
    '''
    if not request.method == 'GET':
        raise Http404
    app_label, model_name = request.GET.get('model').split('.')
    model = models.get_model(app_label, model_name)
    try:
        object = get_object_or_404(model, pk=int(request.GET.get('pk')))
    except ValueError:
        raise Http404
    json_serializer = serializers.get_serializer("json")()
    rsp = HttpResponse()
    json_serializer.serialize([object,], ensure_ascii=False, stream=rsp)
    return rsp

@login_required
def get_values_via_contenttype(request):
    '''
    Returns a select elements for a content type from a given model
    '''
    if not request.method == 'POST':
        return Http404
    app_label, model_name = request.POST.get('model').split('.')
    model = models.get_model(app_label, model_name)
    ct = get_object_or_404(ContentType, app_label=request.POST.get('app'), model=request.POST.get('ctm'))
    try:
        object_list = get_list_or_404(model, content_type=ct, object_id=int(request.POST.get('oid')))
    except ValueError:
        raise Http404
    return render_to_response("admin/utils/select_list.html", 
        {'object_list': object_list, 'empty_option': True}
        )