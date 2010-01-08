from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe
from django.forms.util import flatatt

class GUITextAreaWidget(forms.Textarea):
    pass

    class Media:
        js = ("js/jquery.wymeditor.min.js",
              "js/fancyedit.js")
        
class ButtonWidget(forms.widgets.Widget):
    
    button_type = None
    
    def render(self, name, value, attrs=None):
        final_attrs = self.build_attrs(attrs, type=self.button_type, name=name)
        return mark_safe(u'<button%s>%s</button>' % (flatatt(final_attrs), value))
    
class SubmitButtonWidget(ButtonWidget):
    
    button_type = 'submit'