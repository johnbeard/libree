
define(["../libree_tools"], function(Libree) {

    function SMDValueParsingException() {}
    var renderResult = function(val, sf, tol) {

        result = Libree.formatUnits(val, 'Ω', sf);

        if (tol != null)
            result += ", " + tol;

        $('#resistor-value').text(result);
    }
    
    var eia96Values = [
        100,102,105,107,110,113,115,118,
        121,124,127,130,133,137,140,143,
        147,150,154,158,162,165,169,174,
        178,182,187,191,196,200,205,210,
        215,221,226,232,237,243,249,255,
        261,267,274,280,287,294,301,309,
        316,324,332,340,348,357,365,374,
        383,392,402,412,422,432,442,453,
        464,475,487,499,511,523,536,549,
        562,576,590,604,619,634,649,665,
        681,698,715,732,750,768,787,806,
        825,845,866,887,909,931,953,976];
        
    // Throws SMDValueParsingException if the code cannot be parsed
    var parseVal = function(code, line) {
        
        var val, tol;
        var length = code.length;
        var currentSensing;
        
        if (!code.length)
            throw new SMDValueParsingException();
        
        // FIRST: VALIDATE IF THE LINE MAKES SENSE
        
        // long line above is only valid for certain types
        if (line === "longlineabove") {
            if (/^[\dRrRmM]{3,4}$/.test(code))
                currentSensing = true;
            else  
                throw new SMDValueParsingException();
        } else {
            currentSensing = false;
        }
        
        //short line is only valid for 3 digit numbers
        if (line === "shortline" || line === "longlinebelow") {
            if (!/^\d{3}$/.test(code))
                throw new SMDValueParsingException();
        }
        
        // SECOND: PARSE THE CODE

        if (/^0+$/.test(code)) { //any number of zeroes
            val = 0;
            sf = 1;
        // R and M codes can be 3 or 4
        } else if ((length == 3 || length === 4) && /^\d*R\d*$/.test(code)) { // R notation
            var vals = code.match(/^(\d*)R(\d*)$/)
            val =  vals[1].length ? parseInt(vals[1]) : 0;
            val += vals[2].length ? (parseInt(vals[2]) / Math.pow(10, vals[2].length)) : 0;

            sf = 3;
        } else if ((length == 3 || length === 4) && /^\d*[Mm]\d*$/.test(code)) { // M notation
            var vals = code.match(/^(\d*)[Mm](\d*)$/)
            val =  vals[1].length ? parseInt(vals[1]) : 0;
            val += vals[2].length ? (parseInt(vals[2]) / Math.pow(10, vals[2].length)) : 0;

            val /= 1000; //value in mohms

            sf = 3;
        } else if (/^\d{3,4}$/.test(code)) {

            if (line === "longlinebelow") { //this means everything comes after an implied decimal
                val = parseFloat("0." + code);
                sf = 3;
            } else {
                var mantissa = parseInt(code.substring(0,length-1));
                
                if (!mantissa) {
                    throw new SMDValueParsingException();
                } else {
                    val = mantissa * Math.pow(10, code[length-1]); 
                    sf = (length > 3) ? 3 : 2;
                }
                
                if (line === "shortline" || length === 4) {
                    tol = "≤1%";
                } else if (length === 3) {
                    tol = "5%";
                }
            }
            
        } else if (/^\d{2}[ZYXSABHCDEF]$/.test(code)) {
                
            var index = parseInt(code.substring(0,2));
            
            //only 1-96 are defined
            if (index > 0 && index < 97) {
                var alpha = code[2];
                sf = 3;
                val = eia96Values[parseInt(code.substring(0,2))-1];
                mult = null;

                if (alpha === 'Z')
                    mult = 0.001;
                else if (alpha == 'Y') //covered R already,we don't count that as   
                    mult = 0.01;
                else if (alpha == 'X' || alpha == 'S')
                    mult = 0.1;
                else if (alpha == 'A')
                    mult = 1;
                else if (alpha == 'B' || alpha == 'H')
                    mult = 10;
                else if (alpha == 'C')
                    mult = 100;
                else if (alpha == 'D')
                    mult = 1000;
                else if (alpha == 'E')
                    mult = 10000;
                else if (alpha == 'F')
                    mult = 100000;

                if (mult !== null) {
                    val = val * mult;
                    tol = "≤1%";
                }
            }
        } else { //what is this?
            throw new SMDValueParsingException();
        }
        
        return { 'value': val, 'tol': tol, 'sf':sf, 'currentSensing': currentSensing};
    }

    var recomputeValue = function(code, line) {
        
        try {
            
            var val = parseVal(code, line);
            
            $("#value-note").empty();
            renderResult(val.value, val.sf, val.tol);
            
            if (val.currentSensing) {
                $("#value-note").text("(current sensing)");
            }
            
        } catch (err) {
            
            if (err instanceof SMDValueParsingException) {
                $("#value-note").empty();
                $('#resistor-value').text("Unknown SMD code");
            }
        }
    }
    
    var getCodeAndCompute = function () {
        var val = $('#code-input').val();

        if (val.length > 0)
            val = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0,4);
            
        var line = $("#line-select .btn.active").attr("id");
        
        $('#code-input').val(val);
        
        if (line != "noline") {
            var width = (line == "shortline") ? 20 : 70;
            
            var top = (line == "longlineabove");
            
            $("#line")
                .removeClass("hidden")
                .css({
                    'top' : top ? "10px" : "55px",
                    'width': width + "px",
                    'left' : (140 - width)/2,
                });
        } else {
            $("#line").addClass("hidden");
        }
        
        
            
        recomputeValue(val, line);
    }

    var makeBindings = function() {

        $("#hint-text")
            .hover( function(evt) {
                $('#code-container').toggleClass('help-highlight');
            });

        $("#hint-value")
            .hover( function(evt) {
                $('#resistor-value').toggleClass('help-highlight');
            });
          
        $('#code-input').keyup( function () {
            getCodeAndCompute()
        });
        
        $("#line-select .btn").click( function (evt) {  
            //turn off any current selection
            $("#line-select .btn.active").button('toggle');
            
            //and now turn on the new one   
            $(evt.target).button('toggle');
            
            getCodeAndCompute();
            evt.stopImmediatePropagation();
        });
    }

    $( document ).ready(function() {
        getCodeAndCompute(); //trigger
        makeBindings();
        Libree.setupTool();
    });
});
