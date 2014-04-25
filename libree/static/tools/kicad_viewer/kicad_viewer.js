define(["raphael", "jquery", "./fp_parser", "./kicad_hershey", "github", "../libree_tools"],
    function(Raphael, $, FPS, HersheyFont, Github, Libree) {

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

    var getColorFromLayers = function (layers) {
        if ($.inArray("F.Cu", layers) !== -1) {
            return "red";
        } else if ($.inArray("B.Cu", layers) !== -1) {
            return "green";
        } else if ($.inArray("*.Cu", layers) !== -1) {
            return "yellow";
        } else if ($.inArray("F.SilkS", layers) !== -1) {
            return "cyan";
        }

        return "white";
    }

    var drawPad = function (p, modSet) {

        if (p.shape == "rect") {
            graphElem = paper.rect(p.at[0] - p.size[0]/2, p.at[1] - p.size[1]/2, p.size[0], p.size[1])
        } else if (p.shape == "circle") {
            graphElem = paper.circle(p.at[0], p.at[1], p.size[0]/2)
        }

        graphElem.attr({
            fill: getColorFromLayers(p.layers),
            stroke: "none"
        });

        if (p.drill) {
            var drillHole = paper.circle(p.at[0], p.at[1], p.drill/2).attr({
                fill : "black",
                stroke : "none"
            });
        }
    }

    var drawLine = function (e) {
        var width = e.width;
        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer]),
            "stroke-width" : width,
            "stroke-linecap": "round"};

        var graphElem = paper.path("M" + e.start[0] + "," + e.start[1]
                        + "L" + e.end[0] + "," + e.end[1]).attr(options);

    };

    //  (fp_circle (center 0 0) (end 5.08 0.381) (layer F.SilkS) (width 0.254))
    var drawCircle = function (e) {
        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer]),
            "stroke-width" : e.width
        };

        var r = Math.pow(e.center[0] - e.end[0], 2) + Math.pow(e.center[1] - e.end[1], 2);
        r = Math.sqrt(r);

        graphElem = paper.circle(e.center[0], e.center[1], r).attr(options);
    }

    var drawText = function (e) {

        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer]),
            "stroke-width" : 0.2,
            "stroke-linecap": "round"};


        var pos = 0;
        var offset = 82; // "R".charCodeAt(0);

        for (var i = 0; i < e.text.length; i++)
        {
            if (e.text.charCodeAt(i) in HersheyFont) {
                hchar = HersheyFont[e.text.charCodeAt(i)]
            } else {
                hchar = "F^K[KFYFY[K[" // no-char box of doom
            }

            var startX = hchar.charCodeAt(0) - offset;
            var endX = hchar.charCodeAt(1) - offset;

            var newSeg = true;
            var pathStr = ""

            for (var c = 2; c < hchar.length; c += 2) {

                if (hchar[c] === " " && hchar[c+1] === "R") {
                    newSeg = true;
                    continue;
                }

                var x = hchar.charCodeAt(c) - offset;
                var y = hchar.charCodeAt(c + 1) - offset;

                if (newSeg) {
                    newSeg = false;
                    pathStr += "M" + (pos + x) + "," + y;
                } else {
                    pathStr += "L" + (pos + x) + "," + y;
                }
            }

            console.log(pathStr);

            var graphElem = paper.path(pathStr).attr(options);

            pos += endX - startX;
        }
    }

    var elementRenderers = {
        "fp_line": drawLine,
        "fp_circle": drawCircle,
        "pad": drawPad,
        "fp_text": drawText,
    };

    var renderFootprint = function (text) {

        refreshCanvas();

        var fp = fp_parser.parseFootprint(text);

        for (var i = 0; i < fp.length; i++) {
            if (fp[i].type in elementRenderers) {
                elementRenderers[fp[i].type](fp[i].data);
            }
        }

        var modSet = paper.setFinish();

        var bbox = modSet.getBBox();

        var sx = sy = 500;

        var scaleX = sx / bbox.width;
        var scaleY = sy / bbox.height;

        var scale = Math.min(scaleX, scaleY) * 0.85;

        var cx = (sx / 2) - scale * (bbox.x + bbox.x2) / 2;
        var cy = (sy / 2) - scale * (bbox.y + bbox.y2) / 2;

        modSet.transform("s" + scale + "," + scale + ",0,0");
        modSet.transform("t" + cx + "," + cy + "...");
    };


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
