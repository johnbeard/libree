

define(['jquery'], function ($) {

    var Libree = function () {};
    
    //add string trim prototype
    if(typeof(String.prototype.trim) === "undefined") {
        String.prototype.trim = function() {
            return String(this).replace(/^\s+|\s+$/g, '');
        };
    }
    
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
    Libree.doneTyping = function(elem, timer, timeout, cb, event){
        
        event = event || 'keyup';
        
        var timerSet = function (timeout) {
            clearTimeout(timer);
            if ($(elem).val) {
                timer = setTimeout(cb, timeout);
            }
        };
        
        $(elem).on('paste', function(e){
            timerSet(timeout);
        })
        .on(event, function(e) { 
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
            
            var change = true;
            if (typeof cb !== 'undefined')
                change = cb($(evt.target).attr('id'));
                
            if (change) {
                //turn off any current selection
                $(groupSelector + " .btn").removeClass('active')
                //and now turn on the new one   
                $(evt.target).addClass('active');
                evt.stopImmediatePropagation();
            }
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
            if (err instanceof Libree.inputException) {
                Libree.flagInputValidity(inputSelector, false);
                return null;
            }
        }
    }
    
    var validators = {
        number: /^[+\-]?[0-9]*\.?[0-9]*([eE][0-9]*\.?[0-9]*)?$/,
        hex: /^([0-9A-Fa-f]{2}\s*)*$/
    }
    
    Libree.validatorHex = function() {
        return function(input) {
            if (!validators.hex.test(input))
                throw new Libree.inputException();
                                            
            return input.replace(/\s/g, '');
        };
    }
    
    Libree.validatorNumber = function(int, min, max) {
        return function(input) {
            if (!validators.number.test(input))
                throw new Libree.inputException();
            
            //so it looks like a number, make it one
            var x = parseFloat(input);
            
            if(typeof max === "undefined") { max = Infinity; }
            if(typeof min === "undefined") { min = -Infinity; }
            
            if ((int && (x % 1 != 0)) || isNaN(x) || x < min || x > max
                || ((min === 'e' || max === 'e') && x === 0)) //filter zero floats
                throw new Libree.inputException();
                
            return x;
        };
    }
    
    Libree.textToHex = function (text) {
        var hex = ''
        
        for (var i = 0; i < text.length; i++)
            hex += Libree.leftPad(text.charCodeAt(i).toString(16), 2, '0') + ' ';
            
        return hex;
    }
    
    Libree.hexToText = function (hex) {
        
        var text = ''
        
        if (hex) {
            var hex = hex.replace(/\s/g, "");
            
            if (hex.length % 2 === 0) {
                for (var i = 0; i < hex.length; i+=2) {
                    text += String.fromCharCode(parseInt(hex.substr(i,2), 16));
                }
            } else { //we need even number of hexigits
                throw new Libree.inputException();
            }
        }
        
        return text;
    }
    
    Libree.binToHex = function(bin) {
        hex = '';
        for (var i = 0; i < bin.length; i++)
            hex += Libree.leftPad(bin[i].toString(16), 2, '0') + ' ';
        
        return hex
    }
    
    Libree.hexToBin = function(hex) {
        
        hex = hex.replace(/[^0-9A-Fa-f]/g, ""); //replace all non-hex
        
        var bin = new Uint8Array(Math.ceil(hex.length / 2));
        var fullBytes = Math.floor(hex.length / 2);
        var i,j;
        for (i = 0, j=0; j < fullBytes; i+=2, j+=1)
            bin[j] = parseInt(hex[i] + hex[i+1], 16);
        
        //partial byte - take as the most significant nibble
        if (hex.length % 2)
            bin[j] = parseInt(hex[hex.length-1], 16) * 16;

        return bin;
    }
    
    Libree.textToBin = function(text) {
        var bin = new Uint8Array(text.length);

        for (i = 0; i < text.length; i+=1)
            bin[i] = text.charCodeAt(i);

        return bin;
    }
    
    Libree.leftPad = function (val, size, ch) {
        var result = String(val);
        if(!ch) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    }
    
    Libree.inputException = function () {}
    
    // For a dropdown input combo, bind an event to copy the selected
    // value into the input, and trigger a keyup 
    Libree.dropdownSelectValue = function(sel) {
        $(sel + ' li').click(function(e) {
            $(sel + ' input').val($(e.target).text()).keyup();
            
            e.preventDefault();
        });
    }
    
    // for a dropdown input combo, change the selected menu item
    // to the one that is clicked
    Libree.dropdownChangeSelected = function(sel, callback) {
        
        $(sel + ' li').click(function(e) {

            var title = $(sel + ' span.dropdown-title');
            var oldVal = title.text().trim();
            
            var newVal = $(e.target).text();
            title.text(newVal + ' ');
            
            if (typeof callback === 'function')
                callback(oldVal, newVal);
                
            e.preventDefault();
        });
    }
    
    // for a dropdown input combo, change the selected menu item
    // to the one that is clicked
    Libree.dropdownGetSelected = function(sel) {
        return $(sel + ' span.dropdown-title').text().trim();
    }
    
    Libree.dropdownGetVal = function(sel) {
        return $(sel + ' input').val();
    }
    
    Libree.bindInputEnable = function(sel, callback) {
        var cb = $(sel + ' input:checkbox')        
        cb.change( function (e) {
            $(sel + ' input.main-input').prop("disabled", !cb.prop('checked'))
        
            if (typeof callback === 'function')
                callback(cb.prop('checked'));
        });
    }
    
    Libree.showError = function(msg, errContainer, clearContainer) {
        $(errContainer)
            .append($("<div>", {'class':'alert alert-warning'})
                .text(msg)
            );
        $(clearContainer).addClass('hidden');
    }
    
    Libree.clearError = function(errContainer, clearContainer) {
        $(errContainer).empty();
        $(clearContainer).removeClass('hidden');
    }

    return Libree;
});
