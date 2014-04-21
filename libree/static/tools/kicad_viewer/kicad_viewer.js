define(["raphael", "jquery", "./fp_parser", "github", "../libree_tools"],
    function(Raphael, $, FPS, Github, Libree) {

    var github = new Github({token: "154c906062068b8d8a694f5d85c7f1bb3ff1f6ad",
                             auth: "oauth"
                            });

    var fp_parser = new FPS();
    var tableRepo = github.getRepo("KiCad", "kicad-library");
    var libRepo = null;
    var branch = "master";

    var getTable = function () {

        var tab = $("#fptab").val();

        var url = '';

        if (tab = 'kicad_github') {
            tableRepo.read(branch, "template/fp-lib-table.for-github", function(err, contents) {
                onNewFPTable(contents);
            });
        }

    }

    var libraries = [];

    var onNewFPTable = function(table) {
        libraries = fp_parser.getLibrariesFromFpTable(table)

        addLibrariesToChooser()
    };

    var addLibrariesToChooser = function () {
        var chooser = $('#fplib').empty();

        for (var i = 0; i < libraries.length; i++) {
            var name = libraries[i].name;

            var newOpt = $('<option>', {'val': name}).append(name);

            chooser.append(newOpt);
        }

        chooser.val("Capacitors_ThroughHole");

        chooser.change();
    }

    var fps = {}

    var onChooseFPLib = function (libName) {
        console.log(libName);

        libRepo = github.getRepo("KiCad", libName + ".pretty");

        libRepo.contents(branch, "", function(err, contents) {
            addFootprintsToChooser(JSON.parse(contents));
        });
    }

    var addFootprintsToChooser = function (data) {
        var chooser = $('#fp').empty();
        for (var i = 0; i < data.length; i++) {
            var name = data[i].name;
            var newOpt = $('<option>', {'val': name}).append(name);

            chooser.append(newOpt);
        }

        $("#fp").change();
    }

    var onChooseFP = function (fp) {
        var libName = $("#fplib").val();
        var fp = $("#fp").val();

        libRepo.read(branch, fp, function (err, contents) {
            renderFootprint(contents);
        });
    }

    var renderFootprint = function (fp) {
        var data = SExpParse(fp);

        refreshCanvas();

        for (var i = 0; i < data.length; i++) {
            if (Array.isArray(data[i])) {
                var name = data[i][0].name
                if (name == "pad") {
                    drawPad(data[i])
                } else if (name == "fp_line") {
                    drawLine(data[i])
                } else if (name == "fp_circle") {
                    drawCircle(data[i])
                }
            }
        }

        var modSet = paper.setFinish();

        modSet.transform("s20,20,0,0");
        modSet.transform("t250,250...");
    }

    var getColorFromLayers = function (layers) {
        if ($.inArray("F.SilkS", layers) !== -1) {
            return "cyan";
        } else if ($.inArray("F.Cu", layers) !== -1) {
            return "red";
        } else if ($.inArray("B.Cu", layers) !== -1) {
            return "green";
        } else if ($.inArray("*.Cu", layers) !== -1) {
            return "yellow";
        }

        return "white";
    }

    var parseElement = function (elem, e, headPos) {

        for (var i = headPos; i < elem.length; i++) {
            var name = elem[i][0].name;
            if (elem[i].length > 2){
                e[name] = [];

                for (var j = 1; j < elem[i].length; j++) {

                    if (typeof(elem[i][j]) == "Symbol") {
                        e[name].push(elem[i][j].name);
                    } else {
                        e[name].push(elem[i][j]);
                    }
                }

            } else if (elem[i].length == 2) {
                if (typeof(elem[i] == "Symbol")) {
                    e[name] = elem[i][1].name;
                } else {
                    e[name] = elem[i][1];
                }
            }
        }

        return e;
    }

    var drawPad = function (elem, modSet) {

        var p = {"num": elem[1],
                "type": elem[2].name,
                "shape": elem[3].name};

        var p = parseElement(elem, p, 4);

        var graphElem;

        if (p.shape == "rect") {
            graphElem = paper.rect(p.at[0] - p.size[0]/2, p.at[1] - p.size[1]/2, p.size[0], p.size[1])
        } else if (p.shape == "circle") {
            graphElem = paper.circle(p.at[0], p.at[1], p.size[0]/2)
        }

        graphElem.attr({
            fill: getColorFromLayers(p.layers),
            stroke: "none",
            strokeWidth : 0
        });

        if (p.drill) {
            var drillHole = paper.circle(p.at[0], p.at[1], p.drill/2).attr({
                "fill":"black"
            });
        }
    }

    var drawLine = function (elem) {
        var e = parseElement(elem, {}, 1);

        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer]),
            "stroke-width" : e.width*20,
            "stroke-linecap": "round"};

        var graphElem = paper.path("M" + e.start[0] + "," + e.start[1]
                        + "L" + e.end[0] + "," + e.end[1]).attr(options);

    };

    //  (fp_circle (center 0 0) (end 5.08 0.381) (layer F.SilkS) (width 0.254))
    var drawCircle = function (elem) {
        var e = parseElement(elem, {}, 1);

        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer]),
            "stroke-width" : e.width*20
        };

        var r = Math.pow(e.center[0] - e.end[0], 2) + Math.pow(e.center[1] - e.end[1], 2);
        r = Math.sqrt(r);

        graphElem = paper.circle(e.center[0], e.center[1], r).attr(options);
    }

    var paper;

    var refreshCanvas = function () {

        paper = new Raphael($('#view_container').empty().get(0), 500, 500);

        // background
        paper.rect(0, 0, 500, 500).attr({
            fill : "black",
            strokeWidth : 0,
        });

        paper.setStart();
    }

    var makeBindings = function () {
        $("#fplib").change( function() {
            onChooseFPLib($(this).val())
        });

        $("#fp").change( function() {
            onChooseFP($(this).val())
        });
    };

    $( document ).ready(function () {
        makeBindings();
        refreshCanvas();

        getTable(); //start by downloading the default table
        Libree.setupTool();
    });
});
