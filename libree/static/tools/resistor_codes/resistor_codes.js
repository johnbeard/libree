
define(["../libree_tools"], function(Libree) {

    var toTitleCase = function (str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    var value;
    var mode = "4band"; //initial state

    var pickerId = 'resistor_code_color_picker';

    var modeImages = { "4band": "4-band-resistor.svg",
                        "5band" : "5-band-resistor.svg",
                        "6band" : "6-band-resistor.svg",
                        "bed" : "BED-resistor.svg"
                     };

    var modeImageDir = "/static/tools/resistor_codes/";

    var colours = {'black': {'hex':'#000000', 'sf':0,  'mult':0,  'tol':null, 'tc':250, 'invert':true},
            'brown'     : {'hex':'#964B00', 'sf':1,  'mult':1,  'tol':1, 'tc':100, 'invert':true},
            'red'       : {'hex':'#FF0000', 'sf':2,  'mult':2,  'tol':2, 'tc':50, 'invert':false},
            'orange'    : {'hex':'#FFA500', 'sf':3,  'mult':3,  'tol':null, 'tc':15, 'invert':false},
            'yellow'    : {'hex':'#FFFF00', 'sf':4,  'mult':4,  'tol':null, 'tc':25, 'invert':false},
            'green'     : {'hex':'#9ACD32', 'sf':5,  'mult':5,  'tol':0.5, 'tc':20, 'invert':false},
            'blue'      : {'hex':'#6495ED', 'sf':6,  'mult':6,  'tol':0.25, 'tc':10, 'invert':false},
            'violet'    : {'hex':'#EE82EE', 'sf':7,  'mult':7,  'tol':0.1, 'tc':5, 'invert':false},
            'grey'      : {'hex':'#A0A0A0', 'sf':8,  'mult':8,  'tol':0.05, 'tc':1, 'invert':false},
            'white'     : {'hex':'#FFFFFF', 'sf':9,  'mult':9,  'tol':null, 'tc':null, 'invert':false},
            'gold'      : {'hex':'#CFB53B', 'sf':null,  'mult':-1, 'tol' : 5, 'tc':null, 'invert':false},
            'silver'    : {'hex':'#C0C0C0', 'sf':null,  'mult':-2, 'tol' : 10, 'tc':null, 'invert':false},
            'none'      : {'hex':'none',    'sf':null,  'mult':null, 'tol': 20, 'tc':null, 'invert':false}
    };

    var coloursInOrder = ['black', 'brown', 'red', 'orange', 'yellow',
            'green', 'blue', 'violet', 'grey', 'white', 'gold', 'silver',
            'none'];

    //TODO: make this a JQ type function thingy
    var getColourClass = function(e) {
        for (var i = 0; i < coloursInOrder.length; i++) {

            if (e.hasClass(coloursInOrder[i])) {
                return coloursInOrder[i];
            }
        }

        return null;
    }

    //remove all colour classes
    var removeColourClass = function(e) {
        for (var i = 0; i < coloursInOrder.length; i++) {
            e.removeClass(coloursInOrder[i]);
        }
    }

    var getInitialValue = function() {
        value = {};
        var bands = $('path.resistor-band').each( function(i, e) {

            var bandIndex = /band([0-9])/.exec(e.id)[1] - 1;

            var bandColour = getColourClass($(e));

            if (bandColour != null) {
                value[bandIndex] = bandColour;
            } else {
                value = null;
                return false;
            }
        });

        if (value != null) {
            recomputeValue();
            adjustTable();
        }
    }

    var renderVal = function(val, tol, tc) {
        result = 'invalid';

        result = Libree.formatUnits(val, 'Ω');

        if (tol != null) {
            result += ' ±' + tol + '%';
        }

        if (tc != null) {
            result += ', ' + tc + 'ppm/K';
        }

        return result;
    }

    var recomputeValue = function() {
        result = "invalid";

        if (mode == "4band" || mode == "bed"){

            var val1 = colours[value[0]].sf;
            var val2 = colours[value[1]].sf;
            var mult = colours[value[2]].mult;
            var tol = colours[value[3]].tol;
            var tc = null;

            if (val1 !== null && val2 !== null && mult !== null && tol !== null) {
                val = ((val1*10) + val2) * Math.pow(10, mult);
                val = Libree.sigFigs(val, 2);
            }
        } else if (mode == "5band" || mode == "6band"){

            var val1 = colours[value[0]].sf;
            var val2 = colours[value[1]].sf;
            var val3 = colours[value[2]].sf;
            var mult = colours[value[3]].mult;
            var tol = colours[value[4]].tol;

            var tc = mode == "6band" ? colours[value[5]].tc : null;

            if (val1 !== null && val2 !== null && val3 !== null && mult !== null && tol !== null) {
                val = ((val1*100) + (val2*10) + val3) * Math.pow(10, mult);
                val = Libree.sigFigs(val, 3);
            }
        }

        result = renderVal(val, tol, tc);
        $('#resistor-value').text(result);
    }

    var onSelectColour = function(colour, band) {
        value[band] = colour;
        recomputeValue();

        var band = $('#' + bandIdFromIndex(band));
        removeColourClass(band);
        band.addClass(colour);

        $('#' + pickerId).remove();
    }

    var typeFromBand = function(band) {
        var type = null;

        if (((mode == "4band" || mode == "5band" || mode == "6band") && (band == 0 || band == 1))
                || ((mode == "5band" || mode == "6band") && band == 2)
                || (mode == "bed" && (band == 0 || band == 1))) {
            type = "sf";
        } else if ((mode == "4band" && band == 2)
                || ((mode == "5band" || mode == "6band") && band == 3)
                || (mode == "bed" && band == 2)) {
            type = "mult";
        } else if ((mode == "4band" && band == 3)
                || ((mode == "5band" || mode == "6band") && band == 4)
                || (mode == "bed" && band == 3)) {
            type = "tol";
        } else if ((mode == "6band" && band == 5)) {
            type = "tc";
        }

        return type;
    }

    var bandIndexFromElement = function(e) {
        var band = -1;

        if (mode === "4band" || "5band") {
            band = /band([0-9])/.exec(e.id);
        }

        if (band.length === 0){
            return null;
        } else {
            return band[1] - 1;
        }
    }

    var bandIdFromIndex = function(i) {
        return 'band' + (i + 1);
    }

    var bandIndexFromCell = function(e) {
        var band = -1;

        if (e.hasClass("colour-sf")) {
            if (e.hasClass("sf-1")) {
                band = 0;
            } else if (e.hasClass("sf-2")) {
                band = 1;
            } else if (e.hasClass("sf-3") && (mode == "5band" || mode == "6band")) {
                band = 2;
            }

        } else if (e.hasClass("colour-mult")) {
            band = (mode == "4band"  || mode == "bed") ? 2 : 3;
        } else if (e.hasClass("colour-tol")) {
            band = (mode == "4band" || mode == "bed") ? 3 : 4;
        } else if (e.hasClass("colour-tc")) {
            if (mode == "6band") {
                band = 5;
            }
        }
        return band;
    }

    var colourFromCell = function(e) {
        return getColourClass(e.parent());
    }

    var showColorSelector = function(evt) {
        //kill any old ones
        $('#' + pickerId).remove();

        var left = evt.pageX;
        var top = evt.pageY;

        var band = bandIndexFromElement(evt.target);

        if (band === null) {
            return; //erk! bail out!
        }

        var picker = $('<div>', {'id': pickerId})
            .addClass('popup-context-menu')
            .css({'top': top + 'px',
                'left': left +  'px',
                });

        type = typeFromBand(band);

        var pickerHeading = $('<span>').attr('class', 'picker-header');

        if (type === "sf") {
            pickerHeading.append("Significant figure:");
        } else if (type === "mult") {
            pickerHeading.append("Multiplier:");
        } else if (type === "tol") {
            pickerHeading.append("Tolerance:");
        } else if (type === "tc") {
            pickerHeading.append("Temp. coefficient:");
        }

        pickerHeading.appendTo(picker);

        for (var i = 0; i < coloursInOrder.length; i++) {
            colour = coloursInOrder[i];

            item = $('<div>')
                .attr('class', 'picker-colour menu-item')
                .css({'height' : '1.5em'});

            colourBox = $('<div>')
                .attr('class', 'colour-box picker-colour-box float-left')
                .css({'background': colours[colour]['hex']})
                .appendTo(item);

            colourLabel = $('<div>')
                .css({'width':'6em', "float": "left"})
                .attr('class', 'picker-colour-title')
                .append(toTitleCase(colour))
                .appendTo(item);


            legend = $('<span>')
                .attr('class', 'picker-colour-label')

            var invalid = true;

            if (type === "sf" && colours[colour].sf !== null) {
                legend.attr('class', 'picker-colour-sf')
                    .append(colours[colour].sf)
                invalid = false;
            } else if (type === "mult" && colours[colour].mult !== null) {
                legend.attr('class', 'picker-colour-mult')
                    .append('10<sup>' + colours[colour].mult + '</sup>')
                invalid = false;
            } else if (type === "tol" && colours[colour].tol !== null
                && !(mode == "bed" && colour != "gold" && colour != "silver" && colour != "none")) {
                legend.attr('class', 'picker-colour-tol')
                    .append('±' + colours[colour].tol + '%')
                invalid = false;
            } else if (type === "tc" && colours[colour].tc !== null) {
                legend.attr('class', 'picker-colour-tc')
                    .append(colours[colour].tc + 'ppm/K')
                invalid = false;
            }

            legend.appendTo(item);

            if (!invalid) {
                item.bind('click',
                    {'colour':colour, 'band':band},
                    function (evt) {
                        onSelectColour(evt.data.colour, evt.data.band);
                    }
                );
            }

            picker.append(item);
        }

        $('body').append(picker);
    }

    var highlightColumnFromElement = function(e) {
        var index = bandIndexFromElement(e);
        var type = typeFromBand(index);

        if (type === "sf") { //get the right SF
            var selector = 'td.colour-' + type + '.sf-' + (index+1);
        } else {
            var selector = 'td.colour-' + type;
        }

        $(selector).addClass("highlighted-table-column");
    }

    var highlightBandFromCell = function(e, highlight) {

        var band = bandIndexFromCell($(e));
        if (band < 0) { return; }

        $('#' + bandIdFromIndex(band))
            .toggleClass("highlighted-element", highlight);
    }

    var makeImageBindings = function() {
        $(".resistor-band").on('click', function(evt) {
            showColorSelector(evt);
            evt.stopPropagation();
        });

        $(".resistor-band").on('mouseenter', function(evt) {
            highlightColumnFromElement(evt.target);
        });

        $(".resistor-band").on('mouseleave', function(evt) {
            var type = typeFromBand(bandIndexFromElement(evt.target));
            $('td.colour-' + type).removeClass("highlighted-table-column");
        });
    }

    var makeBindings = function() {

        makeImageBindings();

        $('#' + pickerId).on('click', function(evt) {
            evt.stopPropagation();
        });

        $('#mode-selector .btn').on('click', function(evt) {

            for (var newMode in modeImages) {
                if ($(evt.target).hasClass(newMode)) {
                    switchMode(newMode);
                }
            }
        });

        $("body").on('click', function(evt) {
            if($(evt.target).closest('#' + pickerId).length == 0) {
                $('#' + pickerId).remove();
            }
        });

        $("#color-table td:not(:first-child)").on('click', function(evt) {
                var band = bandIndexFromCell($(evt.target));

                if (band < 0) { return; }

                var colour = colourFromCell($(evt.target));
                onSelectColour(colour, band );
            })
            .on('mouseenter', function(evt) {
                highlightBandFromCell(evt.target, true);
            })
            .on('mouseleave', function(evt) {
                highlightBandFromCell(evt.target, false);
            })
            .css({'cursor': 'pointer'});

        //help highlighting
        $('#hint-mode')
            .hover(function(evt) {
                $('#mode-selector').toggleClass("help-highlight");
            });

        $('#hint-band')
            .hover(function(evt) {
                $('.resistor-band').toggleClass("help-highlight");
            });

        $('#hint-value')
            .hover(function(evt) {
                $('#resistor-value').toggleClass("help-highlight");
            });

        $('#hint-table')
            .hover(function(evt) {
                $('#color-table').toggleClass("help-highlight");
            });
    };

    var switchMode = function (newMode) {
        mode = newMode;

        replaceImageFromURL(modeImageDir + modeImages[mode],  $('#main-image'));
    }

    var adjustTable = function() {

        if (mode == "6band") {
            $('td.colour-tc').removeClass('inactive-content');
        } else {
            $('td.colour-tc').addClass('inactive-content');
        }

        //BED resistors only have 3 valid tolerance colours: gold siver and none
        if (mode == "bed") {
            for (var i =0; i < coloursInOrder.length; i++) {
                var colour = coloursInOrder[i];
                if (colour != "gold" && colour != "silver" && colour != "none") {
                    $('tr.' + colour + ' td.colour-tol').addClass('inactive-content');
                }
            }
        } else {
            $('td.colour-tol').removeClass('inactive-content');
        }

        if (mode == "4band" || mode == "bed") {
            $('th.colour-sf').attr('colspan', 2);
            $('td.sf-3').css('display', 'none');
        } else if (mode == "5band" || mode == "6band") {
            $('th.colour-sf').attr('colspan', 3);
            $('td.sf-3').css('display', '');
        }
    }

    var replaceImageFromURL = function(url, destinationContainer) {

        $.ajax( url,
            {dataType: 'text',
            success: function(data) {
                destinationContainer.empty().append(data);
                makeImageBindings();
                getInitialValue();
            },
        });

        adjustTable();
    }


    $( document ).ready(function() {
        getInitialValue();
        makeBindings();
        Libree.setupTool();
    });

});
