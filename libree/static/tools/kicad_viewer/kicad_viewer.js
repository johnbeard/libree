define(["raphael", "jquery", "./fp_parser", "./kicad_hershey", "../../js/auth/github", "../libree_tools", "raphael.pan-zoom"],
    function(Raphael, $, FPS, HersheyFont, Github, Libree) {

    "use strict";

    var fp_parser = new FPS();
    var libRepo = null;
    var branch = "master";

    var getMode = function () {
        return $("#mode-select .active").attr("id");
    };

    var modeChanged = function (id) {
        if (id == "input-fplt-gh") {

            $("#fplt-url-area").toggleClass("hidden", false);
            $("#fplt-text-area").toggleClass("hidden", true);

            $("#fplt-input-container,#fplib-select-area,#fp-select-area").toggleClass("hidden", false);
            $("#fp-text-area").toggleClass("hidden", true);

            getTable();

        } else if (id == "input-fplt-text") {

            $("#fplt-url-area").toggleClass("hidden", true);
            $("#fplt-text-area").toggleClass("hidden", false);

            $("#fplt-input-container,#fplib-select-area,#fp-select-area").toggleClass("hidden", false);
            $("#fp-text-area").toggleClass("hidden", true);

            getTable();

        } else { //manual footprint input
            $("#fplt-input-container").toggleClass("hidden", true);

            $("#fplib-select-area").toggleClass("hidden", true);
            $("#fp-select-area").toggleClass("hidden", true);
            $("#fp-text-area").toggleClass("hidden", false);

            renderFootprintFromManualInput();
        }
    };

    var getTable = function () {
        $("#fplib,#fp").empty();
        var tab = $("#fptab").val();
        var mode = getMode();

        Github.setupGithub(function () {
            if (mode == "input-fplt-gh") {
                getTableFromGithub();
            } else if (mode == "input-fplt-text") {
                onNewFPTable($('#fplt-text').val());
            }
        });
    };

    var getTableFromGithub = function() {
        var tableRepo = Github.getInstance().getRepo($("#fplt-gh-owner").val(), $("#fplt-gh-repo").val());

        tableRepo.read($("#fplt-gh-branch").val(), $("#fplt-gh-path").val(), function(err, contents) {

            if (err) {
                console.log("Error getting fp-lib-table from Github: " + err);
            } else {
                onNewFPTable(contents);
            }
        });
    };

    var onNewFPTable = function(table) {
        var subs = [];

        var substrs = $('#fplt-subst').val().split("\n");

        for (var i = 0; i < substrs.length; i++) {
            var parts = substrs[i].trim().split("=", 2);

            if (parts.length == 2) {
                subs.push(substrs[i].trim().split("=", 2));
            }
        }

        var libraries = fp_parser.getLibrariesFromFpTable(table, subs);
        addLibrariesToChooser(libraries);
    };

    var addLibrariesToChooser = function (libraries) {
        var chooser = $('#fplib').empty();

        for (var i = 0; i < libraries.length; i++) {
            var name = libraries[i].name;

            var newOpt = $('<option>', {
                "val": name,
                "data-libdesc": JSON.stringify(libraries[i])
            }).append(name);

            chooser.append(newOpt);
        }

        chooser.change();
    };

    var githubURIRegex = /https?:\/\/github\.com\/([^\/]+)\/(.*)/;

    var onChooseFPLib = function (lib) {

        var libDesc = lib.find(":selected").attr("data-libdesc");

        if (!libDesc) {
            return;
        }

        libDesc = JSON.parse(libDesc);

        if (libDesc.type == "Github")
        {
            //"https://github.com/KiCad/Capacitors_Tantalum_SMD.pretty"

            var match = githubURIRegex.exec(libDesc.uri);

            if (match.length != 3) {
                return;
            }

            var owner = match[1];
            var repo = match[2];
            libRepo = Github.getInstance().getRepo(owner, repo);

            libRepo.contents("master", "", function(err, contents) {
                addFootprintsToChooser(JSON.parse(contents));
            });
        }
    };

    var addFootprintsToChooser = function (data) {
        var chooser = $('#fp').empty();
        for (var i = 0; i < data.length; i++) {
            var name = data[i].name;
            var newOpt = $('<option>', {'val': name}).append(name);

            chooser.append(newOpt);
        }

        $("#fp").change();
    };

    var onChooseFP = function () {
        var libName = $("#fplib").val();
        var fp = $("#fp").val();

        libRepo.read(branch, fp, function (err, contents) {
            // make sure github mode is still selected
            if (getMode() == "input-fplt-gh" || getMode() == "input-fplt-text") {
                renderFootprint(contents);
            }
        });
    };

    var renderFootprintFromManualInput = function () {
        renderFootprint($('#fp-text').val());
    };

    var getColorFromLayers = function (layers) {
        if ($.inArray("F.Cu", layers) !== -1) {
            return "#840000";
        } else if ($.inArray("B.Cu", layers) !== -1) {
            return "green";
        } else if ($.inArray("*.Cu", layers) !== -1 ||
                    $.inArray("Edge.Cuts", layers) !== -1) {
            return "yellow";
        } else if ($.inArray("F.SilkS", layers) !== -1) {
            return "cyan";
        } else if ($.inArray("F.Adhes", layers) !== -1 ||
                    $.inArray("F.Mask", layers) !== -1 ||
                    $.inArray("F.Paste", layers) !== -1) {
            return "magenta";
        }
        return "white";
    };

    var getSetFromLayers = function (elemLayers) {
        if ($.inArray("*.Cu", elemLayers) !== -1) {
            return layers["F.Cu"];
        } else if ($.inArray(layers[0], layers) !== -1) {
            return layers[elemLayers[0]];
        } else {
            return layers.mod;
        }
    };

    var drawTextInternal = function (text, size, pos, width) {

        var pathStr = hersheyText(text.toString());

        var textElem = paper.path(pathStr).attr({"stroke-width": 0});

        var nativeW = textElem.getBBox().width;

        var scale = size / fontHeight;

        textElem.transform("s" + scale + "," + scale + ",0,0");
        textElem.transform("t" + (pos.x - (nativeW) * scale / 2) + "," + pos.y + "...");

        textElem.attr({"stroke-width": width / scale});

        return textElem;
    };

    var drawPad = function (e) {
        var padElem;
        if (e.shape == "rect") {
            padElem = paper.rect(e.at.x - e.size.x/2, e.at.y - e.size.y/2, e.size.x, e.size.y);
        } else if (e.shape == "circle") {
            padElem = paper.circle(e.at.x, e.at.y, e.size.x/2);
        } else if (e.shape == "oval") {
            var round = Math.min(e.size.x, e.size.y) / 2;
            padElem = paper.rect(e.at.x - e.size.x/2, e.at.y - e.size.y/2, e.size.x, e.size.y, round);
        } else if (e.shape == "trapezoid") {
            var size = {'t': e.size.x, 'r': e.size.y, 'b': e.size.x, 'l': e.size.y};

            if (e.rect_delta.x === 0 || e.rect_delta.y === 0) {
                if (e.rect_delta.x !== 0) {
                    if (e.rect_delta.x > 0) {
                        size.l -= e.rect_delta.x;
                    } else {
                        size.r += e.rect_delta.x;
                    }
                } else if (e.rect_delta.y !== 0) { //else
                    if (e.rect_delta.y > 0) {
                        size.t -= e.rect_delta.y;
                    } else {
                        size.b += e.rect_delta.y;
                    }
                }
            }

            padElem = paper.path("M" + (e.at.x - size.t/2) + "," + (e.at.y - size.r/2) +
                                 "L" + (e.at.x + size.t/2) + "," + (e.at.y - size.l/2) +
                                 "L" + (e.at.x + size.b/2) + "," + (e.at.y + size.l/2) +
                                 "L" + (e.at.x - size.b/2) + "," + (e.at.y + size.r/2) +
                                 "Z");
        } else {
            console.log("Unsupported pad type: " + e.shape);
            return;
        }

        padElem.attr({
            fill: getColorFromLayers(e.layers.values),
            stroke: "none"
        });

        padElem.data("num", e.num);

        if (e.at.rot) {
            padElem.transform("R" + e.at.rot + "...");
        }

        /*
        padElem.hover(function() {
            var bbox = this.getBBox();
            label.attr({text: this.data("num")}).update(bbox.x, bbox.y + bbox.height/2, bbox.width).toFront().show();
        },
        function() {
            label.hide();
        });
        */

        var textSize = 0.5; //60 mils default
        var textElem = drawTextInternal(e.num, textSize, e.at, 0.1);

        // stroke is always 1
        textElem.attr({
            fill: "none",
            stroke: "#fff",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
        });

        getSetFromLayers(e.layers.values).push(padElem);
        layers.overlay.push(textElem);

        if (e.drill && e.class !== "np_thru_hole") {
            var drillHole = paper.circle(e.at.x, e.at.y, e.drill.value/2).attr({
                fill : "black",
                stroke : "none"
            });

            layers.drills.push(drillHole);
        }
    };

    var drawLine = function (e) {
        var width = e.width.value;
        var options = {
            fill: "none",
            stroke: getColorFromLayers([e.layer.value]),
            "stroke-width" : width,
            "stroke-linecap": "round"};

         getSetFromLayers([e.layer.value]).push(
            paper.path("M" + e.start.x + "," + e.start.y +
                       "L" + e.end.x + "," + e.end.y).attr(options)
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

        getSetFromLayers([e.layer.value]).push(
            paper.circle(e.center.x, e.center.y, r).attr(options)
        );
    };

    // return the path string
    var hersheyText = function (text) {
        var pos = 0;
        var offset = 82; // "R".charCodeAt(0);

        var pathStr = "";
        var startPos;

        for (var i = 0; i < text.length; i++)
        {
            var hchar;
            if (text.charCodeAt(i) in HersheyFont) {
                hchar = HersheyFont[text.charCodeAt(i)];
            } else {
                hchar = "F^K[KFYFY[K["; // no-char box of doom
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
            var coord;
            if (i === 0)
            {
                var minX = coords[0][0];
                for (coord = 1; coord < coords.length; coord++) {
                    minX = Math.min(minX, coords[coord][0]);
                }
                pos += startX - minX;
            }

            //draw the coords
            for (coord = 1; coord < coords.length; coord++) {
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
    };

    var getFontHeight = function() {
        var pathStr = hersheyText("X");

        var path = paper.path(pathStr).attr({"stroke-width":0});
        var h = path.getBBox().height;

        path.remove();

        return h;
    };

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
    };

    var elementRenderers = {
        "fp_line": drawLine,
        "fp_circle": drawCircle,
        "pad": drawPad,
        "fp_text": drawText
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

    var attemptToRenderElement = function (elem, renderer) {
        try {
            renderer(elem);
        } catch (e) {
            console.log("Malformed footprint");
            // do nothing, it's probably malformed
        }
    };

    var renderFootprint = function (text) {

        refreshCanvas();

        fp = fp_parser.parseFootprint(text);

        for (var type in elementRenderers) {

            if (type in fp) {
                var renderer = elementRenderers[type];

                if (singleElements.indexOf(type) > -1) {
                    attemptToRenderElement(fp[type], renderer);
                } else {
                    for (var j = 0; j < fp[type].length; j++) {
                        attemptToRenderElement(fp[type][j], renderer);
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
    };

    var rescaleView = function () {

        var bbox = everythingSet.getBBox();

        var cx = bbox.x + bbox.width / 2;
        var cy = bbox.y + bbox.height / 2;

        if (isNaN(cx) || isNaN(cy)) {
            return;
        }

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

        if (!fp.at)
            return;

        var options = {
            fill: "none",
            stroke: "blue",
            "stroke-width" : 1 * scale};

        var originSize = canvasSize * scale;

        var hLine = paper.path("M" + (pos.x - originSize/2) + "," + -fp.at.y +
                        "L" + (pos.x + originSize/2) + "," + -fp.at.y).attr(options);
        var vLine = paper.path("M" + -fp.at.x + "," + (pos.y - originSize/2) +
                        "L" + -fp.at.x + "," + (pos.y + originSize/2)).attr(options);

        layers.origin.forEach(function(elem) {
            elem.remove();
        });
        layers.origin.push(hLine, vLine);

        layers.origin.toBack();
    };

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

    var typingTimer;
    var makeBindings = function () {
        $("#fplib").change( function() {
            onChooseFPLib($(this));
        });

        $("#fp").change( function() {
            onChooseFP($(this).val());
        });

        $('#fetch-libraries').click( function() {
            getTable();
        });

         Libree.setupToggleButton("#mode-select", modeChanged);
         Libree.doneTyping("#fp-text", typingTimer, 500, renderFootprintFromManualInput);
    };

    $( document ).ready(function () {

        makeBindings();
        refreshCanvas();

        // default action on load: try to silently load the
        // KiCad github libs
        Github.executeIfNoAuthRequired( function() {
            getTable();
        });

        Libree.setupTool();
    });
});
