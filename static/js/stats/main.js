function init() {
	jQuery.ajaxSettings.traditional = true;

	$("#filters").load("proxy/search/list/filters-html" + window.location.search, function() {
		$(this).toggle($(".filter", this).size() > 0);
		$(".filter", this).each(function() {
			var filter = $(this);
			var name = $(".name", filter).text().trim();
			console.log(name);
			if (name == "allocator")
				filter.setLinksToNextTab("allocator");
			else if (name == "datacentre")
				filter.setLinksToNextTab("datacentres");
			else if (name == "prefix")
				filter.setLinksToNextTab("prefixes")
		});
	});

	newStatsTab("allocators", "Allocators", initMainStats("allocator_facet"), "datacentres");
	newStatsTab("datacentres", "Datacentres", initMainStats("datacentre_facet"), "prefixes");
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


function newStatsTab(id, label, init_function, next_tab) {
	id = "tab-" + id;
	var div = $("<div>").addClass("stats").attr("id", id);
	var table = $("<table>");
	div.append(table);
	$("#stats").append(div);

	var li = $("<li>");
	var a = $("<a>").text(label).attr("href", "#" + id);
	li.append(a);
	$("#stats ul").append(li);
	
	table.initTable(label);
	var obj = {
		div: div,
		table: table,
		loaded: false,
		finish: function() {
			table.makeTableSortable();
			table.stickyTableHeaders();
			$("td.number a, tr.totals .number", table).groupDigits();
			table.setLinksToNextTab(next_tab);
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

$.fn.setLinksToNextTab = function(next_tab) {
	if (next_tab) {
		$("a", this).each(function() {
			var a = $(this);
			var href = a.attr("href");
			if (href.indexOf("?") == 0) {
				href += "#tab-" + next_tab;
				a.attr("href", href);
			}
		});
	}
}



function linkchecker_applyfilter(linkchecker) {
	$("#filters .filter").each(function() {
		var name = $(".name", this).text().trim();
		var val = $(".value", this).text().trim();
		
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
