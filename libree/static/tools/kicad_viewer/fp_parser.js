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

    var parseText = function (s, obj)
    {
        var i = 1;
        obj["class"] = s[i++].name;
        obj["text"] = (s[i] instanceof SExp.Symbol) ? s[i++].name : s[i++];
        obj["text"] = obj["text"].toString();
        return i;
    }

    var parseModule = function (s, obj) {
        var i = 1
        obj["name"] = s[i++].name;

        return i;
    }

    var parseCoords = function (s, obj) {
        var i = 1
        obj["x"] = s[i++];
        obj["y"] = s[i++];

        obj["rot"] = (s.length >= i) ? s[i++] : 0;

        return i;
    }

    var parseValue = function (s, obj) {
        var i = 1;
        obj["value"] = s[i++];
        return i;
    }

    var parseIdentifier = function (s, obj) {
        var i = 1;
        obj["value"] = s[i++].name;
        return i;
    }

    var parseNone = function (s, obj) {
        return 1;
    }

    var parsePad = function (s, obj)
    {
        var i = 1;
        obj["num"] = (s[i] instanceof SExp.Symbol) ? s[i++].name : s[i++];
        obj["class"] = s[i++].name;
        obj["shape"] = s[i++].name;
        return i;
    }

    var parseArray = function (s, obj) {
        var i = 1;

        obj.values = [];

        while (i < s.length) {
            obj["values"].push((s[i] instanceof SExp.Symbol) ? s[i].name : s[i]);
            i++;
        }
        return i;
    }


    var parsers = {
        "module": parseModule,
        "at": parseCoords,
        "descr": parseValue,
        "tags": parseIdentifier,
        "fp_text": parseText,
        "layer": parseIdentifier,
        "size": parseCoords,
        "thickness": parseValue,
        "effects": parseNone,
        "font": parseNone,
        "start": parseCoords,
        "center": parseCoords,
        "end": parseCoords,
        "width": parseValue,
        "drill": parseValue,
        "fp_line": parseNone,
        "fp_circle": parseNone,
        "pad": parsePad,
        "layers": parseArray,
        "rect_delta": parseCoords,
    };

    var multipleElements = {
        "module": ["fp_line", "fp_text", "pad", "fp_circle"]
    }


    var parsePart = function(s) {
        var type = s[0].name;

        var obj = {
            type: type
        };

        if (type in parsers) {
            var arrayStartIndex = parsers[obj.type](s, obj);

            for (var i = arrayStartIndex; i < s.length; i++) {

                if (!Array.isArray(s[i])) {
                    continue;
                }

                var inner = parsePart(s[i]);

                if (type in multipleElements && (multipleElements[type].indexOf(inner.type) > -1)) {
                    if (inner.type in obj) {
                        obj[inner.type].push(inner);
                    } else {
                        obj[inner.type] = [inner];
                    }
                } else {
                    obj[inner.type] = inner;
                }
            }
        }

        return obj;
    }

    FPS.prototype.parseFootprint = function (text)
    {
        var data = SExp.parse(text);

        var fpObj = parsePart(data);

        return fpObj;
    }

    return FPS;
});
