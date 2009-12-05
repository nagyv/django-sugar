from django import forms
from django.conf import settings

class GUITextAreaWidget(forms.Textarea):
    pass

    class Media:
        js = ("js/jquery.wymeditor.min.js",
              "js/fancyedit.js")