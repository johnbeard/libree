
define(["qunit",
    "../tools/libree_tools",
    "../js/ltc"
    ],
    function(Q, Libree, LTC) {

    return { run: function() {

        module("24");
        
        test( "A0000000000000003FFD", function() {
            
            var ltc = LTC.decode(Libree.hexToBinary("A0000000000000003FFD"), 24);
            
            Q.equal(ltc.syncPattern, 0x3FFD);
            Q.equal(ltc.frame, 5);
            Q.equal(ltc.sec, 0);
            Q.equal(ltc.min, 0);
            Q.equal(ltc.hr, 0);
        });
        /*
         * this test doesn't really make sense as there are invalid
         * combinations
        test( "Fuzz test", function() {
            
            for (var i = 0; i < 2; i += 1) {
                
                var bin = '';
                var fps = 24;
                
                for (var j = 0; j < 10; j += 1) {
                    bin += Math.floor(Math.random()*256).toString(2).leftPad(8, '0');
                }
            
                var ltc = LTC.decode(bin, fps);
                
                var roundTrip = LTC.encode(ltc.parityBit, ltc.dropFrame, ltc.colourFrame, ltc.reservedBit, 
                    ltc.hr, ltc.min, ltc.sec, ltc.frame, ltc.userbits, ltc.binaryGroup, ltc.syncPattern, fps);
                    
                Q.equal(bin, roundTrip);
            }
        });*/
    }};

});
