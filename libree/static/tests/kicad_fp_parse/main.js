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

            expect(8);

            asyncTestWithData("/static/tests/kicad_fp_parse/test.kicad_mod", function (data) {
                var fps = new FPS();
                var fp = fps.parseFootprint(data);

                var t = fp["fp_text"][0];

                equal(t.class, "reference");
                equal(t.text, "U***");
                equal(t.at.x, -11.43);

                var p = fp["pad"][0];

                equal(p.shape, "rect");
                equal(p.at.y, 3.81);
                equal(p.layers.values[0], "*.Cu");

                var l = fp["fp_line"][0];

                equal(l.start.x, -16.51);
                equal(l.layer.value, "F.SilkS");

            });
        });
    };

    return {
        run: runFn
    };
});
