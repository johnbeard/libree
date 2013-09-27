

define(function () {

    var Libree = function () {};
    
    Libree.static = "/static"; //FIXME - get this out of this static!

    Libree.setupTool = function () {
        var me = this;
        if ($('#help-container').length > 0) {
            $('.help-button-container img')
                .removeClass('hidden')
                .on('click', function(evt) {
                    me.toggleHelp();
                });

            $('.help-close-container').click( function() {
                me.hideHelp();
            });
            
            $('.help-hint')
                .mouseenter( function() {
                    $('#' + $(this).data("target")).addClass('help-highlight');
                    $('.' + $(this).data("target")).addClass('help-highlight');
                })
                .mouseleave( function() {
                    $('#' + $(this).data("target")).removeClass('help-highlight');
                    $('.' + $(this).data("target")).removeClass('help-highlight');
                });
        }
    }

    Libree.hideHelp = function(){
        $( "#help-container" ).addClass('hidden');
    }

    Libree.toggleHelp = function(){
        $( "#help-container" ).toggleClass('hidden');
    }
    
    Libree.handleException = function(e){
        console.log(e.message) 
    }

    Libree.sigFigs = function(x, sig) {
        if (x == 0)
            return 0;

        var mult = Math.pow(10, sig - Math.floor(Math.log(x) / Math.LN10) - 1);
        return Math.round(x * mult) / mult;
    }

    Libree.formatUnits = function(val, unit, sf) {
        var result = -1;
        var prefix = '';

        if (val == 0) {
            result = 0;
        } else if (val < 1e-3) {
            result = (val * 1e6)
            prefix = 'u';
        } else if (val < 1) {
            result = (val * 1e3)
            prefix = 'm';
        } else if (val < 1e3) {
            result =  val ;
        } else if (val < 1e6) {
            result =  (val / 1e3)
            prefix = 'k';
        } else  if (val < 1e9) {
            result =  (val / 1e6)
            prefix = 'M';
        } else if (val < 1e12) {
            result = (val / 1e9);
            prefix = 'G';
        } else if (val < 1e15) {
            result =  (val / 1e12);
            prefix = 'T';
        } else if (val < 1e18) {
            result = (val / 1e15);
            prefix = 'P';
        }

        if (sf != null)
            result = Libree.sigFigs(result, sf);

        return result + ' ' + prefix + unit; //hair space!

    }
    
    // TODO make this a jQuery plugin or something?
    Libree.doneTyping = function(elem, timer, timeout, cb){
        
        var timerSet = function (timeout) {
            clearTimeout(timer);
            if ($(elem).val) {
                timer = setTimeout(cb, timeout);
            }
        };
        
        $(elem).on('paste', function(e){
            timerSet(timeout);
        })
        .on('keyup', function(e) { 
            // on enter go at once
            if (e.which == 13) {
                timerSet(0);
            } else {
                timerSet(timeout); 
            }              
        });
    }
    
    Libree.setupToggleButton = function(groupSelector, cb, initialId) {
        $(groupSelector + " .btn").click( function (evt) {  
            //turn off any current selection
            $(groupSelector + " .btn").removeClass('active')
            
            //and now turn on the new one   
            $(evt.target).addClass('active');
            
            cb($(evt.target).attr('id'));
            evt.stopImmediatePropagation();
        });
    }
    
    // very basic routing to uppercase the first letter of words
    Libree.toTitleCase = function (str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    
    Libree.pluralise = function(singular, num, suffix) {
        return (num > 1) ? (singular + ((typeof suffix !== 'undefined') ? suffix : 's')) : singular;
    }
    
    //construct one of:
    //  The <descriptor> root
    //  Each of the <descriptor> <singular><"s"|suffix>
    Libree.pluralEach = function(singular, num, descriptor, suffix) {
        return ((num > 1) ? ("Each of the " + num) : "The")
            + (descriptor ? (" " + descriptor + " ") : " ")
            + Libree.pluralise(singular, num, suffix);
    }
    
    //does the browser support the File element?
    Libree.supportsFile = function() {
        return window.File && window.FileReader && window.FileList && window.Blob;
    }
    
    Libree.flagInputValidity = function(sel, valid) {
        $(sel).toggleClass('error-box', !valid);
    }
    
    Libree.checkParseErrors = function(vals, cb) {
        var err = false;
        
        for (var i = 0; i < vals.length; i++) {
            if (vals[i][0] === null) {
                cb(vals[i][1]);
                err = true;
            }
        }
        
        return err;
    }
    
    Libree.validateInput = function(inputSelector, validator) {
        try {
            var x =  validator($(inputSelector).val());
            Libree.flagInputValidity(inputSelector, true);
            return x;
        } catch (err) {
            if (err instanceof RangeError) {
                Libree.flagInputValidity(inputSelector, false);
                return null;
            }
        }
    }
    
    var validators = {
        number: /^[+\-]?[0-9]*\.?[0-9]*([eE][0-9]*\.?[0-9]*)?$/
    }
    
    Libree.validatorNumber = function(int, min, max) {
        return function(input) {
            if (!validators.number.test(input))
                throw new RangeError();
            
            //so it looks like an integer, make it one
            var x = parseFloat(input);
            
            if(typeof max === "undefined") { max = Infinity; }
            if(typeof min === "undefined") { min = -Infinity; }
            
            if ((int && (x % 1 != 0)) || isNaN(x) || x < min || x > max
                || ((min === 'e' || max === 'e') && x === 0)) //filter zero floats
                throw new RangeError();
                
            return x;
        };
    }

    return Libree;
});
