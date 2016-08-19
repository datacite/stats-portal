$.fn.addChartsForTable = function(table) {
	var charts = $(this);
	var old_group;
	$("thead tr.individual th", table).each(function(index) {
		if ($(this).hasClass("chart")) {
			var group = $(table).getGroupForCol(index);
			if (old_group == undefined || group.text() != old_group.text()) {
				var group_header = $("<h2>").text(group.text());
				charts.append(group_header);
				old_group = group;
			};
			var chart_type = $(this).data("chart-type");
			var width = ($(document).width() / group.attr("colspan")) - 60;
			var height = Math.min(width, 400);
			if (chart_type == "pie") {
				width = height;
			}
				
			var div = $("<div>").css({
				float: "left",
				"text-align": "center"
			});
			var header = $("<h3>").text($(this).text());
			var chart = $("<div>").css({
				height: height,
				width: width
			});
			div.append(header, chart);
			charts.append(div);
			
			var data;
			if (chart_type == "time")
				data = table.getTimeSeriesChartData(index);
			else
				data = table.getChartData(index);
			chart.addChart(data, chart_type);
		}
	});
}

$.fn.addChart = function(data, chart_type) {
	var chart = $(this);
	var options = {};
	switch (chart_type) {
	case "bars": 
		options = {
			series: {
				bars: {
					show: true
				}
			},
			xaxis: {
				ticks: $.map(data, function(val, idx) {
					return [[ idx, val.label ]];
				})
			},
			yaxis: {
				min: 0,
				max: 100
			}
		}
		$(data).each(function() {
			this.color = "red";
		})
		break;
	case "pie":
		options = {
			series: {
				pie: {
					show: true,
					combine: {
						threshold: 0.02
					}
				}
			}
		};
		break;
	case "time": 
		options = {
			series: {
				lines: {
					show: true
				}
			},
			xaxis: {
				mode: "time",
				timeformat: "%d. %b"
		    }
		}
	}
	options.legend = { 
		show: false
	};
	options.grid = {
		hoverable: true
	};
	$.plot(chart, data, options);
	if (chart_type == "bars")
		$(".xAxis .tickLabel", chart).addClass("rotate");
}

$.fn.getTimeSeriesChartData = function(col) {
	var table = $(this)
	var data = new Array();
	
	$("tbody tr", table).each(function(index) {
		var cols = $("td", this);
		var time = cols.eq(0).data("raw");
		var unixtime = (new Date(time)).getTime(); 
		var count = parseInt(cols.eq(col).text());
		data.push([unixtime, count]);
	});
	
	return [{
		label: "foo",
		data: data
	}];
}

$.fn.getChartData = function(col) {
	var table = $(this)
	var data = new Array();
	
	$("tbody tr", table).each(function(index) {
		var cols = $("td", this);
		var label = cols.eq(0).data("label");
		var count = parseInt(cols.eq(col).text());
		data.push({
				label: label,
				data : [[index, count]]
		});
	});
	
	data = sortChartData(data);
	
	return data;
}

function sortChartData(data) {
	//sort
	data.sort(function(a, b) {
		var diff_count = b.data[0][1] - a.data[0][1];
		var diff_label = a.label.localeCompare(b.label);
		return diff_count == 0 ? diff_label : diff_count;
	})
	//fix x coord
	data = $.map(data, function(val, idx) {
		val.data[0][0] = idx;
		return val;
	});
	return data;
}
