define(["qunit", "../tools/kicad_viewer/fp_parser", "../js/sexp/parse"],
    function(Q, FPS, SEP) {

    return { run: function () {

        var table = '(fp_lib_table\n\
  (lib (name Air_Coils_SML_NEOSID)(type Github)(uri ${KIGITHUB}/Air_Coils_SML_NEOSID.pretty)(options "")(descr HAMxx31A_HDMxx31A))\n\
  (lib (name Buzzers_Beepers)(type Github)(uri ${KIGITHUB}/Buzzers_Beepers.pretty)(options "")(descr "The way you like them."))\n\
)'

        module("Parsing table");

        test( "FP table parse", function() {
            var fps = new FPS();

            libs = fps.getLibrariesFromFpTable(table);

            equal(libs[0].name, "Air_Coils_SML_NEOSID");
        });

        module ("Parsing elements");

        test( "Parse fp_line", function() {
            var fps = new FPS();
            var line = SEP("(fp_line (start -2.032 -4.445) (end -1.651 -4.572) (layer F.SilkS) (width 0.254))");

            l = fps.parseElement(line, {}, 1);

            equal(l.start[0], -2.032);
            equal(l.layer, "F.SilkS");
        });

        test( "Parse pad", function() {
            var fps = new FPS();
            var line = SEP("(pad 1 thru_hole rect (at 0 2.54) (size 1.99898 1.99898) (drill 0.8001) (layers *.Cu *.Mask F.SilkS))");

            l = fps.parseElement(line, {}, 4);

            equal(l.at[0], 0);
            equal(l.at[1], 2.54);
            equal(l.layers[0], "*.Cu");
        });

    }};
});
