define(["raphael", "jquery", "./fp_parser", "./kicad_hershey", "github", "bootbox", "../libree_tools"],
    function(Raphael, $, FPS, HersheyFont, Github, Bootbox, Libree) {


    var github = null;

    var setupGithub = function (token) {

        var ghToken = localStorage.getItem('githubAPIToken');

        if (ghToken) {
            // try to use the token from storage
            console.log("using token from storage: " + ghToken);
            github = new Github({token: ghToken,
                                 auth: "oauth"
                                });
        }

        // either we have no token, or the one we had didn't work,
        // get another one!
        if (!github) {
            ghToken = getGithubToken();
            return;
        } else {
            var tableRepo = github.getRepo("KiCad", "kicad-library");

            getTable(tableRepo); //start by downloading the default table
        }
    }

    var getGithubToken = function () {

        Bootbox.dialog({
            message: "A GitHub OAuth key is required to access the KiCad libraries. Please enter it below.\
It will be stored only on your machine, and will not be sent to LibrEE\
<input id='githubToken' style='width:100%' />",
            title: "GitHub OAuth key required",
            buttons: {
                main: {
                    label: "OK",
                    className: "btn-primary",
                    callback: function(result) {
                        githubToken = $('input#githubToken').val();
                        localStorage.setItem('githubAPIToken', githubToken);
                        console.log("Settings gh token: " + githubToken);
                        setupGithub();
                    }
                }
            }
        });

    }

    var fp_parser = new FPS();
    var libRepo = null;
    var branch = "master";

    var getTable = function (repo) {

        var tab = $("#fptab").val();

        var url = '';

        if (tab = 'kicad_github') {
            repo.read(branch, "template/fp-lib-table.for-github", function(err, contents) {
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
        } else {
            console.log("Unssuported pad type: " + e.shape);
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

        layers.mod.push(padElem);
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

        layers.mod.push(
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

        layers.mod.push(
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

        layers.mod.push(graphElem);
    }

    var drawOrigin = function (e) {

        var options = {
            fill: "none",
            stroke: "blue",
            "stroke-width" : 2};

        var hLine = paper.path("M" + -500 + "," + 0
                        + "L" + 500 + "," + 0).attr(options);
        var vLine = paper.path("M" + 0 + "," + -500
                        + "L" + 0 + "," + 500).attr(options);

        layers.origin.push(hLine, vLine);
    }

    var elementRenderers = {
        "fp_line": drawLine,
        "fp_circle": drawCircle,
        "pad": drawPad,
        "fp_text": drawText,
        "at": drawOrigin,
    };

    var singleElements = ["at"];

    var paper;
    var layers;
    var label;
    var fontHeight;

    var renderFootprint = function (text) {

        refreshCanvas();

        var fp = fp_parser.parseFootprint(text);

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

        var bbox = layers.mod.getBBox();

        var sx = sy = 500;

        var scaleX = sx / bbox.width;
        var scaleY = sy / bbox.height;

        var scale = Math.min(scaleX, scaleY) * 0.85;

        var cx = (sx / 2) - scale * (bbox.x + bbox.x2) / 2;
        var cy = (sy / 2) - scale * (bbox.y + bbox.y2) / 2;

        var transformLayers = ["mod", "overlay", "drills"];

        for (var i in transformLayers) {
            layers[transformLayers[i]].transform("s" + scale + "," + scale + ",0,0...");
            layers[transformLayers[i]].transform("t" + cx + "," + cy + "...");
        }

        layers.origin.transform("t" + cx + "," + cy + "...");

        layers.origin.toBack();
        layers.mod.toFront();
        layers.drills.toFront();
        layers.overlay.toFront();
    };

    var refreshCanvas = function () {

        paper = new Raphael($('#view_container').empty().get(0), 500, 500);

        // background
        paper.canvas.style.backgroundColor = '#000';

        fontHeight = getFontHeight();

        layers = {
            grid: paper.set(),
            origin: paper.set(),
            mod: paper.set(),
            drills: paper.set(),
            overlay: paper.set(),
        }
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

        setupGithub();

        makeBindings();
        refreshCanvas();

        Libree.setupTool();
    });
});
