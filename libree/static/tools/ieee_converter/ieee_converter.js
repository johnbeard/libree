define(["../../js/ieee754", "../../js/bignumber", "../libree_tools"],
    function(IEEE754, BigNumber, Libree) {

    var updateBox = function(source, dest, value) {
        if (source != dest) {
            $("#"+dest).val(value);
        }
    };
    
    var HexLengthException = function (length) {this.length = length}
    var BinLengthException = function (length) {this.length = length}
    var IEEEModeException = function (mode) {this.mode = mode}
    
    var ieee = new IEEE754(0); // IEEE object - reuse this to take advantage of caching of expensive things inside the IEEE object
    
    var nametoBase = {"decimal":10, "binary":2, "hex":16};
    
    //decimal places needed for various precisions
    var decimalPlaces = {16:24, 32:149, 64:1074, 128:16493};
    
    var fillBoxesWithError = function(src, err) {
        updateBox(src, "hex", err);
        updateBox(src, "decimal", err);
        updateBox(src, "binary", err);
        
        $("#ieee-status").empty();
    }
    
    var updateIEEESign = function (sign) {
        
        $("#ieee-sign-value").text(sign ? "-1" : "+1");
        $("#ieee-sign-dec,#ieee-sign-hex").text(sign ? "1" : "0");
    }
    
    var updateIEEEExp = function (status, exp, expValue, bits) {
        var s;
        
        if (status === "zero" || status === "underflow" || (expValue.equals(0) === 0 && status === "normal")) {
            s = "0";
        } else if (exp.equals("Infinity")){
            s = "Infinity";
        } else {
            s = "2<sup>" + exp.toString() + "<sup>"
        }
        
        $("#ieee-exp-value").empty().append(s);
        $("#ieee-exp-dec").text(expValue.toString(10));
        $("#ieee-exp-hex").text(expValue.toString(16).toUpperCase());
    }
    
    var updateIEEEMant = function (mant, mantEncoding) {
        $("#ieee-mant-value").text(mant.toString());
        $("#ieee-mant-dec").text(mantEncoding.toString(10));
        $("#ieee-mant-hex").text(mantEncoding.toString(16));
    }
    
    var updateIEEEStatus = function (status) {
        
        var statusString;
        
        if (status == "normal")
            statusString = "Normal: this number can be shown with all available precision"
        else if (status === "denormal")
            statusString = "Denormal: this number is too small to show at full precision"
        else if (status === "underflow")
            statusString = "Underflow: this number is too small to represent in this format"
        else if (status === "zero")
            statusString = "Zero"
        else if (status === "overflow")
            statusString = "Overflow: this number is too large to represent in this format"
        else if (status === "quiet")
            statusString = "NaN (quiet)"
        else if (status === "signalling")
            statusString = "NaN (signalling)"
        else
            statusString = "Unknown"
        $("#ieee-status").text(statusString);
    }
    
    var updateIEEESuppArea = function (ieee, fromDec) {
        
        var ieeeHash = ieee.getAnalysis();
        
        updateIEEESign(ieeeHash.sign);
        updateIEEEExp(ieeeHash.status, ieeeHash.exp, ieeeHash.expValue, ieeeHash.bits);
        updateIEEEMant(ieeeHash.mant, BigNumber(ieeeHash.bin.mant, 2));
        updateIEEEStatus(ieeeHash.status);

        if (fromDec) {
            $(".ieee754-actual-values").removeClass("hidden");
            var nominal = BigNumber($('#decimal').val());
            var difference = ieeeHash.actual.minus(nominal);
        
            $("#ieee-actual-value").text(ieeeHash.actual.toString()); 
            $("#ieee-difference").text(difference.toString(10)); 
            $("#ieee-difference-prop").text((nominal.equals(0) || difference.equals(0)) ? "0" : difference.div(nominal).toP(3));
        } else {
             $(".ieee754-actual-values").addClass("hidden");
             $("#ieee-actual-value,#ieee-difference,#ieee-difference-prop").text("N/A");
        }
    }
    
    var getIEEEMode = function() {
        var mode = $('#ieee-type .btn.active').attr('id');

        if (!/^ieee754-\d+$/.test(mode))
            throw new IEEEModeException(mode);

        return parseInt(mode.match(/ieee754-(\d+)/)[1]);    
    }
    
    var getIEEERounding = function() {
        return mode = $('#rounding-mode .btn.active').attr('id');
    }
    
    //performance seems OK for 128 with the limit pre-calculation
    var precisionPerformanceWarning = function() {   
        return (getIEEEMode() > 128);
    }
    
    var getRestrictPlaces = function () {
        if (precisionPerformanceWarning())
            return $("#restrict-precision").prop("checked") ? 2000 : 0;
        else
            return 0;
    }
        
    var convertNumber = function(box) {
        var src = box.attr("id");
        var val = box.val();

        $(".number-input").removeClass("source-box").removeClass("error-box");  
        
        var bits;

        try {
            // parse inputs and throw on bad ones
            var baseIn = nametoBase[src];
            var bits = getIEEEMode();
            var rounding = getIEEERounding();
            
            var restrict = getRestrictPlaces();

            //convert a decimal to a float...
            if (src === "decimal") {
                ieee.parseDecimal(bits, $('#decimal').val(), rounding, restrict);
            } else if (src === "hex") {
                var hex = $('#hex').val();
                if (hex.length !== bits/4)
                    throw new HexLengthException(hex.length);
                
                ieee.parseHex(bits, hex, restrict);
            } else if (src === "binary") {
                var bin = $('#binary').val();
                if (bin.length !== bits)
                    throw new BinLengthException(bin.length);
                    
                ieee.parseBinary(bits, $('#binary').val(), restrict);
            }

            if (src !== "binary") {
                $('#binary').val(ieee.getBinary());
            }
            
            if (src !== "hex") {
                $('#hex').val(ieee.getHex());
            }
            
            if (src !== "decimal") {
                $("#decimal").val(ieee.getActualValue().toString(10));
            }
            
            updateIEEESuppArea(ieee, src === "decimal");
            
            box.addClass("source-box");
        } catch (err) {
            if (err instanceof BinLengthException)
                fillBoxesWithError(src, "Invalid binary length (should be " + bits + " bits, have " + $("#"+src).val().length +")");
            else if (err instanceof HexLengthException)
                fillBoxesWithError(src, "Invalid hex length (should be " + bits/4 + " hex digits, have " + $("#"+src).val().length +")");
            else {
                throw err;
                Libree.handleException(err);
            }
                
            box.addClass("error-box");
        }
    }
        
    var makeBindings = function() {
        
        $(".number-input").keyup(function(evt){
            
            //only convert on enter, if there is not preformance worry,
            // or if the DPs are restricted (i.e. no perf worry)
            if (evt.keyCode === 13 || !precisionPerformanceWarning() || getRestrictPlaces() )
                convertNumber($(evt.target));
        });
        
        $(".btn-toolbar .btn").click(function(evt){
            //turn off current selection
            var menuId = $(evt.target).parent().attr('id');
            
            $("#"+menuId+" .btn.active").button('toggle');
            
            //and now turn on the new one       
            $(evt.target).button('toggle');
            
            //make sure we have a box selected
            if ($(".source-box,.error-box").length = 0) {
                $(".number-input")[0].val('0').addClass(".source-box");
            }
            
            if (precisionPerformanceWarning()) {
                $("#precision-warning").removeClass("hidden");
                $("#decimal-places").text(decimalPlaces[getIEEEMode()]);
            } else {
                $("#precision-warning").addClass("hidden");
                convertNumber($($(".source-box,.error-box")[0]));
            } 
            
            evt.stopImmediatePropagation();
        });
    };

    $( document ).ready(function () {
        
        makeBindings();
        Libree.setupTool();
        
        $('.mode-selector > #ieee754-32').click();
        
        $('.number-input#decimal').addClass('source-box');
    });
});
