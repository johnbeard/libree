define(["jquery", "../../js/sexp/parse"], function($, SExpParse) {

    FPS = function () {};

    FPS.prototype.getLibrariesFromFpTable = function (table) {
        var parsed = SExpParse(table);

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

    FPS.prototype.parseElement = function (elem, e) {

        for (var i = 0; i < elem.length; i++) {

            if (!Array.isArray(elem[i]))
                continue;

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

    return FPS;
});
