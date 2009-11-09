/**
 * Returns the get values received by this script
 * 
 * The values can containt alphanumeric characters, dots and commas. 
 * A semicolon is used to separate several values, they will be returned as
 * distinct values for this call (aka elements of an array).
 * 
 * example:
 * <script src="myscript.js?getvar=hello;bello"></script>
 * return an array of Array('hello', 'bello')
 */
function script_get_values(varname){
	var gets = new Array();
	try {
		$('script[src*="custom-forms.js"]').each(function(i){
			gets[i] = $(this).attr("src").match(new RegExp("\\?.*" + varname + "=([\\w\\-,;.]*)"))[1];
		});
	} catch (e) {
		return false;
	}
	// flatten the array
	gets = gets.join(";");
	return gets.split(";");
}

/**
 * Adds an "Add another" link after the specified fieldsets
 * 
 * Based on http://www.djangosnippets.org/snippets/1594/ by MasonM
 */
var AddRemoveFields = {
	html_template : '<ul class="ctrlHolder">'+
       '<li><a class="add" href="#" onclick="return AddRemoveFields.add_inline_form(\'{{prefix}}\')">' + gettext('Add another') + '</a></li>'+
    '</ul>',
	init: function() {
		var base_ids = script_get_values('fieldsets');
		for(i in base_ids) {
			AddRemoveFields.init_single(base_ids[i]);
		}
	},
	init_single: function(base_id) {
		$('#id_' + base_id + "-TOTAL_FORMS").parents('fieldset').append(
			AddRemoveFields.html_template.replace("{{prefix}}", base_id)
			);
	},
	increment_form_ids: function(el, to, name) {
    var from = to-1
    $('[id*="' + name + '"]', el).each(function(i){
        var old_name = $(this).attr('name')
				if (old_name != undefined) {$(this).attr('name', old_name.replace(from, to))}
				var old_id = $(this).attr('id')
				if (old_id != undefined) {$(this).attr('id', old_id.replace(from, to))}
				try {
        	$(this).val('')
					}
				catch(e){
					
				}
    })
		return el;
	},
	add_inline_form: function(name) {
    var parent = $('#id_'+name+'-0-id').parents('fieldset')[0]
    var last = $(parent).children()[$(parent).children().length-2]
    var count = $('input#id_'+name+'-TOTAL_FORMS').val()
		var copy = AddRemoveFields.increment_form_ids($(last).clone(true), count, name)
    $(last).after(copy)
    $('input#id_'+name+'-TOTAL_FORMS').val(count+1)
    return false;
	},
};

/**
 * Disables all the elements in a fieldset except the first checkbox, then 
 * adds a toggle functionality to that checkbox.
 * 
 * The fieldset is identified by the checkbox's ID. The script is written to work
 * with uniForm forms.
 * 
 * @author nagyv
 */
function CreateSwitchingCheckbox() {
	var billing = $("#id_bill-add_billing");
	if (billing) {
		billing.parent().parent().find('input').attr("disabled", "disabled");
		billing.parent().parent().find('textarea').attr("disabled", "disabled");
		billing.parent().parent().find('select').attr("disabled", "disabled");
		$("#id_bill-add_billing").attr("disabled", false);
	};
	$("#id_bill-add_billing").click(function(){
		if ( $("#id_bill-add_billing").attr('checked') ) {
			billing.parent().parent().find('input').attr("disabled", false);
			billing.parent().parent().find('textarea').attr("disabled", false);
			billing.parent().parent().find('select').attr("disabled", false);	
		}
		else {
			billing.parent().parent().find('input').attr("disabled", "disabled");
			billing.parent().parent().find('textarea').attr("disabled", "disabled");
			billing.parent().parent().find('select').attr("disabled", "disabled");
			$("#id_bill-add_billing").attr("disabled", false);
		};
	});
};

$(document).ready(function(){
	AddRemoveFields.init();
	if ($("#id_project-deadline").length == 1) {
		$("#id_project-deadline").datepicker({
			dateFormat: 'yy-mm-dd'
		});
	};
	CreateSwitchingCheckbox();
});