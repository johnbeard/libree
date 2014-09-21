define(["raphael", "jquery", "../libree_tools", 'jquery.flot'],
    function(Raphael, $, Libree) {

    var getFrequencyResponse = function (filterType) {

        if (filterType == "butter_lp") {
            return function (w) {
                var w0 = 1;
                var order = 1;

                return Math.sqrt(1/(1 + Math.pow(w/w0, 2 * order)));
            }
        }
        else if (filterType == "butter_hp") {
            return function (w) {
                var w0 = 1;
                var order = 1;

                return Math.sqrt(1/(1 + Math.pow(w/w0, 2 * order)));
            }
        }
    }

    /*
     * Event handlers
     */
    var onFilterTypeChanged = function (e) {

        var filterType = $('select#filter-type').val();

        console.log(filterType);

        var frFn = getFrequencyResponse(filterType);

        drawFreqResp(frFn);
    };

    var logSpace = function (lo, hi, n) {

        // get the endpoints in log space (natural log will do)
        var logLo = Math.log(lo);
        var logHi = Math.log(hi);

        var logDelta = (logHi - logLo) / n;

        var pts = new Array();

        for (var x = logLo; x < logHi; x += logDelta)
        {
            pts.push(Math.exp(x));
        }

        // and we already know the last one
        pts.push(Math.exp(logHi));

        console.log(pts)

        return pts;
    }

    var drawFreqResp = function (frFn) {

        var fr = new Array();

        var w0 = 1;
        var wMin = 0.01;
        var wMax = 100;
        var pts = 250; //data points

        var dW = (wMax - wMin) / pts; //sample spacing

        var wPts = logSpace(wMin, wMax, pts);

        // for each data point
        for (var i = 0; i < wPts.length; i++) {
            var w = wPts[i];
            fr.push([w, frFn(w)]);
        }

        var options = {
            xaxes: [{
                axisLabel: 'Frequency / Hz',
                ticks: [0.01, 0.1, 1, 10, 100],
                transform:  function(v) {
                     return Math.log(v+0.0099); /*move away from zero*/
                },
                tickFormatter: function(val,axis){
                    return Libree.sigFigs(val, 2);
                }
            }],
            yaxes: [{
                axisLabel: 'Gain (dB)',
                position: 'left',
            }],
            colors: ["#0022ff"]
        };

        $.plot("#freq-resp", [{data:fr}], options);
    }

    var makeBindings = function () {
        $('select#filter-type').change(onFilterTypeChanged)
    };

    $( document ).ready(function () {

        makeBindings();

        $('select#filter-type').change();

        Libree.setupTool();
    });
});
