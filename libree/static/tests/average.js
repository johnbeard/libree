
define(["qunit",
    "../tools/libree_tools",
    "../js/average"
    ],
    function(Q, Libree, Avg) {

    return { run: function() {

        module("Arithmetic mean");

        var smallInts = Array(1,2,4,6,8,9);
        var largeInts = Array(10000000,20000000,40000000,60000000,80000000,90000000);
        var hugeInts = Array(1000000000000000000000,2000000000000000000000,
            4000000000000000000000,6000000000000000000000,
            8000000000000000000000,9000000000000000000000);

        test( "small ints", function() {

            Q.equal(Avg.arithmeticMean(smallInts), 5);
        });

        test( "Large ints", function() {
            Q.equal(Avg.arithmeticMean(largeInts), 50000000);
        });
        /*test( "Huge ints", function() {
            Q.equal(Avg.arithmeticMean(hugeInts), 5000000000000000000000);
        });*/

        module("Geometric mean");

        test( "small ints", function() {
            Q.equal(Avg.geometricMean([]), null);
            Q.equal(Avg.geometricMean([1,-2]), null);

            //Q.equal(Avg.geometricMean(smallInts), 3.88832259448);
        });

        module("Harmonic mean");

        test( "small ints", function() {
            Q.equal(Avg.harmonicMean([]), null);
            Q.equal(Avg.harmonicMean([1,-2]), null);
            Q.equal(Avg.harmonicMean([1,1]), 1);
            Q.equal(Avg.harmonicMean([1, 2]), 4/3);
        });

        module("Median");

        test( "small ints", function() {
            Q.equal(Avg.median([]), null);
            Q.equal(Avg.median([1]), 1);
            Q.equal(Avg.median([1,2]), 1.5);

            Q.equal(Avg.median([1,2,3]), 2);
            Q.equal(Avg.median([3,2,1]), 2);
            Q.equal(Avg.median([1,3,2]), 2);

            Q.equal(Avg.median([1,2,3,4]), 2.5);

            Q.equal(Avg.median([6, 7, 8, 12]), 7.5);
        });

        module("Mode");

        test( "small ints", function() {
            Q.equal(Avg.mode([]), null);
            Q.equal(Avg.mode([1,2,3]), null);
            Q.equal(Avg.mode([3,3,1]), 3);
            Q.equal(Avg.mode([3,3,4,4]), 3);
        });

    }};

});
