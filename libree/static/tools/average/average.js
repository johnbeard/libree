/*
 * LTC encoder/decoder
 *
 * (c) John Beard 2013
 * Part of LibrEE.org
 *
 * Released under the GPLv3
 * See libree.org/license
 */
define(["../libree_tools",
    "../../js/average",
    'jquery.flot', 'jquery.flot.resize', 'jquery.flot.axislabels',
    "mathjax"
    ], function(Libree, Avg) {
    var avs, plot;

    var computeAverage = function(vals) {

        avs = {};
        for (var key in Avg.types)
        {
            if ($('#' + key + ".btn").hasClass('active')) {
                avs[key] = Avg.types[key].func(vals);
            }
        }
    };

    var compute = function() {
        var vals = getVals();

        var origVals = vals.slice(0); //preserve original order for the graph, the functions are free to re-arrange

        computeAverage(vals);

        writeResults(vals);
        drawGraph(origVals);
    }

    var getVals = function() {
        var str = $("#input-data").val().trim();

        if (!str)
            return;

        var valStrs = str.trim().split(/[;:,]/g);

        var arr = Array(valStrs.length);

        numVals = 0;
        for (var i = 0; i < valStrs.length; i += 1) {
            var value = parseFloat(valStrs[i]);

            if (!isNaN(value)) {
                arr[i] = value;
                numVals++;
            }
        }

        arr.length = numVals; // Deletes the last element.

        return arr;
    }

    function showTooltip(pagePos, str) {
        $("#tooltip").remove();
        $('<div id="tooltip" class="graph-tooltip">' + str + '</div>').css({
            top: pagePos[1] + 5,
            left: pagePos[0] + 5,
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    };

    function nonPointToolTip(pagePos, plotPos) {
        var diff = Infinity;
        var minKey;

        for (var key in avs) {
            var newDiff = Math.abs(avs[key] - plotPos[1]);
            if (newDiff < diff) {
                diff = newDiff;
                minKey = key;
            };
        }

        var offset = $('#graph').offset();
        var offsetX = offset.left;
        var offsetY = offset.top;

        offset = plot.getPlotOffset();
        offsetX += offset.left;
        offsetY += offset.top;

        var closestAvgY = plot.getAxes().yaxis.p2c(avs[key]) + offset.top;
        var closestAvgX = pagePos[0] + offset.left;

        console.log(pagePos, closestAvgX, closestAvgY);

        showTooltip([closestAvgX, closestAvgY], 'aaaa');

    }

    var previousPoint = null;
    var bindHover = function(tooltip) {
        $("#graph").bind("plothover", function (event, pos, item) {

            if (tooltip) {
                if (item) {
                    if (previousPoint != item.dataIndex) {
                        previousPoint = item.dataIndex;

                        showTooltip([item.pageX, item.pageY],
                            "Sample " + (item.datapoint[0] + 1) + ": " + item.datapoint[1]);
                    }
                }
                else {
                    previousPoint = null;
                    //nonPointToolTip([pos.pageX, pos.pageY], [pos.x, pos.y]);
                }
            }
        });
    };

    var drawGraph = function (vals) {

        var points = [];

        for (var i = 0; i < vals.length; i += 1) {
            points.push([i,vals[i]]);
        }

        var sets = [];

        sets.push({
                data: points,
                points: {
                    radius: 5,
                    show: true,
                    fill: true,
                    color: '#000000'
                }
            });

        for (var key in avs) {
            var avgLine = [[-1,avs[key]], [vals.length, avs[key]]];

            sets.push({
                    label: Avg.types[key].label,
                    data:avgLine,
                });
        }

        options = {
            legend: {show: true},
            grid: { hoverable: true, clickable: true },
            xaxes: [{
                show: false,
                min:-0.5,
                max:vals.length-0.5
            }],
            yaxes: [{
                axisLabel: 'Value',
                position: 'left',
            }],
            legend: { show: true },
            colors: ["#000033", 'red', 'blue', 'green', 'orange']
        }

        plot = $.plot("#graph", sets, options);
    }

    var writeResults = function(vals) {
        var cont = $("#formulae");

        var tab = $("<table>")

        tab.append($("<tr>")
                    .append($("<th>").text("Average"))
                    .append($("<th>").text("Formula"))
                    .append($("<th>").text("Value")));

        for (var key in avs) {
            var result;
            if (avs[key] !== null)
                result = avs[key];
            else
                result = "Does not exist";

            tab.append($("<tr>")
                    .append($("<td>").text(Avg.types[key].label))
                    .append($("<td>").text("$$" + Avg.types[key].formula + "$$"))
                    .append($("<td>").text(result)));
        }

        cont.empty().append(tab);
        MathJax.Hub.Typeset(); //reset the maths
    }

    var typingTimer;
    var makeBindings = function () {
        Libree.setupIndependentToggleButtons("#input-select", function(){compute();});

        Libree.doneTyping("textarea", typingTimer, 500, compute);

        bindHover(true);
    }

    $( document ).ready(function() {
        makeBindings();
        compute();
        Libree.setupTool();
    });

});
