$.fn.initTable = function(label) {
	var table = $(this);
	table.append(
		'<thead> \
			<tr class="group"><td/></tr> \
			<tr class="individual"><th>' + label + '</th></tr> \
		</thead> \
		<tbody />'
	);
	table.initFooter();
	$("tr.group", table).hide(); //show only if some group headers are added
}

$.fn.initFooter = function() {
	$(this).append($('<tfoot><tr class="totals"><td>Totals</td></tr></tfoot>'));
}

$.fn.getGroupForCol = function(col) {
	return $("thead tr.group", this).getSpanningCell(col);
}

$.fn.addColGroup = function(header, colspan, colskip) {
	var tr = $("thead tr.group", this);
	var td = $("<td>").attr("colspan", colspan).addClass("group").text(header);
	tr.append(td);
	tr.show();
}

function filterLinkFormatter(field) {
	return function(value) {
		return makeFilterLink(field, value);
	}
}

$.fn.countCols = function() {
	return $("thead tr.individual th", this).size();
}

$.fn.addCol = function(header, field, fqs, linkable, css_class) {
	var labelFormatter = function(value) {
		return value.split(" ")[0];
	}
	var uiHrefConstructor = null;
    if (linkable == null || linkable) 
        uiHrefConstructor = function(data) {
            var new_fq = field + ':"' + data + '"';
            return makeUiHref(fqs.concat([new_fq]));
        };
	var data = {
		fq: fqs,
		"facet.field" : field
	}
	this.addGenericCol(header, data, filterLinkFormatter(field), labelFormatter, uiHrefConstructor, css_class);
}

$.fn.addFacetCol = function(header, field) {
	var uiHrefConstructor = function(data) {
		var fq = field + ':"' + data + '"';
		return makeUiHref([fq]);
	};
	var data = {
		"facet.field" : field
	}
	this.addGenericCol(header, data, filterLinkFormatter(field), identity, uiHrefConstructor);
}

$.fn.addDateCol = function(header, field, format, gap, aggregation) {
	var dateFormatter = function(value) {
		var date = new Date(value);
		return $.plot.formatDate(date, format);
	}
	var uiHrefConstructor = function(data) {
		return makeDateSpanUiHref(field, data, data, gap);
	};
	var uiHrefAggregationConstructor = function(data) {
		return makeDateSpanUiHref(field, '*', data, gap);
	}
	var data = {
		"facet.range" : field,
		"facet.range.gap" : gap
	}
	this.addGenericCol(header, data, dateFormatter, dateFormatter, uiHrefConstructor);
	if (aggregation)
		this.addAggregationCol(aggregation, this.countCols() - 1, uiHrefAggregationConstructor);
}

$.fn.addMinMaxCols = function(header, field, stats_field) {
	var table = this;
	var rows = $("tbody tr", table);
    var data = {
        "facet.field" : field,
        "stats" : "on",
        "stats.field" : stats_field,
        "stats.facet" : field
    }

	table.addColHeader(header[0]);
	table.addColHeader(header[1]);
    table.addColTotals("");
    table.addColTotals("");

    var dateFormatter = function(str) {
        var mom = moment(str, "ddd MMM DD HH:mm:ss - YYYY");
        return mom == null ? "" : mom.format("YYYY-MM-DD");
    };
	
	$.ajax({
		type : "GET",
		url : getListUrl(),
		dataType : "text",
		cache : false,
		data : data,
		async : false,
		success : function(data) {
			var lines = data.split("\n");
			for (i = 0; i < lines.length - 1; i++) {
				var cols = lines[i].split(";");
                var min = $.trim(cols[2]);
                var max = $.trim(cols[3]);
				
				var td_min = $("<td>").addClass("date").text(dateFormatter(min));
				var td_max = $("<td>").addClass("date").text(dateFormatter(max));
				rows.eq(i).append(td_min, td_max);
			}
		}
	});


}

$.fn.addGenericCol= function(header, data, firstColFormatter, labelFormatter, uiHrefConstructor, css_class) {
	var table = this;
	var rows = $("tbody tr", table);
	var hasRows = rows.size() != 0;
	
	table.addColHeader(header, "pie");
	
	$.ajax({
		type : "GET",
		url : getListUrl(),
		dataType : "text",
		cache : false,
		data : data,
		async : false,
		success : function(data) {
			var lines = data.split("\n");
			for (i = 0; i < lines.length - 1; i++) {
				var cols = lines[i].split(";");
				var value = cols[0];
				var count = $.trim(cols[1]);
				
				var td = $("<td>").addClass("number");
                if (css_class != null) td.addClass(css_class);
				if (count == 0) {
					td.text("0");
                } else if (uiHrefConstructor == null) {
                    td.append($("<span>").text(count));
				} else {
					var a = $("<a>").text(count);
					a.attr("href", uiHrefConstructor(value));
					td.append(a);
				}
				
				if (hasRows) {
					rows.eq(i).append(td);
				} else {
					var tr = $("<tr>");
					var label_td = $("<td>").html(firstColFormatter(value));
					label_td.data("label", labelFormatter(value))
					tr.append(label_td, td);
					$("tbody", table).append(tr);
				}
				
			}
			table.addColTotals();
		}
	});
}

$.fn.addRatioCol = function(header, col_dividend, col_divisor, inverse) {
    if (inverse == null) inverse = false;
	var table = $(this);
	table.addColHeader(header, "bars");
	$("tbody tr", table).each(function() {
		var row = $(this);
		var dividend = $("td", row).eq(col_dividend).text();
		var divisor = $("td", row).eq(col_divisor).text();
		var ratio = 100 * dividend / divisor;
        if (inverse) ratio = 100 - ratio;
		var td = $("<td>").addClass("number").text(Math.floor(ratio) + "%");
		row.append(td);
	});
	table.addColTotals("");
}

$.fn.addRatioToTotalCol = function(header, col) {
	var table = $(this);
	table.addColHeader(header, "bars");
	var total = $("tfoot tr.totals td", table).eq(col).text();
	$("tbody tr", table).each(function() {
		var row = $(this);
		var number = $("td", row).eq(col).text();
		var ratio = Math.floor(100 * number / total);
		var td = $("<td>").addClass("number").text(ratio + "%");
		row.append(td);
	});
	table.addColTotals("100%");
}

$.fn.addAggregationCol = function(header, col, uiHrefConstructor) {
	var table = $(this);
	table.addColHeader(header, "time");
	var sum = 0;
	$("tbody tr", table).each(function() {
		var row = $(this);
		var number = $("td", row).eq(col).text();
		sum += parseInt(number);
		var td = $("<td>").addClass("number");
		if (sum > 0 && uiHrefConstructor) {
			var data = $("td",row).eq(0).text();
			var a = $("<a>").text(sum);
			a.attr("href", uiHrefConstructor(data));
			td.append(a);
		} else {
			td.text(sum);
		}
		
		row.append(td);
	});
	table.addColTotals("100%");
}

$.fn.addColHeader = function(header, chart_type) {
	var table = this;
	var th = $("<th>").text(header);
	if (chart_type != undefined) {
		th.addClass("chart");
		th.data("chart-type", chart_type);
	}
	$("thead tr.individual", table).append(th);
	table.addEmptyGroupHeaderCellIfNeeded();
}

$.fn.addEmptyGroupHeaderCellIfNeeded = function() {
	var table = this;
	var col = $("thead tr.individual th", table).size() - 1;
	var has_group = table.getGroupForCol(col) != null;
	if (!has_group) {
		var td = $("<td>");
		$("thead tr.group", table).append(td);
	}
}

$.fn.addColTotals = function(sum, col) {
	//undefined col means takes last col
	var table = $(this);
	var td = $("<td>");
	if (sum == undefined) {
		sum = 0;
		$("tbody tr", table).each(function() {
			var el;
			if (col == undefined)
				el = $("td", this).last()
			else 
				el = $("td", this).eq(col);
			var number = parseInt(el.text());
			sum += number;
		});
		if (!isNaN(sum))
			td.addClass("number").text(sum);
	}
	$("tr.totals", table).append(td);
}

$.fn.makeTableSortable = function(options) {
	var default_options = {
		sortInitialOrder : 'desc',
		sortList : [[0,0]]
	};
	
	var cur_options = $.extend({},default_options,options);
	
	$(this).addClass("tablesorter").tablesorter(cur_options);
	
}

$.fn.removeRowsWithZeros = function(cols) {
	this.filterRows(function() {
		return $(this).isZeroRow(cols); 
	});
}

$.fn.removeLeadingRowsWithZeros = function(cols) {
	var isLeadingRow = true;
	this.filterRows(function() {
		isLeadingRow &= $(this).isZeroRow(cols);
		return isLeadingRow;
	});
}

$.fn.filterRows = function(filter_func) {
	$("tbody tr", this).filter(filter_func).remove();
}

$.fn.isZeroRow = function(cols) {
	var rows = $("td", this);
	cols = cols || [1];
	var isZeroRow = true;
	$.each(cols, function(idx, col) {
		var count = rows.eq(col).text();
		isZeroRow &= $.trim(count) == "0";
	})
	return isZeroRow;
}
