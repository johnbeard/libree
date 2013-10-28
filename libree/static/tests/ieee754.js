
define(["qunit", "../js/ieee754"],
    function(Q, IEEE754) {

    return { run: function () {
		
        module("Parsing binary");
        
        test( "Non-binary chars", function() {
            var ieee = new IEEE754;
            throws(function(){ieee.parseBinary(32, "a");},
                ieee.ParseException,
				"Invalid IEEE754"
            );
        });
        
        test( "Too many bits", function() {
            var ieee = new IEEE754;
            throws(function(){ieee.parseBinary(32, "000000000000000000000000000000001");},
                ieee.BitLengthException,
				"Invalid IEEE754"
            );
        });
        
        test( "Invalid bit length", function() {
            var ieee = new IEEE754;
            throws(function(){ieee.parseBinary(33, "000000000000000000000000000000001");},
                ieee.BitLengthException,
				"Invalid IEEE754"
            );
        });
        
        module("Parsing hex");
        test( "Non-hex chars", function() {
            var ieee = new IEEE754;
            throws(function(){ieee.parseBinary(32, "233334H001");},
                ieee.ParseException,
				"Invalid IEEE754"
            );
        });
        
        
        module("Status recognition");
        
        test( "Null string -> 0", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, ""),
                "zero"
            );
        });
        
        test( "Zero string -> 0", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "00000000000000000000000000000000"),
                "zero"
            );
        });
        
        test( "sign zero string -> 0", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "10000000000000000000000000000000"),
                "zero"
            );
        });
        
        test( "0x10000000 is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "00010000000000000000000000000000"),
                "normal"
            );
        });
        
        test( "0x00000001 is denormal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "00000000000000000000000000000001"),
                "denormal"
            );
        });
        
        test( "0x7F800000 is inf", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "01111111100000000000000000000000"),
                "overflow"
            );
        });
        
        test( "0x7FC00000 is quiet", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "01111111110000000000000000000000"),
                "quiet"
            );
        });
        
        test( "0x7FC00001 is quiet", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "01111111110000000000000000000001"),
                "quiet"
            );
        });
        
        test( "0x7F800001 is signalling", function() {
            var ieee = new IEEE754;
            equal(ieee.parseBinary(32, "01111111100000000000000000000001"),
                "signalling"
            );
        });
        
        module("Binary - decimal conversion");
        
        test( "Zero string -> 0", function() {
            var ieee = new IEEE754;
            ieee.parseBinary(32, "00000000000000000000000000000000")
            
            equal(ieee.getActualValue(), "0");
        });
        
        test( "Minimum 32-bit denormal", function() {
            var ieee = new IEEE754;
            ieee.parseBinary(32, "00000000000000000000000000000001")

            equal(ieee.getActualValue().toString(), "1.40129846432481707092372958328991613128026194187651577175706828388979108268586060148663818836212158203125e-45");
        });
        
        test( "Minimum 64-bit denormal", function() {
            var ieee = new IEEE754;
            ieee.parseBinary(64, "0000000000000000000000000000000000000000000000000000000000000001")
            
            equal(ieee.getActualValue().toString(), "4.940656458412465441765687928682213723650598026143247644255856825006755072702087518652998363616359923797965646954457177309266567103559397963987747960107818781263007131903114045278458171678489821036887186360569987307230500063874091535649843873124733972731696151400317153853980741262385655911710266585566867681870395603106249319452715914924553293054565444011274801297099995419319894090804165633245247571478690147267801593552386115501348035264934720193790268107107491703332226844753335720832431936092382893458368060106011506169809753078342277318329247904982524730776375927247874656084778203734469699533647017972677717585125660551199131504891101451037862738167250955837389733598993664809941164205702637090279242767544565229087538682506419718265533447265625e-324");
        });
        
        test( "Maximum 32-bit denormal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(32, "007fffff")
            
            equal(ieee.getActualValue().toString(), "1.175494210692441075487029444849287348827052428745893333857174530571588870475618904265502351336181163787841796875e-38");
        });
        
        test( "Maximum 64-bit denormal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(64, "000fffffffffffff")
            
            equal(ieee.getActualValue().toString(), "2.2250738585072008890245868760858598876504231122409594654935248025624400092282356951787758888037591552642309780950434312085877387158357291821993020294379224223559819827501242041788969571311791082261043971979604000454897391938079198936081525613113376149842043271751033627391549782731594143828136275113838604094249464942286316695429105080201815926642134996606517803095075913058719846423906068637102005108723282784678843631944515866135041223479014792369585208321597621066375401613736583044193603714778355306682834535634005074073040135602968046375918583163124224521599262546494300836851861719422417646455137135420132217031370496583210154654068035397417906022589503023501937519773030945763173210852507299305089761582519159720757232455434770912461317493580281734466552734375e-308");
        });
        
        test( "Minimum 32-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(32, "00800000")

            equal(ieee.getActualValue().toString(), "1.1754943508222875079687365372222456778186655567720875215087517062784172594547271728515625e-38");
        });
        
        test( "Minimum 64-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(64, "0010000000000000")

            equal(ieee.getActualValue().toString(), "2.225073858507201383090232717332404064219215980462331830553327416887204434813918195854283159012511020564067339731035811005152434161553460108856012385377718821130777993532002330479610147442583636071921565046942503734208375250806650616658158948720491179968591639648500635908770118304874799780887753749949451580451605050915399856582470818645113537935804992115981085766051992433352114352390148795699609591288891602992641511063466313393663477586513029371762047325631781485664350872122828637642044846811407613911477062801689853244110024161447421618567166150540154285084716752901903161322778896729707373123334086988983175067838846926092773977972858659654941091369095406136467568702398678315290680984617210924625396728515625e-308");
        });
        
        test( "Maximum 32-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseBinary(32, "01111111011111111111111111111111")

            equal(ieee.getActualValue().toString(), "3.4028234663852885981170418348451692544e+38");
        });
        
        test( "Maximum 64-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseBinary(64, "0111111111101111111111111111111111111111111111111111111111111111")

            equal(ieee.getActualValue().toString(), "1.79769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368e+308");
        });
        
        test( "1 32-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(32, "3f800000")

            equal(ieee.getActualValue().toString(), "1");
        });
        
        test( "2 32-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(32, "40000000")

            equal(ieee.getActualValue().toString(), "2");
        });
        
        test( "1 64-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(64, "3ff0000000000000")

            equal(ieee.getActualValue().toString(), "1");
        });
        
        test( "2 64-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(64, "4000000000000000")

            equal(ieee.getActualValue().toString(), "2");
        });
        
        test( "0.125 32-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(32, "3E000000")

            equal(ieee.getActualValue().toString(), "0.125");
        });
        
        test( "0.125 64-bit normal", function() {
            var ieee = new IEEE754;
            ieee.parseHex(64, "3fc0000000000000")

            equal(ieee.getActualValue().toString(), "0.125");
        });
        
        module("Decimal - binary conversion (32 bit)");
        
        test( "0 as 32-bit is zero", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "0"), "zero");
            equal(ieee.getBinary(), "00000000000000000000000000000000");
        });
        
        test( "-0 as 32-bit is zero", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "-0"), "zero");
            equal(ieee.getHex(), "00000000");
        });
        
        test( "1 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1"), "normal");
            equal(ieee.getBinary(), "00111111100000000000000000000000");
        });
        
        test( "+/-1.000000000001 as 32-bit is normal with rounding", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1.000000000001", "tozero"), "normal");
            equal(ieee.getHex(), "3F800000");
        
            equal(ieee.parseDecimal(32, "1.000000000001", "down"), "normal");
            equal(ieee.getHex(), "3F800000");
            
            equal(ieee.parseDecimal(32, "1.000000000001", "up"), "normal");
            equal(ieee.getHex(), "3F800001");
            
            equal(ieee.parseDecimal(32, "1.000000000001", "neareven"), "normal");
            equal(ieee.getHex(), "3F800000");
            
            equal(ieee.parseDecimal(32, "-1.000000000001", "tozero"), "normal");
            equal(ieee.getHex(), "BF800000");
        
            equal(ieee.parseDecimal(32, "-1.000000000001", "down"), "normal");
            equal(ieee.getHex(), "BF800001");
            
            equal(ieee.parseDecimal(32, "-1.000000000001", "up"), "normal");
            equal(ieee.getHex(), "BF800000");
            
            equal(ieee.parseDecimal(32, "-1.000000000001", "neareven"), "normal");
            equal(ieee.getHex(), "BF800000");
        });
        
        test( "1+ 2^-24 as 32-bit is normal with rounding (ties)", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1.000000059604644775390625", "tozero"), "normal");
            equal(ieee.getHex(), "3F800000");
        
            equal(ieee.parseDecimal(32, "1.000000059604644775390625", "up"), "normal");
            equal(ieee.getHex(), "3F800001");
            
            equal(ieee.parseDecimal(32, "1.000000059604644775390625", "down"), "normal");
            equal(ieee.getHex(), "3F800000");
            
            equal(ieee.parseDecimal(32, "1.000000059604644775390625", "neareven"), "normal");
            equal(ieee.getHex(), "3F800000");
            
            equal(ieee.parseDecimal(32, "1.000000059604644775390625", "nearafz"), "normal");
            equal(ieee.getHex(), "3F800001");
            
            equal(ieee.parseDecimal(32, "-1.000000059604644775390625", "tozero"), "normal");
            equal(ieee.getHex(), "BF800000");
        
            equal(ieee.parseDecimal(32, "-1.000000059604644775390625", "up"), "normal");
            equal(ieee.getHex(), "BF800000");
            
            equal(ieee.parseDecimal(32, "-1.000000059604644775390625", "down"), "normal");
            equal(ieee.getHex(), "BF800001");
            
            equal(ieee.parseDecimal(32, "-1.000000059604644775390625", "neareven"), "normal");
            equal(ieee.getHex(), "BF800000");
            
            equal(ieee.parseDecimal(32, "-1.000000059604644775390625", "nearafz"), "normal");
            equal(ieee.getHex(), "BF800001");
        });
        
        test( "0.5 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "0.5"), "normal");
            equal(ieee.getBinary(), "00111111000000000000000000000000");
        });
        
        test( "0.75 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "0.75"), "normal");
            equal(ieee.getHex(), "3F400000");
        });    
        
        test( "0.125 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "0.125"), "normal");
            equal(ieee.getHex(), "3E000000");
        }); 
        
        test( "-1.75 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "-1.75"), "normal");
            equal(ieee.getHex(), "BFE00000");
        });
        
        test( "1.3 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1.3"), "normal");
            equal(ieee.getHex(), "3FA66666");
        });
        
        test( "1332.43543 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1332.43543"), "normal");
            equal(ieee.getHex(), "44A68DEF");
        });
        
        test( "435453454564564564566456756757 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "435453454564564564566456756757"), "normal");
            equal(ieee.getHex(), "70AFE0D4");

            equal(ieee.parseDecimal(32, "-435453454564564564566456756757"), "normal");
            equal(ieee.getHex(), "F0AFE0D4");

            equal(ieee.parseDecimal(32, "-435453454564564564566456756757", "down"), "normal");
            equal(ieee.getHex(), "F0AFE0D5");

            equal(ieee.parseDecimal(32, "435453454564564564566456756757", "up"), "normal");
            equal(ieee.getHex(), "70AFE0D5");
        }); 
        
        test( "4 as 32-bit is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "4"), "normal");
            equal(ieee.getHex(), "40800000");
        });
        
        test( "1e39 as 32-bit overflows", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1e39"), "overflow");
            equal(ieee.getHex(), "7F800000");
        });  
        
        test( "-1e39 as 32-bit overflows", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "-1e39"), "overflow");
            equal(ieee.getHex(), "FF800000");
        });  
        
        test( "1e-39 as 32-bit is denormal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1e-39"), "denormal");
            equal(ieee.getHex(), "000AE397");
        }); 
        
        test( "1.1754942E-38 as 32-bit is max denormal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1.1754942E-38", "up"), "denormal");
            equal(ieee.getHex(), "007FFFFF");
        }); 
        
        test( "0.00000000000000000000000000000000000000000367 as 32-bit is denormal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "0.00000000000000000000000000000000000000000367"), "denormal");
            equal(ieee.getHex(), "00000A3A");
        });  
         
        test( "1e-46 as 32-bit underflows", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(32, "1e-46"), "underflow");
            equal(ieee.getHex(), "00000000");
        }); 
        
        module("Decimal - binary conversion (64 bit)");
        
        test( "0 is zero", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(64, "0"), "zero");
            equal(ieee.getHex(), "0000000000000000");
            
            equal(ieee.parseDecimal(64, "-0"), "zero");
            equal(ieee.getHex(), "0000000000000000");
        });
        
        test( "1,2 is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(64, "1"), "normal");
            equal(ieee.getHex(), "3FF0000000000000");
            
            equal(ieee.parseDecimal(64, "-1"), "normal");
            equal(ieee.getHex(), "BFF0000000000000");
          
            equal(ieee.parseDecimal(64, "2"), "normal");
            equal(ieee.getHex(), "4000000000000000");
            
            equal(ieee.parseDecimal(64, "-2"), "normal");
            equal(ieee.getHex(), "C000000000000000");
        });
        
        test( "0.5, 1.75 is normal", function() {
            var ieee = new IEEE754;
            equal(ieee.parseDecimal(64, "0.5"), "normal");
            equal(ieee.getHex(), "3FE0000000000000");
            
            equal(ieee.parseDecimal(64, "-0.5"), "normal");
            equal(ieee.getHex(), "BFE0000000000000");
          
            equal(ieee.parseDecimal(64, "1.75"), "normal");
            equal(ieee.getHex(), "3FFC000000000000");
        });
 
    }};
});
