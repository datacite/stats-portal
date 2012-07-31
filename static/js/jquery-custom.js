// Wrapper to use jquery's load function synchronously 
$.fn.load_sync = function(url, params, callback) { 
	$.ajaxSetup({async : false});
	this.load(url, params, callback);
    $.ajaxSetup({async : true});
    return this;
};

$.fn.reverse = [].reverse;
