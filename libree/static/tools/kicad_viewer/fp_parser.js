define(["sexpression"], function(SExp) {

    FPS = function () {};

    FPS.prototype.getLibrariesFromFpTable = function (table, substitutions) {
        var parsed = SExp.parse(table);

        if (parsed[0].name != "fp_lib_table") {
            console.log("Unknown footprint library table format!");
            return;
        }

        var libData = parsePart(parsed);

        var libraries = [];

        for (var i = 0; i < libData.lib.length; i++) {
            var uri = libData.lib[i].uri.value;


            if (libData.lib[i].type.value === "Github") {

                for (var j = 0; j < substitutions.length; j++) {
                    uri = uri.replace("${"+substitutions[j][0]+"}", substitutions[j][1]);
                }

                libraries.push({uri: uri, name:libData.lib[i].name.value});
            }
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
        "module" : {
            "module": parseModule,
            "at": parseCoords,
            "descr": parseIdentifier,
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
            "rect_delta": parseCoords
        },
        "fp_lib_table": {
            "name": parseIdentifier,
            "type": parseIdentifier,
            "uri": parseIdentifier,
            "options": parseIdentifier,
            "descr": parseIdentifier,
            "fp_lib_table": parseNone,
            "lib": parseNone,
        }
    };

    var multipleElements = {
        "module": ["fp_line", "fp_text", "pad", "fp_circle"],
        "fp_lib_table": ["lib"]
    }


    var parsePart = function(s, topType) {
        var sexpType = s[0].name;

        var obj = {
            sexpType: sexpType
        };

        topType = topType || sexpType;

        if (sexpType in parsers[topType]) {
            var arrayStartIndex = parsers[topType][sexpType](s, obj);

            for (var i = arrayStartIndex; i < s.length; i++) {

                if (!Array.isArray(s[i])) {
                    continue;
                }

                var inner = parsePart(s[i], topType);

                if (sexpType in multipleElements && (multipleElements[sexpType].indexOf(inner.sexpType) > -1)) {
                    if (inner.sexpType in obj) {
                        obj[inner.sexpType].push(inner);
                    } else {
                        obj[inner.sexpType] = [inner];
                    }
                } else {
                    obj[inner.sexpType] = inner;
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
