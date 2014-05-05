define(["raphael", "jquery", "./fp_parser", "./kicad_hershey", "../../js/github", "../libree_tools", "raphael.pan-zoom"],
    function(Raphael, $, FPS, HersheyFont, Github, Libree) {

    var github = null;

    var fp_parser = new FPS();
    var libRepo = null;
    var branch = "master";

    var getTable = function (repo) {

        var tab = $("#fptab").val();

        var url = '';

        if (tab = 'kicad_github') {
            repo.read(branch, "template/fp-lib-table.for-github", function(err, contents) {

                if (err) {
                    Github.setupGithub(githubSetupCallback);
                } else {
                    onNewFPTable(contents);
                }
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

        chooser.change();
    }

    var fps = {}

    var onChooseFPLib = function (libName) {
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
            return "#840000";
        } else if ($.inArray("B.Cu", layers) !== -1) {
            return "green";
        } else if ($.inArray("*.Cu", layers) !== -1) {
            return "yellow";
        } else if ($.inArray("F.SilkS", layers) !== -1) {
            return "cyan";
        } else if ($.inArray("F.Adhes", layers) !== -1
                    || $.inArray("F.Mask", layers) !==f -1
                    || $.inArray("F.Paste", layers) !== -1) {
            return "magenta";
        }

        return "white";
    }

    var getSetFromLayers = function (layers) {
        if ($.inArray("*.Cu", layers) !== -1) {
            return "F.Cu";

        } else {
            return layers[0]
        }
    }

    var drawTextInternal = function (text, size, pos, width) {

        var pathStr = hersheyText(text.toString());

        var textElem = paper.path(pathStr).attr({"stroke-width": 0});

        var nativeW = textElem.getBBox().width;

        var scale = size / fontHeight;

        textElem.transform("s" + scale + "," + scale + ",0,0");
        textElem.transform("t" + (pos.x - (nativeW) * scale / 2) + "," + pos.y + "...");

        textElem.attr({"stroke-width": width / scale});

        return textElem;
    }

    var drawPad = function (e) {
        var padElem;
        if (e.shape == "rect") {
            padElem = paper.rect(e.at.x - e.size.x/2, e.at.y - e.size.y/2, e.size.x, e.size.y);
        } else if (e.shape == "circle") {
            padElem = paper.circle(e.at.x, e.at.y, e.size.x/2);
        } else if (e.shape == "oval") {
            padElem = paper.rect(e.at.x - e.size.x/2, e.at.y - e.size.y/2, e.size.x, e.size.y, e.size.y/2);
        } else {
            console.log("Unsupported pad type: " + e.shape);
            return;
        }

        padElem.attr({
            fill: getColorFromLayers(e.layers.values),
            stroke: "none"
        });

        padElem.data("num", e.num);

/*
        padElem.hover(function() {
            var bbox = this.getBBox();
            label.attr({text: this.data("num")}).update(bbox.x, bbox.y + bbox.height/2, bbox.width).toFront().show();
        },
        function() {
            label.hide();
        });*/

        var size = 0.5; //60 mils default
        textElem = drawTextInternal(e.num, size, e.at, 0.1);

        // stroke is always 1
        textElem.attr({
            fill: "none",
            stroke: "#fff",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        });

        layers[getSetFromLayers(e.layers.values)].push(padElem);
        layers.overlay.push(textElem);

        if (e.drill && e.class !== "np_thru_hole") {
            var drillHole = paper.circle(e.at.x, e.at.y, e.drill.value/2).attr({
                fill : "black",
                stroke : "none"
            });

            layers.drills.push(drillHole);
        }
    }

    var drawLine = function (e) {
        var width = e.width.value;
        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer.value]),
            "stroke-width" : width,
            "stroke-linecap": "round"};

         layers[getSetFromLayers([e.layer.value])].push(
            paper.path("M" + e.start.x + "," + e.start.y
                        + "L" + e.end.x + "," + e.end.y).attr(options)
        );

    };

    var drawCircle = function (e) {
        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer.value]),
            "stroke-width" : e.width.value
        };

        var r = Math.pow(e.center.x - e.end.x, 2) + Math.pow(e.center.y - e.end.y, 2);
        r = Math.sqrt(r);

        layers[getSetFromLayers([e.layer.value])].push(
            paper.circle(e.center.x, e.center.y, r).attr(options)
        );
    }

    // return the path string
    var hersheyText = function (text) {
        var pos = 0;
        var offset = 82; // "R".charCodeAt(0);

        var pathStr = ""
        var startPos;

        for (var i = 0; i < text.length; i++)
        {
            if (text.charCodeAt(i) in HersheyFont) {
                hchar = HersheyFont[text.charCodeAt(i)]
            } else {
                hchar = "F^K[KFYFY[K[" // no-char box of doom
            }

            var startX = hchar.charCodeAt(0) - offset;
            var endX = hchar.charCodeAt(1) - offset;

            // collect the co-ords
            var coords = [[Infinity, Infinity]]; //start with a new segment

            for (var c = 2; c < hchar.length; c += 2) {

                if (hchar[c] === " " && hchar[c+1] === "R") {
                    coords.push([Infinity, Infinity]); //mark a new segment
                    continue;
                }

                var x = hchar.charCodeAt(c) - offset;
                var y = hchar.charCodeAt(c + 1) - offset;

                coords.push([x,y]);
            }

            // apply the initial offset by finding the dead space on the
            // left of the first char
            if (i == 0)
            {
                var minX = coords[0][0];
                for (var coord = 1; coord < coords.length; coord++) {
                    minX = Math.min(minX, coords[coord][0]);
                }
                pos += startX - minX;
            }

            //draw the coords
            for (var coord = 1; coord < coords.length; coord++) {
                if (coords[coord][0] == Infinity) {
                    continue;
                } else {
                    pathStr += (coords[coord-1][0] == Infinity) ? "M" : "L";

                    pathStr += (pos + coords[coord][0] - startX) + "," + coords[coord][1];
                }
            }

            pos += endX - startX;
        }

        return pathStr;
    }

    var getFontHeight = function() {
        var pathStr = hersheyText("X");

        var path = paper.path(pathStr).attr({"stroke-width":0});
        var h = path.getBBox().height;

        path.remove();

        return h;
    }

    var drawText = function (e) {

        var size = 1.524; //60 mils default

        if ("size" in e.effects.font)
            size = e.effects.font.size.y;

        var graphElem = drawTextInternal(e.text, size, e.at, 0.9 * e.effects.font.thickness.value);

        // do this after the scale from hershey-size to real-size
        graphElem.attr({
            fill: "none",
            stroke: "#eee",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        });

        layers["F.SilkS"].push(graphElem);
    }

    var elementRenderers = {
        "fp_line": drawLine,
        "fp_circle": drawCircle,
        "pad": drawPad,
        "fp_text": drawText,
        //"at": drawOrigin,
    };

    var singleElements = ["at"];

    var paper;
    var layers;
    var label;
    var fontHeight;
    var everythingSet;
    var canvasSize = 500;
    var panZoom, fp;

    var layerList = ["grid", "origin", "B.SilkS", "B.Adhes", "B.Cu", "mod",
                    "F.Cu", "drills", "F.Mask", "F.Paste", "F.Adhes", "F.SilkS", "Edge.Cuts", "overlay"];

    var renderFootprint = function (text) {

        refreshCanvas();

        fp = fp_parser.parseFootprint(text);

        for (var type in elementRenderers) {

            if (type in fp) {

                if (singleElements.indexOf(type) > -1) {
                    elementRenderers[type](fp[type]);
                } else {
                    for (var j = 0; j < fp[type].length; j++) {
                        elementRenderers[type](fp[type][j]);
                    }
                }
            }
        }

        var noScaleLayers = ["origin"];

        everythingSet = paper.set();

        for (var l = 0; l < layerList.length; l++) {
            var name = layerList[l];
            var lay = layers[name];


            if (lay.length && noScaleLayers.indexOf(name) === -1) {
                everythingSet.push(lay);
            }

            lay.toFront();
        }

        rescaleView();
    }

    var rescaleView = function () {

        //everythingSet.transform("t" + canvasSize/2 + "," + canvasSize/2 + "...");

        var bbox = everythingSet.getBBox();

        var cx = bbox.x + bbox.width / 2;
        var cy = bbox.y + bbox.height / 2;

        var maxDim = Math.max(bbox.width, bbox.height);

        var zoomSteps = 100;

        var margin = 0.1;

        var scale = (1 + 2 * margin) * maxDim / (canvasSize);

        panZoom = paper.panzoom({
            initialZoom: zoomSteps * (1 - scale),
            initialPosition: {
                x: cx,
                y: cy
            },
            zoomStep : 1/zoomSteps,
            repaintCallback: onRepaint,
            maxZoom: zoomSteps,
        });
        panZoom.enable();

    };

    var onRepaint = function (pos, scale) {
        console.log(pos, scale);

        var options = {
            fill: "none",
            stroke: "blue",
            "stroke-width" : 1 * scale};

        var originSize = canvasSize * scale;

        var widthOfView = originSize; // in FP units

        var l = pos.x

        var hLine = paper.path("M" + (pos.x - originSize/2) + "," + -fp.at.y
                        + "L" + (pos.x + originSize/2) + "," + -fp.at.y).attr(options);
        var vLine = paper.path("M" + -fp.at.x + "," + (pos.y - originSize/2)
                        + "L" + -fp.at.x + "," + (pos.y + originSize/2)).attr(options);

        layers.origin.forEach(function(elem) {
            elem.remove();
        });
        layers.origin.push(hLine, vLine);

        layers.origin.toBack();
    }

    var refreshCanvas = function () {
        var vc = $('#view_container').empty().css({
            width: canvasSize,
            height: canvasSize
        });

        paper = new Raphael("view_container", vc.width(), vc.height());

        // background
        paper.canvas.style.backgroundColor = '#000';

        fontHeight = getFontHeight();

        layers = {};
        for (var l = 0; l < layerList.length; l++) {
            layers[layerList[l]] = paper.set();
        }
    };

    var makeBindings = function () {
        $("#fplib").change( function() {
            onChooseFPLib($(this).val())
        });

        $("#fp").change( function() {
            onChooseFP($(this).val())
        });
    };

    var githubSetupCallback = function (github_) {
        github = github_;

        var tableRepo = github.getRepo("KiCad", "kicad-library");
        getTable(tableRepo); //start by downloading the default table
    }

    $( document ).ready(function () {

        Github.setupGithub(githubSetupCallback);

        makeBindings();
        refreshCanvas();

        Libree.setupTool();
    });
});
