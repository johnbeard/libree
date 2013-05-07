
define([
//"../../js/jquery", 
"../libree_tools", "../../js/resistors", 
"../../js/svg-0.32", "../../js/svg.circuit"], 
	function(Libree, Resistors, SVG, CD) {
        
    var VccTooLowException = function(){};
    
    var svg = SVG('result-canvas');
        
    var computeValues = function(v_cc, v_f, i_f, num) {
        
        if (v_cc < v_f)
            throw new VccTooLowException();
        
        var leds_per_series = Math.floor(v_cc / v_f);
        var num_series = Math.floor(num / leds_per_series);
        var leftover = num - (leds_per_series * num_series);
                
        return {
            "r_ser": Math.max(1,(v_cc - (leds_per_series * v_f)) / i_f),
            "r_left": Math.max(1,(v_cc - (leftover * v_f)) / i_f),
            "ser_len": leds_per_series,
            "num_ser": num_series,
            "num_left": leftover,
            'v_cc': v_cc,
        }
    }
        
    var compute = function() {
        var v_cc = parseFloat($("input#vcc").val());
        var v_f = parseFloat($("input#vf").val());
        var i_f = parseFloat($("input#if").val()) / 1000; //mA -> A
        var num = parseInt($("input#num").val());
        
        if (isNaN(v_cc) || isNaN(v_f) || isNaN(i_f) || isNaN(num))
            return;
        
        try {
            var values = computeValues(v_cc, v_f, i_f, num);
            
            drawDiagram(values, true);
        } catch(err) {
            if (err instanceof VccTooLowException)
                console.log("Supply voltage too low");
                
            else 
                throw err;
        }
    };
    
    var drawDiagram = function(values, schematic) {
        svg.clear();
        
        if (values.num_left + values.num_ser === 0) {
            svg.size(1,1);
            return;
        }
        
        var total_rows = values.num_ser + (values.num_left ? 1 : 0);

        
        var dia = new CD(svg.doc());
        
        var x = 50;
        var y = 50;
        
        var pins2;
        
        var srcPin = dia.terminal('left', x, y+(total_rows - 1)*25, values.v_cc + 'V')
            .data('pins');
            
        var longestRun;
        
        if (total_rows > 1 || values.num_left == 0) 
            longestRun = values.ser_len;
        else
            longestRun = values.num_left;
            
        var gndPin = dia.ground( 
            x + (longestRun + 2 + ((total_rows > 1) ? 0.5 : 0))*50, 
            y+(total_rows - 1)*25)
            .data('pins');
            
        svg.size(gndPin[0].x + 50, 50 + total_rows*50);
        
        for (var i = 0; i < total_rows; i++) {
            x = 100;
            
            var colour, label, num_diodes;
            
            if (i === total_rows-1 && values.num_left > 0) {
                colour = ['#FF0000', '#964B00', '#FFA500', '#FFA500'];
                label = Libree.formatUnits(values.r_left, 'Ω', 3);
                num_diodes = values.num_left;
            } else {
                colour = ['#FF0000', '#964B00', '#FFA500'];
                label = Libree.formatUnits(values.r_ser, 'Ω', 3);
                num_diodes = values.ser_len;
            }
            
            pins1 = dia.resistor('left', x, y, 
                    label, colour).data('pins');
                    
            //connect terminal to resistor
            dia.wire([srcPin[0], pins1[0]], true);
                    
            for (var j = 0; j < num_diodes; j++) {
                x += 50;
                pins2 = dia.diode('left', x, y, 'led', '#FF0000').data('pins');
                
                dia.wire([pins1[1], pins2[0]], true);
                
                pins1 = pins2;
            }
            
            //connect last diode to gnd
            dia.wire([pins2[1], 
                    {x:gndPin[0].x - ((total_rows > 1) ? 25 : 0), y:gndPin[0].y}, 
                    gndPin[0]], 
                false);
            
            y += 50;
        }
    }

    var makeBindings = function() {
        $(".number-input").keyup(function(evt){
            compute();
        });
    };

    $( document ).ready(function() {
        Libree.setupTool();
        compute(); //trigger
        makeBindings();
    });
});
