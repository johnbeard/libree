
define(["qunit", "../js/number_convert"],
    function(Q, NumConvert) {

    return { run: function () {
		
        module("Int to int");
        
        test( "0 Dec to bin", function() {
            equal(NumConvert.intBaseToBase("0", 10, 2),
                "0"
            );
        }); 
        
        test( "F Hex to Dec", function() {
            equal(NumConvert.intBaseToBase("F", 16, 10),
                "15"
            );
        });
        
        test( "Ff Hex to Dec", function() {
            equal(NumConvert.intBaseToBase("Ff", 16, 10),
                "255"
            );
        });
        
        test( "10101 Bin to Hex", function() {
            equal(NumConvert.intBaseToBase("10101", 2, 16),
                "15"
            );
        });
        
        test( "12 Bin to Dec", function() {
            throws(function(){NumConvert.intBaseToBase("12", 2, 10)},
                "Bad digit for radix 2"
            );
        });
        
        module("Fixed unsigned machine");
        
        test( "0 Dec to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("0", 8, 10, 2),
                "00000000"
            );
        });
        
        test( "255 dec 8-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("255", 8, 10, 2),
                "11111111"
            );
        });
        
        test( "57 dec 8-bit to oct", function() {
            equal(NumConvert.unsignedFixedBaseToBase("57", 8, 10, 8),
                "071"
            );
        });
        
        test( "26 dec 8-bit to hex", function() {
            equal(NumConvert.unsignedFixedBaseToBase("26", 8, 10, 16),
                "1a"
            );
        });
        
        test( "-1 dec fails", function() {
            throws(function(){NumConvert.unsignedFixedBaseToBase("-1", 8, 10, 2);},
				"Out of range"
            );
        });
        
        test( "-A hex fails", function() {
            throws(function(){NumConvert.unsignedFixedBaseToBase("-A", 8, 16, 2);},
				"Out of range"
            );
        });
        
        test( "256 dec 8-bit fails", function() {
            throws(function(){NumConvert.unsignedFixedBaseToBase("256", 8, 10, 2);},
				"Out of range"
            );
        });
        
        test( "255 dec 16-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("255", 16, 10, 2),
                "0000000011111111"
            );
        });
        
        test( "65535 dec 16-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("65535", 16, 10, 2),
                "1111111111111111"
            );
        });
        
        test( "65536 dec 16-bit fails", function() {
            throws(function(){NumConvert.unsignedFixedBaseToBase("65536", 16, 10, 2);},
				"Out of range"
            );
        });
        
        test( "4294967295 dec 32-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("4294967295", 32, 10, 2),
                "11111111111111111111111111111111"
            );
        });
        
        test( "18446744073709551613 dec 64-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("18446744073709551613", 64, 10, 2),
                "1111111111111111111111111111111111111111111111111111111111111101"
            );
        });
        
        test( "18446744073709551615 dec 64-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("18446744073709551615", 64, 10, 2),
                "1111111111111111111111111111111111111111111111111111111111111111"
            );
        });
        
        test( "0x1FFFFFFFFFFFFFFFF dec 64-bit fails", function() {
            throws(function(){NumConvert.unsignedFixedBaseToBase("1FFFFFFFFFFFFFFFF", 64, 16, 2);},
				"Out of range"
            );
        });
        
        test( "0xFFFFFFFFFFFFFFFF hex 64-bit to bin", function() {
            equal(NumConvert.unsignedFixedBaseToBase("FFFFFFFFFFFFFFFF", 64, 16, 2),
                "1111111111111111111111111111111111111111111111111111111111111111"
            );
        });
        
        test( "0x11 hex 64-bit to bin, no padding", function() {
            equal(NumConvert.unsignedFixedBaseToBase("A", 64, 16, 10, false),
                "10"
            );
        });
        
        module("Natural to signed machine");
        
        test( "0 Dec to bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("0", 8, 10, 2),
                "00000000"
            );
        });
        
        test( "-1 Dec to 8-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("-1", 8, 10, 2),
                "11111111"
            );
        });
        
        test( "-2 Dec to 8-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("-2", 8, 10, 2),
                "11111110"
            );
        });
        
        test( "-127 Dec to 8-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("-127", 8, 10, 2),
                "10000001"
            );
        });
        
        test( "-128 Dec to 8-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("-128", 8, 10, 2),
                "10000000"
            );
        });
        
        test( "-1 Dec to 16-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("-1", 16, 10, 2),
                "1111111111111111"
            );
        });
        
        test( "1 Dec to 16-bit bin", function() {
            equal(NumConvert.naturalToSignedMachineBase("1", 16, 10, 2),
                "0000000000000001"
            );
        });
        
        test( "10 Dec to 16-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("10", 16, 10, 16),
                "000a"
            );
        });
        
        test( "FFFF Hex to 16-bit hex fails", function() {
            throws(function(){NumConvert.naturalToSignedMachineBase("FFFF", 16, 16, 2);},
				"Out of range"
            );
        });
        
        test( "-7FFF hex to 16-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("-7FFF", 16, 16, 16),
                "8001"
            );
        });
        
        test( "-8000 hex to 16-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("-8000", 16, 16, 16),
                "8000"
            );
        });
        
        test( "-10000 Hex to 16-bit hex fails", function() {
            throws(function(){NumConvert.naturalToSignedMachineBase("-10000", 16, 16, 2);},
				"Out of range"
            );
        });

        test( "9223372036854775807 dec to 64-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("9223372036854775807", 64, 10, 16),
                "7fffffffffffffff"
            );
        });
        
        test( "-9223372036854775808 dec to 64-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("-9223372036854775808", 64, 10, 16),
                "8000000000000000"
            );
        });
        
        test( "-1 dec to 64-bit hex", function() {
            equal(NumConvert.naturalToSignedMachineBase("-1", 64, 10, 16),
                "ffffffffffffffff"
            );
        });
        
        
        module("Signed machine to natural");
        
        test( "0 bin to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("00000000", 8, 2, 10),
                "0"
            );
        });
        
        test( "00000001 bin 8-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("00000001", 8, 2, 10),
                "1"
            );
        });
        
        test( "11111111 bin 8-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("11111111", 8, 2, 10),
                "-1"
            );
        });
        
        test( "11111110 bin 8-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("11111110", 8, 2, 10),
                "-2"
            );
        });
        
        test( "10000000 bin 8-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("10000000", 8, 2, 10),
                "-128"
            );
        });
        
        test( "80 hex 8-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("80", 8, 16, 10),
                "-128"
            );
        });
        
        test( "1000000000000000000000000000000000000000000000000000000000000000 bin 64-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("1000000000000000000000000000000000000000000000000000000000000000", 64, 2, 10),
                "-9223372036854775808"
            );
        });
        
        test( "1111111111111111111111111111111111111111111111111111111111111111 bin 64-bit to dec", function() {
            equal(NumConvert.signedMachineToNaturalBase("1111111111111111111111111111111111111111111111111111111111111111", 64, 2, 10),
                "-1"
            );
        });
        
                
        test( "negative anything fails", function() {
            throws(function(){NumConvert.signedMachineToNaturalBase("-1", 16, 16, 2);},
				"Out of range"
            );
        });
        
        test( "longer than bits allow fails", function() {
            throws(function(){NumConvert.signedMachineToNaturalBase("111111111", 8, 2, 10);},
				"Out of range"
            );
        });
        
        test( "missing leading 0's is OK", function() {
            equal(NumConvert.signedMachineToNaturalBase("1", 8, 2, 10),
                "1"
            );
        });
    }};
});
