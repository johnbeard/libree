

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
        $(elem).keyup(function(){
            clearTimeout(timer);
            if ($(elem).val) {
                typingTimer = setTimeout(cb, timeout);
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

    return Libree;
});
