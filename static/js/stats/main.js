function init() {
	jQuery.ajaxSettings.traditional = true;

	$("#filters").load("proxy/search/list/filters-html" + window.location.search, function() {
		$(this).toggle($(".filter", this).size() > 0);
	});

	newStatsTab("allocators", "Allocators", initMainStats("allocator_facet"));
	newStatsTab("datacentres", "Datacentres", initMainStats("datacentre_facet"));
	newStatsTab("prefixes", "Prefixes", initMainStats("prefix"));

	var linkchecker = newStatsTab("linkchecker", "Link Checker", function(linkchecker) {
		linkchecker.table.load_sync("linkchecker/report.html thead,tbody");
		linkchecker_applyfilter(linkchecker);
	});
	
	$("#stats").tabs({
		show: function(event, ui) {
			$(ui.tab).trigger('click');
		}
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


function newStatsTab(id, label, init_function) {
	id = "tab-" + id;
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

function linkchecker_applyfilter(linkchecker) {
	$("#filters .filter").each(function(el) {
		var name = $(".name", el).text().trim();
		var val = $(".value", el).text().trim();

		if (name == "allocator") {
			var symbol = val.split(" ")[0];
			linkchecker.table.filterRows(function() {
				var td = $("td", this).eq(5);
				return td.text().indexOf(symbol + ".") != 0;
			});
		} else if (name == "datacentre") {
			var symbol = val.split(" ")[0];
			linkchecker.table.filterRows(function() {
				var td = $("td", this).eq(5);
				return td.text() != symbol;
			});
		} else if (name == "prefix") {
			var prefix = val;
			console.log(prefix);
			linkchecker.table.filterRows(function() {
				var td = $("td", this).eq(3);
				return td.text().trim().indexOf(prefix + "/") != 0;
			});
		}
	});
}


$(document).ready(init);
