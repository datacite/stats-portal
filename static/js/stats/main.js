function init() {
	jQuery.ajaxSettings.traditional = true;

	addCustomTablesorterParser();
	loadFilterList();

	newStatsTab("allocators", "Registrations by Allocators", initMainStats("allocator_facet"), "datacentres", "Allocator");
	newStatsTab("datacentres", "Registrations by Datacentres", initMainStats("datacentre_facet"), "prefixes", "Datacentre");
	newStatsTab("prefixes", "Registrations by Prefixes", initMainStats("prefix"), "resolution-report", "Prefixes", {headers: { 0: { sorter:'prefixes' }}});
//	newStatsTab("link-checker", "Link Checker", initLinkChecker);
	newStatsTab("resolution-report", "Resolutions by Month", initResolutionReportList);

//	newStatsTab("history-year", "Annual History", initHistoryStats("+1YEAR", "per year", "%y"));
//	newStatsTab("history-month", "Monthly History", initHistoryStats("+1MONTH", "per month", "%b %y"));

	initTabs();
}

function addCustomTablesorterParser() {
    $.tablesorter.addParser({
        id: 'prefixes',
        is: function(s) { //never checked, because 'digit' parser matches first
            return /^10\.\d+$/.test(s);
        },
        format: function(s) {
            return s.replace(/^10\./, "");
        },
        type: 'number'
    });
}

function loadFilterList() {
	$("#filters").load_sync("proxy/search/list/filters-html" + window.location.search, function() {
		$(this).toggle($(".filter", this).size() > 0);
		setNextLinkForFilterList();
	});
}

function setNextLinkForFilterList() {
	$("#filters .filter").each(function() {
		var filter = $(this);
		var name = $.trim($(".name", filter).text());
		if (name == "allocator")
			filter.setLinksToNextTab("allocator");
		else if (name == "datacentre")
			filter.setLinksToNextTab("datacentres");
		else if (name == "prefix")
			filter.setLinksToNextTab("prefixes")
	});
}

function initTabs() {
	$("#stats").tabs({
		show: function(event, ui) {
			$(ui.tab).trigger('click');
		}
	});
}

function newStatsTab(id, label, init_function, next_tab, table_label, tablesorter_options) {
	id = "tab-" + id;
	var li = $("<li>");
	var a = $("<a>").text(label).attr("href", "#" + id);
	li.append(a);
	$("#stats ul").append(li);

	var stats = newStats(id, label, init_function, next_tab, table_label, tablesorter_options);
	a.click(function() {
		setTimeout(stats.load, 0);
	});
	$("#stats").append(stats.div);
	return stats;
}

function newStats(id, label, init_function, next_tab, table_label, tablesorter_options) {
	var div = $("<div>").addClass("stats").attr("id", id);
	var table = $("<table>").hide();
	var divLoading = $("<div>").addClass("loading");
	divLoading.append(throbber(), " Loading Data");
	div.append(divLoading, table);
	table.initTable(table_label || label);
	var obj = {
		div: div,
		table: table,
		loading: false,
		loaded: false,
		finish: function() {
			if ($("tbody ", table).children().size() == 0) {
				table.hide();
				var noresults = $("<div>").addClass("noresults");
				noresults.text("No matching results found");
				div.append(noresults);
			} else {
				table.makeTableSortable(tablesorter_options);
				table.stickyTableHeaders();
				$("td.number a, td.number span, tr.totals .number", table).groupDigits();
				table.setLinksToNextTab(next_tab);
				div.setTargetForExternalLinks();
			}
		}
	};
	obj.load = function () {
		if (obj.loading)
			return;
		div.show();
		if (!obj.loaded) {
			obj.loading = true;

			init_function(obj);
			table.show();

			obj.finish();
			obj.loaded = true;
			obj.loading = false;
			divLoading.hide();
		}
	};
	return obj;
}

function initMainStats(group_field) {
	return function(stats) {
        stats.table.addColGroup("DOI Registrations", 6);
        stats.table.addCol("Total",         group_field, [], false, "bold");
        stats.table.addCol("This Year",     group_field, ["minted:[NOW/YEAR TO *]"], false);
        stats.table.addCol("Last 30 Days",  group_field, ["minted:[NOW-30DAYS/DAY TO *]"], false);
        stats.table.addCol("Last 7 Days",   group_field, ["minted:[NOW-7DAYS/DAY TO *]"], false);
        stats.table.addMinMaxCols(["First", "Latest"], group_field, "minted");

        stats.table.addColGroup("Metadata", 4);
        stats.table.addCol("Searchable", group_field, ["has_metadata:true", "is_active:true"], true);
        stats.table.addCol("Hidden",     group_field, ["has_metadata:True", "is_active:false"], false);
        stats.table.addCol("Missing",    group_field, ["has_metadata:false"], false);

        stats.table.addRatioCol("Ratio", 9, 1, true);


        stats.table.removeRowsWithZeros([1]);
	}
};

function initHistoryStats(gap, header, label) {
	return function(hist) {
		hist.table.addColGroup("minted", 2);
		hist.table.addDateCol(header, "minted", label, gap, "aggregated");
		hist.table.addColGroup("created", 2);
		hist.table.addDateCol(header, "created", label, gap, "aggregated");
		hist.table.addColGroup("updated", 2)
		hist.table.addDateCol(header, "updated", label, gap, "aggregated");
		hist.table.addColGroup("uploaded", 2)
		hist.table.addDateCol(header, "uploaded", label, gap, "aggregated");
		hist.table.addRatioCol("MDS Ratio", 4, 2);
		hist.table.addRatioCol("Metadata Ratio", 8, 2);
		hist.table.removeLeadingRowsWithZeros([1,3,5,7]);
	}
};

function initLinkChecker(tab) {
	tab.table.load_sync("link-checker/report.html thead,tbody");
	applyFilterLinkChecker(tab);
}

function initResolutionReportList(tab) {
	var list = $("<div>");
	list.load_sync("resolution-report/index.html a");

	var reports = {};
	var select = $("<select>");
	tab.div.append(select);

	$("a", list).reverse().each(function() {
		var a = $(this);
		var file = basename(a.attr("href"));
		var label = a.text();

		var option = $("<option>");
		option.text(label);
		option.attr("value", file);
		select.append(option);

		var report = newStats("resolution-report-" + file, label, initResolutionReport(file));
		reports[file] = report;
		report.div.hide();
		tab.div.append(report.div);
	});

	select.change(function() {
		var file = $(this).val();
		$.each(reports, function(key, val) {
			val.div.hide();
		});
		reports[file].load();
	});

	reports[select.val()].load();
}

function initResolutionReport(file) {
	return function(rr) {
		rr.table.load_sync("resolution-report/" + file + " thead,tbody");
		applyFilterResolutionReport(rr);
		rr.table.initFooter();
		rr.table.addColTotals("");
		for ( var i = 2; i < 8; i++)
			rr.table.addColTotals(undefined, i);
	};
}

function applyFilterLinkChecker(linkchecker) {
	linkchecker.table.applyFilters({
		allocator: function(row, symbol) {
			var td = $("td", row).eq(5);
			return td.text().indexOf(symbol + ".") != 0;
		},
		datacentre: function(row, symbol) {
			var td = $("td", row).eq(5);
			return td.text() != symbol;
		},
		prefix: function(row, prefix) {
			var td = $("td", row).eq(3);
			return $.trim(td.text()).indexOf(prefix + "/") != 0;
		}
	});
}

function applyFilterResolutionReport(resolutionreport) {
	resolutionreport.table.applyFilters({
		allocator: function(row, symbol) {
			var td = $("td", row).eq(1);
			return td.text().indexOf(symbol + ".") == -1;
		},
		datacentre: function(row, symbol) {
			var td = $("td", row).eq(1);
			var list = $("p", td).filter(function() { return $(this).text() == symbol });
			return list.size() == 0;
		},
		prefix: function(row, prefix) {
			var td = $("td", row).eq(1);
			return $("a", td).text() != prefix;
		}
	});
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

$.fn.applyFilters = function (filters) {
	var table = $(this);
	$("#filters .filter").each(function() {
		var name = $.trim($(".name", this).text());
		var val = $.trim($(".value", this).text());

		if (name == "allocator" && filters.allocator) {
			var symbol = val.split(" ")[0];
			table.filterRows(function() { return filters.allocator(this, symbol) });
		} else if (name == "datacentre" && filters.datacentre) {
			var symbol = val.split(" ")[0];
			table.filterRows(function() { return filters.datacentre(this, symbol) });
		} else if (name == "prefix") {
			var prefix = val;
			table.filterRows(function() { return filters.prefix(this, prefix) });
		}
	});
}

$.fn.setTargetForExternalLinks = function() {
	$("a", this).filter(function() {
		return $(this).attr("href").indexOf("?") != 0;
	}).attr("target", "_blank");
}

function throbber() {
 	return $('<img src="img/throbber-transparent.gif" class="loading" alt="spinning wheel"/>');
}

$(document).ready(init);
