$.fn.groupDigits = function() {
	$(this).each(function() {
		var text = $(this).text();
		$(this).html(groupDigits(text));
	});
}

function groupDigits(num) {
	var arr = num.split("").reverse();
	var res = "";
	var spacer = '<span class="digit-spacer"/>';
	for (var i = 0; i< arr.length; i++) {
		if (i % 3 == 0 && i != 0)
			res =  spacer + res;
		res = arr[i] + res;
	};
	return res;
}

$.fn.getSpanningCell = function(real_col_index) {
	var next_col = 0;
	var cells = $("td,th", this);
	for (var i = 0; i < cells.size(); i++) {
		var cell = cells.eq(i);
		var colspan = cell.attr('colspan');
		colspan = colspan ? parseInt(colspan) : 1;
		next_col += colspan;
		if (next_col > real_col_index) {
			return cell;
		}
	};
}

function getLastPathnamePart() {
	return $(location).attr('pathname').split('/').reverse()[0];
}

function makeFilterLink(field, value) {
	var href = "?" + getFilterQueryString(field, value) + "&" + getQueryString();
	return $("<a>").text(value).attr("href", href);
}

function getFilterQueryString(field, value) {
	var params = {
		fq : [ field + ":\"" + value + "\"" ]
	};
	return $.param(params);
}

Array.prototype.clean = function() {
	return $.grep(this, function(e) { return e});
}


function getListUrl() {
	return "proxy/search/list/generic?" + getQueryString();
}

function makeUiHref(fq) {
	var params = {
		q : "*",
		fq : fq.clean()
	};
	return "proxy/search/ui?" + $.param(params) + "&" + getQueryString();
}

function makeDateSpanUiHref(field, from, to, gap) {
	var fq = field + ':[' + from + ' TO ' + to + gap + ']';
	return makeUiHref([fq]);
};

function getQueryString() {
	return window.location.search.slice(1);
}

function getFacetFieldName() {
	switch (getLastPathnamePart()) {
	case "datacentres" : return "datacentre_facet";
	case "allocators" : return "allocator_facet";
	case "prefixes" : return "prefix";
	}
}

function getGroupingLabel() {
	switch (getLastPathnamePart()) {
	case "datacentres" : return "Datacentre";
	case "allocators" : return "Allocator";
	case "prefixes" : return "Prefix";
	}
}

function identity(x) {
	return x;
}

function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}
