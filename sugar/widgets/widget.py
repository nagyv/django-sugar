from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe
from django.forms.util import flatatt
from django.utils.translation import ugettext_lazy as _

class GUITextAreaWidget(forms.Textarea):
    pass

    class Media:
        js = ("js/jquery.wymeditor.min.js",
              "js/fancyedit.js")
        
class Button(forms.widgets.Widget):
    button_type = 'button'
    
    def render(self, name, value, attrs=None):
        final_attrs = self.build_attrs(attrs, type=self.button_type, name=name)
        return mark_safe(u'<button%s>%s</button>' % (flatatt(final_attrs), value))
    
class SubmitButton(Button):
    
    button_type = 'submit'
    

class NoInput(forms.Widget):
    def render(self, name, value, attrs=None):
        hidden_widget = forms.HiddenInput()
        final_attrs = self.build_attrs(attrs, name=name)
        return mark_safe('<p%s>%s</p>%s' % (flatatt(final_attrs), value, 
                                    hidden_widget.render(name, value, attrs)))
    
    def _has_changed(self, initial, value):
        return False
    
class StaticField(forms.Field):
    
    widget = NoInput
    
    def __unicode__(self):
        return self.value.__unicode__()
    
    def __init__(self, value, required=True, widget=None, label=None, initial=None,
                 help_text=None, error_messages=None, show_hidden_initial=False):
        self.value = value
        super(StaticField, self).__init__(required, widget, label, initial,
                 help_text, error_messages, show_hidden_initial)
    
    def clean(self, value):
        return self.value
