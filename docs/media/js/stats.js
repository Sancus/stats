function format_adi_data(content) {
    let adi = {};
    adi['graph'] = [];
    adi['table'] = [];
    for (var key in content) {
        date = new Date(key);
        adi['graph'].push([date.getTime(), content[key]['count']]);
        adi['table'].push([key, content[key]['count']]);

    }
    adi['graph'] = adi['graph'].sort((a, b) => a[0] - b[0]);
    // Convert the epoch timestamp back into a date and then get a "YYYY-MM-DD" string
    // to use as index for last available day's data.
    lastday = new Date(adi['graph'][adi['graph'].length-1][0]).toISOString().substring(0,10);
    // Sort versions by # of users descending.
    let uptake = Object.entries(content[lastday]['versions']).sort((a, b) => b[1] - a[1]);
    adi['uptake'] = [];
    // Build an object with arrays showing percentage of users for each version relative to total.
    for (let version of uptake) {
        let series = {name: version[0], data: []};
        for (let k in content) {
            date = new Date(k);
            let percent = ((content[k]['versions'][version[0]] || 0)/content[k]['count'])*100;
            series['data'].push([date.getTime(), percent]);
        }
        series['data'] = series['data'].sort((a, b) => a[0] - b[0]);
        adi['uptake'].push(series);
    }
    return adi;
}


$.getJSON('thunderbird_adi.json', function(data) {
    var adi = format_adi_data(data);

    Highcharts.stockChart('line_adi', {
        title: {
                text: 'Active Daily Installations'
        },
        xAxis: {
                type: 'datetime',
        },
        yAxis: {
                title: {
                        text: '# of Installations'
                },
                min: 0
        },
        tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{series.name} {point.x:%A %e %b}: {point.y} users.'
        },

        legend: {
            enabled: true
        },

        plotOptions: {
            series: {
                showInLegend: true
            }
        },

        navigator: {
            enabled: false
        },

        scrollbar: {
            enabled: false
        },

        rangeSelector: {
            selected: 4
        },

        colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
        series: [{name: "ADI", id: "adi", data: adi['graph']}, {name: "7-day Moving Average", type: "sma", linkedTo: "adi", params: { period: 7 }},]
    });

    $('#adi').DataTable( {
        "searching": true,
        "bPaginate": true,
        "bInfo" : false,
        "order": [[0, "desc"]],
        data: adi['table'],
            columns: [
                { title: "Date" },
                { title: "ADI", render: $.fn.dataTable.render.number(',','.') },
            ]
    });

    $(".dataTables_wrapper").css("width","25%").css("margin", "0 auto");
});

$.getJSON('68uptake.json', function(data) {
    var adi = format_adi_data(data);

    Highcharts.chart('68uptake', {
        chart: {
            type: 'areaspline'
        },
        title: {
            text: 'TB68 Uptake as % of ADI'
        },
        rangeSelector:{
            enabled:true
        },
        xAxis: {
            type: 'datetime',
            title: {
                 text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: '# of Installations'
            },
            min: 0
        },
        tooltip: {
            valueDecimals: 2,
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%A %e %b}: {point.y}% of users.'
        },

        plotOptions: {
            spline: {
                marker: {
                    enabled: true
                }
            }
        },
        series: adi['uptake']
    });
});

$.getJSON('60uptake.json', function(data) {
    var adi = format_adi_data(data);

    Highcharts.chart('60uptake', {
        chart: {
            type: 'areaspline'
        },
        title: {
            text: 'Historical TB60 Uptake (ignoring 68)'
        },
        rangeSelector:{
            enabled:true
        },
        xAxis: {
            type: 'datetime',
            title: {
                 text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: '# of Installations'
            },
            min: 0
        },
        tooltip: {
            valueDecimals: 2,
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%A %e %b}: {point.y}% of users.'
        },

        plotOptions: {
            spline: {
                marker: {
                    enabled: true
                }
            }
        },
        series: adi['uptake']
    });
});
