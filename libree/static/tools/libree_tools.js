

define(function () {

    var Libree = function () {};

    Libree.addHelpButton = function() {
        var me = this;
        var img = $("<img>",
                    {'src':"/static/icons/help-22.png",
                        'alt':"Help",
                        'title':"Click for tool instructions",
                        'class':"help-button"
                    })

        $('.help-button-container').append(img)
            .on('click', function(evt) {
                        me.toggleHelp();
                    });


        $('.help-close-container').click( function() {
            me.hideHelp();
        });
    }

    Libree.setupTool = function () {
        if ($('#help-container').length > 0) {
            this.addHelpButton();
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

        return result + ' ' + prefix + unit;

    }

    return Libree;
});
