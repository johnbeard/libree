define(["sexpression"], function(SExp) {

    FPS = function () {};

    FPS.prototype.getLibrariesFromFpTable = function (table) {
        var parsed = SExp.parse(table);

        if (parsed[0].name != "fp_lib_table") {
            console.log("Unknown footprint library table format!");
            return;
        }

        var libraries = [];

        //read out the libraries
        for (var i = 1; i < parsed.length; i++) {
            if (parsed[i][0].name != "lib")
                continue;

            newLib = {};

            for (var j = 1; j < parsed[i].length; j++) {
                if (parsed[i][j].length === 2) {
                    var key = parsed[i][j][0].name;

                    if (parsed[i][j][1].name != undefined)
                    {
                        newLib[key] = parsed[i][j][1].name
                    } else {
                        newLib[key] = parsed[i][j][1]
                    }
                }
            }

            libraries.push(newLib);
        }

        return libraries;
    }

    FPS.parseElement = function (elem, e) {

        for (var i = 0; i < elem.length; i++) {

            if (!Array.isArray(elem[i]))
                continue;

            var name = elem[i][0].name;
            if (elem[i].length > 2){
                e[name] = [];

                for (var j = 1; j < elem[i].length; j++) {

                    if (elem[i][j] instanceof SExp.Symbol) {
                        e[name].push(elem[i][j].name);
                    } else {
                        e[name].push(elem[i][j]);
                    }
                }

            } else if (elem[i].length == 2) {
                if (elem[i][1] instanceof SExp.Symbol) {
                    e[name] = elem[i][1].name;
                } else {
                    e[name] = elem[i][1];
                }
            }
        }

        return e;
    }

    var parsePad = function (sexp_elem)
    {
        var p = {"num": sexp_elem[1],
                "type": sexp_elem[2].name,
                "shape": sexp_elem[3].name};

        p = FPS.parseElement(sexp_elem, p, 4);

        return p;
    }

    var parseLine = function (sexp_elem)
    {
        return FPS.parseElement(sexp_elem, {}, 1);
    }

    var parseCircle = function (sexp_elem)
    {
        return FPS.parseElement(sexp_elem, {}, 1);
    }

    var parseText = function (sexp_elem)
    {
        var e = {type: sexp_elem[1].name,
                text: sexp_elem[2].name,
            }

        e = FPS.parseElement(sexp_elem, e, 3);

        return e
    }

    FPS.prototype.parseFootprint = function (text)
    {
        var data = SExp.parse(text);

        var fp_elems = [];

        for (var i = 0; i < data.length; i++) {
            if (Array.isArray(data[i])) {

                var elem = null;

                var name = data[i][0].name
                if (name == "pad") {
                    elem = parsePad(data[i])
                } else if (name == "fp_line") {
                    elem = parseLine(data[i])
                } else if (name == "fp_circle") {
                    elem = parseCircle(data[i])
                } else if (name == "fp_text") {
                    elem = parseText(data[i])
                }

                if (elem) {
                    fp_elems.push({ "type": name, "data": elem});
                }
            }
        }

        return fp_elems;
    }

    return FPS;
});
