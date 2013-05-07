define(["../../js/number_convert",  "../../js/bignumber", "../libree_tools"],
    function(NumConvert, BigNumber, Libree) {

    var updateBox = function(source, dest, value) {
        if (source != dest) {
            $("#"+dest).val(value);
        }
    };
    
    var InputBaseException = function (base) {this.base = base}
    var ModeException = function (mode) {this.mode = mode}
        
    var getInputBase = function(base) {
        
        if (base === "decimal")
            return 10;
        else if (base === "hex")
            return 16;
        else if (base === "binary")
            return 2;
        
        throw new InputBaseException(base);
    }
    
    var fillBoxesWithString = function(src, err) {
        updateBox(src, "hex", err);
        updateBox(src, "decimal", err);
        updateBox(src, "binary", err);
    }

    var setupSupplementaryArea = function (id) {
        $(".supplementary-area").addClass("hidden");
        $(".supplementary-area#" + id).removeClass("hidden");
    }    
        
    var convertNumber = function(box) {
        var src = box.attr("id");
        var val = box.val();
        
        var mode = $('.mode-selector .btn.active').attr('id');
        
        $(".number-input").removeClass("source-box").removeClass("error-box");  
        
        var bits = 0;
        if (/^(un)?sign-(\d+)*$/.test(mode)){
            var vals = mode.match(/\d+/)
            bits = vals[0];
        }

        try {
            var baseIn = getInputBase(src);
            
            var result = false;
            if (mode === "arbitrary") {
                setupSupplementaryArea();
                updateBox(src, "hex", NumConvert.baseToBase(val, baseIn, 16));
                updateBox(src, "binary", NumConvert.baseToBase(val, baseIn, 2));
                updateBox(src, "decimal", NumConvert.baseToBase(val, baseIn, 10));
         
            } else if (/^unsign-(\d+)*$/.test(mode)) {
                setupSupplementaryArea("unsigned-sa");
                updateBox(src, "hex", NumConvert.unsignedFixedBaseToBase(val, bits, baseIn, 16));
                updateBox(src, "binary", NumConvert.unsignedFixedBaseToBase(val, bits, baseIn, 2));
                updateBox(src, "decimal", NumConvert.unsignedFixedBaseToBase(val, bits, baseIn, 10, false));
                
            } else if (/^sign-(\d+)*$/.test(mode)) {
                setupSupplementaryArea("signed-sa");
                if (src === "decimal") {
                    updateBox(src, "hex", NumConvert.naturalToSignedMachineBase(val, bits, baseIn, 16));
                    updateBox(src, "binary", NumConvert.naturalToSignedMachineBase(val, bits, baseIn, 2));
                } else {
                    //update decimal as natural
                    updateBox(src, "decimal", NumConvert.signedMachineToNaturalBase(val, bits, baseIn, 10));
                    
                    //and transfer the hex and binary to the other directly...
                    updateBox(src, "hex", NumConvert.unsignedFixedBaseToBase(val, bits, baseIn, 16));
                    updateBox(src, "binary", NumConvert.unsignedFixedBaseToBase(val, bits, baseIn, 2));
                    
                }
            } else {
                throw new ModeException(mode);
            }
            
            box.addClass("source-box");
        } catch (err) {
            if (err instanceof NumConvert.OutOfRangeException)
                fillBoxesWithString(src, "Out of range");
            else if (err instanceof NumConvert.InvalidIntegerException)
                fillBoxesWithString(src, "Invalid integer");
            else if (err.name == "BigNumber Error")
                fillBoxesWithString(src, "Cannot parse input as number");
            else 
                Libree.handleException(err);
                
            box.addClass("error-box");
        }
    }
        
    var makeBindings = function() {
        
        $(".number-input").keyup(function(evt){
            convertNumber($(evt.target));
        });
        
        $(".mode-selector .btn").click(function(evt){
            //turn off current selection
            $(".mode-selector .btn.active").button('toggle');
            
            //and now turn on the new one   
            $(evt.target).button('toggle');
            
            //make sure we have a box selected
            if ($(".source-box,.error-box").length = 0) {
                $(".number-input")[0].val('0').addClass(".source-box");
            }
            
            convertNumber($($(".source-box,.error-box")[0]));
            
            evt.stopImmediatePropagation();
        });
    };

    var initialSetup = function () {
        
    };

    $( document ).ready(function () {
        
        BigNumber.config({ DECIMAL_PLACES : 100})
        
        makeBindings();
        Libree.setupTool();
        initialSetup();
        
        $('.mode-selector > #arbitrary').click();
        
        $('.number-input#decimal').addClass('source-box');
    });
});
