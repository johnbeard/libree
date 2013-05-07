
define([
	"../js/svg-0.32", "../js/svg.circuit"], 
	function(SVG, CD) {

    $( document ).ready(function () {
	
	    var svg = SVG.size(600, 600);
        
        var dia = new CD(svg.doc());
        
        dia.terminal('left', 50, 50, '+5V');
        dia.terminal('right', 100, 50, '12V');
        dia.terminal('up', 100, 50, '3.3V');
        dia.terminal('down', 100, 50, 'AGND');
        dia.terminal('right', 150, 50, '12V', 'square');
        dia.resistor('left', 150, 250, '100k', ['#FF0000', '#964B00', '#FFA500', '#FFA500'])
        dia.resistor('left', 250, 250, '100k', ['#FF0000', '#964B00', '#FFA500', '#FFA500', '#FFA500'])
        dia.diode('left', 150, 100, 'led', '#FF0000');
        dia.capacitor('left', 50, 100, 'unpol');
        dia.capacitor('left', 20, 100, 'pol');
        dia.bjt('left', 100, 100, false, true);
        dia.bjt('left', 150, 150, true);
        dia.ground(50, 150, 'normal');
        dia.ground(100, 150, 'triangle');
        dia.logic('left', 200, 150, 'and', false);
        dia.logic('left', 250, 150, 'and', true);
	});
});
