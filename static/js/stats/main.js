function init() {
	jQuery.ajaxSettings.traditional = true;

	newStats("Allocators", initMainStats("allocator_facet"));
	newStats("Datacentres", initMainStats("datacentre_facet"));
	newStats("Prefixes", initMainStats("prefix"));
	
	var month = newStats("Month", function(month) {
		month.table.addColGroup("DOI Registrations", 2)
		month.table.addDateCol("per Month", "created", "%b %y", "+1MONTH");
		month.table.addAggregationCol("aggregated", 1);
		month.table.addColGroup("Metadata Uploads", 2)
		month.table.addDateCol("per Month", "uploaded", "%b %y", "+1MONTH");
		month.table.addAggregationCol("aggregated", 3);
		month.table.removeLeadingRowsWithZeros();
	});

	var day = newStats("Day", function(day) {
		day.table.addColGroup("DOI Registrations", 2)
		day.table.addDateCol("per Month", "created", "%d %b %y", "+1DAY");
		day.table.addAggregationCol("aggregated", 1);
		day.table.addColGroup("Metadata Uploads", 2)
		day.table.addDateCol("per Month", "uploaded", "%d %b %y", "+1DAY");
		day.table.addAggregationCol("aggregated", 3);
		day.table.removeLeadingRowsWithZeros();
		day.table.hide();
	});

	var res = newStats("ResourceType", function(res) {
		res.table.addFacetCol("Count", "resourceType_facet");
		res.table.addRatioToTotalCol("Ratio", 1);
	});
	
	$("#stats").tabs({
		show: function(event, ui) {
			$(ui.tab).trigger('click');
		}
	});

	$("#filters").load("proxy/search/list/filters-html" + window.location.search, function() {
		$(this).toggle($(".filter", this).size() > 0);
	});
}

function initMainStats(group_field) { 
	return function(stats) {
		stats.table.addColGroup("DOI Registrations", 4);
		stats.table.addCol("All Time", group_field);
		stats.table.addCol("This Year", group_field, "created:[NOW/YEAR TO *]");
		stats.table.addCol("Last 30 Days", group_field, "created:[NOW-30DAYS/DAY TO *]");
		stats.table.addCol("Last 7 Days", group_field, "created:[NOW-7DAYS/DAY TO *]");
		stats.table.addColGroup("Metadata Uploads", 4);
		stats.table.addCol("All Time", group_field, "has_metadata:true");
		stats.table.addCol("This Year", group_field, "uploaded:[NOW/YEAR TO *]");
		stats.table.addCol("Last 30 Days", group_field, "uploaded:[NOW-30DAYS/DAY TO *]");
		stats.table.addCol("Last 7 Days", group_field, "uploaded:[NOW-7DAYS/DAY TO *]");
		stats.table.addRatioCol("Metadata Ratio", 5, 1);
		stats.table.removeRowsWithZeros();
	}
};

var stats_id = 0;

function newStats(label, init_function) {
	var id = "stats-" + stats_id;
	stats_id++;
	var div = $("<div>").addClass("stats").attr("id", id);
	var table = $("<table>");
	var charts = $("<div>").addClass("charts");
	var br = $("<br>")
	div.append(table,charts,br);
	$("#stats").append(div);

	var li = $("<li>");
	var a = $("<a>").text(label).attr("href", "#" + id);
	li.append(a);
	$("#stats ul").append(li);
	
	table.initTable(label);
	var obj = {
		div: div,
		table: table,
		charts: charts,
		loaded: false,
		finish: function() {
			table.makeTableSortable();
			charts.addChartsForTable(table);
			table.stickyTableHeaders();
			$("td.number a, tr.totals .number", table).groupDigits();
		}
	};
	obj.load = function () { 
		if (!obj.loaded) {
			div.hide();
			init_function(obj);
			obj.finish();
			div.show();
			obj.loaded = true;
		}
	};
	a.click(obj.load);
	return obj;
}

$(document).ready(init);
