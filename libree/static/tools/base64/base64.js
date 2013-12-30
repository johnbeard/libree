/*
 * Base64 encoder/decoder tool
 *
 * Supports conversion from and to files, text and hexadecimal, and can
 * also display the Base64 in hexadecimal.
 *
 * (c) 2013 John Beard - MIT License
 * See libree.org/licensing for license details
 */
define(["../libree_tools", "../../js/base64"], function(Libree, B64) {

    var inputMethod = 'text';
    var outputMethod = 'text';
    var data; //binary data

    //display a Base64 string in the right output box
    var printB64 = function (b64) {
        var lineLength = parseInt($('#lineLength').val());

        if (outputMethod === 'text') {
            var out = '';
            // wrap at the right length
            for (var offset = 0, strLen = b64.length; offset < strLen; offset += lineLength) {
                out += (offset > 0)? '\n' : '';
                out += b64.slice(offset, lineLength + offset);
            }

            $('#output-textbox').val(out).removeClass('error-box');
        }
        else if (outputMethod === 'hex')
        {
            $('#output-hexbox').val(Libree.textToHex(b64));
        }

        setDownloadLink(b64);
    };

    // replace the download link data URI with the current Base64
    var setDownloadLink = function (b64) {
        $('#btn-download').removeClass('hidden')
            .attr({'href': 'data:text/plain; charset=utf-8;base64,'+b64});
    }

    // encode the input (file, text or hex) as base64 as display
    var encode = function () {

        if (inputMethod === 'text') {
            data = B64.strToUTF8Arr($("#input-textbox").val());

            var b64 = B64.base64EncArr(data);
            printB64(b64);
        } else if (inputMethod === 'hex') {
            data = Libree.hexToBin($("#input-hexbox").val());
            var b64 = B64.base64EncArr(data);
            printB64(b64);

        } else if (inputMethod === 'file') {
            var file = $('#input-filechooser').get(0).files[0];

            var fr = new FileReader();

            fr.onload = (function() {
                return function(e) {
                    data = new Uint8Array(e.target.result)
                    var b64 = B64.base64EncArr(data);
                    printB64(b64);
                };
            })(file);

            fr.readAsArrayBuffer( file );
        }
    }

    //decode the base64 into the relevant textarea
    var decode = function () {
        var error = false;
        try {
            var b64;
            if (outputMethod === 'text')
                b64 = $('#output-textbox').val()
            else
                b64 = Libree.hexToText($('#output-hexbox').val());

            b64 = b64.replace(B64.base64Pattern, "");

            data = B64.base64DecToArr(b64);

            inputMethodChanged();

            $('#input-filechooser').val('');

            setDownloadLink(b64);

        } catch (err) {
            if (err instanceof base64.DecodeException)
                error = true;
        }

        $('#output-textbox').toggleClass('error-box', error);
    }

    // button was pressed - update internals and areas
    // if ID is undefined, it means we need to update even if the
    // inputMethod did not change (the base64 did)
    var inputMethodChanged = function(id) {

        old = inputMethod;

        if (typeof id !== 'undefined')
            inputMethod = id.split('-')[1];

        if (inputMethod !== old || typeof id == 'undefined')
        {
            //show the right input area
            var areaId = inputMethod + '-input';

            if (inputMethod === 'text') {
                $('#input-textbox').val(B64.UTF8ArrToStr(data || []));

            } else if (inputMethod === 'hex') {
                $('#input-hexbox').val(Libree.binToHex(data || []));
            }

            $('.input-area').addClass('hidden');
            $('#' + areaId).removeClass('hidden');
        }
    }

    // the output method has changed - convert from text to hex or back
    var outputMethodChanged = function(id) {
        //show the right input area
        var old = outputMethod;
        outputMethod = id.split('-')[1];

        if (outputMethod !== old) {
            var areaId = outputMethod + '-output';

            //just flip between the two
            if (outputMethod === 'text') {
                $('#output-textbox').val(Libree.hexToText($('#output-hexbox').val() || ''));

            } else if (outputMethod === 'hex') {
                $('#output-hexbox').val(Libree.textToHex($('#output-textbox').val() || ''));
            }

            $('.output-area').addClass('hidden');
            $('#' + areaId).removeClass('hidden');
        }
    }

    var typingTimer;
    var makeBindings = function () {
        Libree.setupToggleButton("#input-select", inputMethodChanged);

        $('#input-filechooser').change( function() {
            encode();
        });

        $('#lineLength').change( function (e) {
            //re-parse with new line length
            e.preventDefault();
            printB64($('#output-textbox').val().replace(/\s/g, ""));
        });

        $('#btn-encode').click( function (e) {
            encode();
            e.preventDefault();
        });

        $('#btn-decode').click( function (e) {
            e.preventDefault();
            decode();
        });

        Libree.setupToggleButton("#output-select", outputMethodChanged);

        Libree.doneTyping(".input-area textarea", typingTimer, 500, encode);
        Libree.doneTyping(".output-area textarea", typingTimer, 500, decode);
    }

    $( document ).ready(function () {

        makeBindings();
        Libree.setupTool();

        // Check for the various File API support.
        if (!Libree.supportsFile()) {
            $('#b64-warnings')
                .empty()
                .append($("<div>", {'class':'alert alert-danger'})
                    .text('This browser does not fully support the HTML5 File API. This is required to use the Base64 converter.')
                )
        }
    });
});
