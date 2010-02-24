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
		$('script[src*="utils.js"]').each(function(i){
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
 * Provides nice download file wrapper around admin actions
 */
function doDownload() {
	alert('doDownload')
}
function DownloadWrapper() {
	var form = $('form[method="post"]');
	if (form.attr('id') == 'downloadForm') {
		return false;
	} else if (form.find('select[name="action"]').val() == '') {
		WriteMessage(gettext('No action was selected'));
		return true;
  } else if (form.find('.action-select:checked').length == 0) {
  	WriteMessage(gettext('Nothing was selected'));
		return true;
  } else if (form.find('select[name="action"]').val().substring(0, 9) != 'download_') {
		return false;
	}
	// save form data
	$('#downloadLink').data('post_data', 
		{
		action: form.find('select[name="action"] :selected').val(),
		selected: form.find('.action-select:checked'),
		index: form.find(':submit').attr('name'),
		});
	$('#downloadLink').click(doDownload);
	var dn = new AjaxDownload((form.attr('action') || document.location.href));
	// TODO: there is a problem with the HoneyPot field
	$(form.serialize().split('&')).each(function(){
			var d = this.split('=');
			dn.AddParameter(d[0], d[1]);
		}) 
  //dn.EnableTrace(true);
  dn.add_onBeginDownload(BeginDownload);
  dn.add_onEndDownload(EndDownload);
  dn.add_onError(DownloadError);
  dn.Download();
	//WriteMessage(gettext('Your download will start immediately. If not, please <a href="#" id="downloadLink">click here.</a>'));
	/*$.download((form.attr('action') || document.location.href), {
  	data: form.serialize(),
  	callback: function(){
  		$.unblockUI()
  		window.location.href = window.location.href;
  	}
  });*/
	return true;
}
function WriteMessage(msg) {
	if($('.messagelist').length==0) $('.breadcrumbs').after('<ul class="messagelist"></ul>');
	$('.messagelist').html('<li>' + msg + '</li>');
}
function BeginDownload() {
    $.blockUI({message: gettext('Your download will start immediately. If not, please <a href="#" id="downloadLink">click here.</a>')});
}
function EndDownload() {
	window.location.href = window.location.href;
}
function DownloadError() {
    var errMsg = AjaxDownload.ErrorMessage;
    var errCk = $.cookie('downloaderror');
    
    if (errCk) {
        errMsg += ", Error from server = " + errCk;
    }
    alert(errMsg);
}

/**
 * Updates an object based on a selection
 * 
 * Example:
 * utils.js?select=select_id,updated_id,update_url
 * 
 * watches select_id to be changed and calls update_url with selet_id.val() as argument,
 * and updates updated_id with the returned value
 */
var UpdateFromSelect = {
    init: function() {
			var select = script_get_values("select");
			for(i in select) {
				var settings = {};
				var vars = select[i].split(",");
				UpdateFromSelect.init_single(vars[0], vars[1], vars[2]);	
			}
    },
		init_single: function(select_id, updated_id, update_url) {
			$('#' + select_id).change( 
        function() {
      			$('#' + updated_id).load(update_url, "arg=" + $('#' + select_id).val());
        });
		},
};

/**
 * Updates a generic relation's object_id select tag based on the selected content_type.
 */
var UpdateGenericRelation = {
		settings : {content_type: 'content_type', object_id: 'object_id'},
    init: function() {
			var ct = script_get_values("ct");
			if (!ct) {
				UpdateGenericRelation.init_single(UpdateGenericRelation.settings);
			}
			for(i in ct) {
				var settings = {};
				var vars = ct[i].split(",");
				$.extend(settings, UpdateGenericRelation.settings);
				if (vars[0] != undefined) {
					$.extend(settings, {content_type: vars[0]});
				};
				if (vars[1] != undefined) {
					$.extend(settings, {object_id: vars[1]});
				}
				UpdateGenericRelation.init_single(settings);	
			}
    },
		init_single: function(settings) {
			$('#id_' + settings.content_type).change( 
        function() {
            UpdateGenericRelation.update_content_object_list(settings);
        });
      $('#id_' + settings.object_id).change(
        function() {
            UpdateGenericRelation.get_absolute_url(settings);
        });
		},
    update_content_object_list: function(settings) {
      var curr = $('#id_' + settings.content_type).val();
      $('#id_' + settings.object_id).load("/admin/utils/update_content_object_list/", "content_type=" + curr);
    },
    get_absolute_url: function(settings) {
      var curr = $('#id_' + settings.content_type).val();
      if(curr=='') {
        return False;
      };

      var obj = $('#id_' + settings.object_id).val();
      $('#id_url').load("/admin/utils/get_absolute_url/", "content_type=" + curr + "&object_id=" + obj, 
        function(response, textStatus, request) {
            this.value = response;
          });
    },
};

/**
 * Updates the values of some fields based on the value of another.
 * 
 * This function is likely to be used to provide defaults for a new item as it 
 * fills in some fields as the "template" variable (usually a Foreign Key) changes.
 * 
 * Usage:
 * class YourAdmin():
 * ...
 * 	class Media:
 * 		js = (
 * 			'/static/js/admin/utils.js?upd=django.contrib.auth.User,user,username,email',
 * 		)
 * 
 * Thus the first part of GET['upd'] should be the model, the second the 
 * observed field, and the rest the fields to be changed.
 */
var UpdateContent = {
	init: function() {
		var update_vars = script_get_values("upd");
		for (i in update_vars) {
				var fk = update_vars[i].split(",");
				UpdateContent.init_single(fk.shift(), fk.shift(), fk)
		};
	},
	init_single: function(model, fk, fields){
		$('#id_' + fk).change(function() {
			UpdateContent.get_values(model, fk, fields);
		});
	},
	get_values: function(model, fk, fields){
		$.getJSON("/admin/utils/get_values/", 
			"pk=" + $('#id_' + fk).val() + "&model=" + model, 
			function(data){
				for(f in fields) {
					var curr = fields[f].split('-');
					if ($('#id_'+ fields[f]).val() && ! confirm("Would you like to overwrite " + curr[curr.length-1] + " with its default value?")) {
						return false
					}
					$('#id_'+ fields[f]).val(eval("data[0].fields." + curr[curr.length-1]));
				};
		});
	},
};

/**
 * Provides UpdateContent functionality for objects related via content type. 
 * Thus one can fill a select's option elements easily.
 * 
 * Usage:
 * class YourAdmin():
 * ...
 * 	class Media:
 * 		js = (
 * 			'/static/js/admin/utils.js?upd_via_ct=model,app_label,ct_model,user,email',
 * 		)
 * 
 * where model is the queried model, app_label and ct_model gives the ContentType query, 
 * user gives the object_id and email is the updated field.
 */
var UpdateViaContentType = {
	init: function() {
		var update_vars = script_get_values("upd_via_ct");
		for (i in update_vars) {
				var fk = update_vars[i].split(",");
				UpdateViaContentType.init_single(fk.shift(), fk.shift(), fk.shift(), fk.shift(), fk)
		};
	},
	init_single: function(model, app_label, ct_model, watched, field){
		$('#id_' + watched).change(function() {
			UpdateViaContentType.get_values(model, app_label, ct_model, watched, field);
		});
	},
	get_values: function(model, app_label, ct_model, watched, field) {
		var path = "/admin/utils/get_values_ct/"
		$('#id_' + field).ajaxError(function(request, settings) {
			UpdateViaContentType.clear(field);
		});
		if ($('#id_' + watched).val()) {
			$('#id_' + field).load(path, {
				model: model,
				app: app_label,
				ctm: ct_model,
				oid: $('#id_' + watched).val(),
			});
		} else {
			UpdateViaContentType.clear(field);
		}
	},
	clear: function(field) {
		$('#id_' + field).html('<option value="" selected="selected">---------</option>');
	},
}

/**
 * Provides UpdateContent functionality for inlined admin elements.
 * 
 * Usage:
 * class YourAdmin():
 * ...
 * 	class Media:
 * 		js = (
 * 			'/static/js/admin/utils.js?upd_inline=django.contrib.auth.User,user-set-0-user,username,email',
 * 		)
 */
var UpdateInlineContent = {
	init: function() {
		var update_vars = script_get_values("upd_inline");
		for (i in update_vars) {
				var fk = update_vars[i].split(",");
				var model = fk.shift();
				var field = fk.shift();
				var i=0;
				while($('#id_' + field.replace("0", i)).length==1) {
					var base = field.replace("0", i)
					var fields = new Array();
					for(f in fk) {
						var parts = base.split('-');
						parts[parts.length-1] = fk[f];
						fields[f] = parts.join('-');
					}
					UpdateContent.init_single(model, base, fields);	
					i++;
				};
		};
	},
}

$(document).ready(UpdateGenericRelation.init);
$(document).ready(UpdateContent.init);
$(document).ready(UpdateViaContentType.init);
$(document).ready(UpdateInlineContent.init);
$(document).ready(function(){
	$('body[class="change-list"] form[method="post"]').submit(function(){
  	if (DownloadWrapper()) event.preventDefault();
  })
})