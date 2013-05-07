
define(["../../js/crypto/common", "../libree_tools"],
    function(Crypto, Libree) {


    var hashType = null;

    var initialSetup = function () {
        $('#use-hmac').change();
    } 
    
    var getRadioVal = function(name) {
        return $('input[name=' + name + ']:radio:checked').val();
    }
    
    var numericRadio = function(start, end, step, name, textFunc, span) {
        var selector = $('<form action="">');
        
        for (var i = start; i <= end; i += step) {
            var text = textFunc(i);
            var input = $('<input type="radio" name="' + name + '" value="' + i + '">');
            
            if (i == start) {
                input.prop('checked',true);
            }
            
            selector.append(input, text, '<br>');
        }
        selector = $('<div>', {'class':'span'+span}).append(selector);
        
        return selector;
    }
    
    var hashSelected = function (ob) {
        hashType =  ob.attr('id');
        
        var hashOptions = $('#hash-options').empty();
        
        $('#hash-options-container').removeClass('hidden');
        
        if (hashType == "tiger") {
            var roundSelector = numericRadio(3, 4, 1, 'passes', function(r){return r + ' passes';}, 3)
                .addClass("offset3");
            var bitSelector = numericRadio(128, 192, 32, 'bits', function(r){return r + ' bits';}, 3);
            
            hashOptions.append(roundSelector, bitSelector);
        } else {
            $('#hash-options-container').addClass('hidden');
        }
    }

    var computeHash = function () {

        var str = $("#input-data").val();
        var cryptoFunc;
        var hmac = $('#use-hmac')[0].checked;
        var hmacStr = $("#hmac-key").val();

        if (hmac) {
            cryptoFunc = Crypto.hmacRStr;
        } else {
            cryptoFunc = Crypto.hashRstr;
        }

        //get the strings into rstrs as needed
        if ($("#data-as-hex")[0].checked) {
            str = Crypto.hex2rstr(str);
        } else {
            str = Crypto.str2rstr_utf8(str);
        }
    

        if ($("#hmac-as-hex")[0].checked) {
            hmacStr = Crypto.hex2rstr(hmacStr);
        } else {
            hmacStr = Crypto.str2rstr_utf8(hmacStr);
        }

        var hashType = null;

        if ($('#main-mode-selector .btn.active').length > 0)
        {
            hashType = $('#main-mode-selector .btn.active').attr('id');


            if (hashType === 'reveal-more-hashes'){
                hashType = $('#hash-select').val();
            }
        }

        if (hashType !== null) {
            
            configuration = {};
            //gather hash-specific data info a config hash
            if (hashType === "tiger") {
                configuration['passes'] = parseInt(getRadioVal("passes"));
                configuration['hashLength'] = parseInt(getRadioVal("bits"));
            }
            
            var hashModule = '../../js/crypto/' + hashType;
            
            require([hashModule], function (hashFunc) {
                var val,
                hash = new hashFunc();
                
                if (hash.configure)
                    hash = hash.configure(configuration);

                if (!hmac) {
                    output = cryptoFunc(str, hash);
                } else {
                    output = cryptoFunc(hmacStr, str, hash);
                }

                $('#output-data').val(Crypto.rstr2hex(output));
            });
        }
    }

    var makeBindings = function () {
        $('#use-hmac').change( function(){
            $('#hmac-options').toggleClass('hidden', !this.checked);
        });

        $('.btn-group.mode-selector .mode-btn').click( function (evt) {
            
            if ($(evt.target).attr('id') !== 'reveal-more-hashes') {
                $('#hashes-extra').addClass('hidden');
            } else {
                $('#hashes-extra').removeClass('hidden');
            }
            
            hashSelected($(evt.target));
        });

        $('#compute').click( function () {
            computeHash();
        });
    };

    $( document ).ready(function () {
        makeBindings();
        Libree.setupTool();
        initialSetup();

        $('#main-mode-selector > #tiger').click();
    });
});
