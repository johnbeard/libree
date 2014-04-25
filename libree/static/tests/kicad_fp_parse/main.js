define(["qunit", "jquery", "../../tools/kicad_viewer/fp_parser.js"],
    function(Q, $, FPS) {

    var asyncTestWithData = function (file, testFn) {
        $.ajax({
            url: file,
            success: function (data) {
                testFn(data)
            },
            complete: function() {
                Q.start();
            }
        });
    }

    var runFn = function () {

        module("Parsing table");

        asyncTest( "FP table parse", function() {
            expect(1);

            asyncTestWithData("/static/tests/kicad_fp_parse/test.fp_table" , function(data) {
                var fps = new FPS();

                var libs = fps.getLibrariesFromFpTable(data);

                equal(libs[0].name, "Air_Coils_SML_NEOSID");
            });

        });

        module ("Parsing elements");

        asyncTest( "Parse footprint", function() {

            expect(7);

            asyncTestWithData("/static/tests/kicad_fp_parse/test.kicad_mod", function (data) {
                var fps = new FPS();
                var fp = fps.parseFootprint(data);

                var l = fp[0].data

                equal(l.start[0], -16.51);
                equal(l.layer, "F.SilkS");

                var p = fp[2].data

                equal(p.at[0], -11.43 );
                equal(p.at[1], 3.81);
                equal(p.layers[0], "*.Cu");
                equal(p.layers[1], "*.Mask");
                equal(p.layers[2], "F.SilkS");
            });
        });
    };

    return {
        run: runFn
    };
});
