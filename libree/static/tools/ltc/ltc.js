/*
 * LTC encoder/decoder
 * 
 * (c) John Beard 2013
 * Part of LibrEE.org
 * 
 * Released under the GPLv3
 * See libree.org/license
 */
define(["../libree_tools", "../../js/ltc"], function(Libree, LTC) {

    var decode = function () {
        
        var inputType = Libree.dropdownGetSelected("#data-input");
        
        if (inputType == "Hexadecimal"){
            var hex = Libree.validateInput("#data-input input", Libree.validatorHex());
            var bin = Libree.hexToBinary(hex);
        }
        else {
            var bin = Libree.validateInput("#data-input input", Libree.validatorBinary());
        }
        
        var userbitType = Libree.dropdownGetSelected("#userbits-input");
        
        var fps = parseInt($("#fps").val());
        
        try {
            var ltc = LTC.decode(bin, fps);
        } catch (err) {
            if (err instanceof LTC.InputLengthException)
                return;
            else
                throw err;
        }
           
        var ubStr = '';
        var userbitLSBFirst = false;
        var ubs = ltc.userbits;
        
        if (userbitType.contains("LSB"))
            ubs = ubs.map(function(x) {return x.reverse();});
        
        if (userbitType.contains("Hexadecimal")){
            ubStr = ubs.map(function(x) {return parseInt(x, 2).toString(16);});
        } else if (userbitType.contains("Binary")){
            ubStr = ubs.map(function(x) {return Libree.leftPad(parseInt(x, 2).toString(2), 4, '0');});
        } else if (userbitType.contains("Decimal")){
            ubStr = ubs.map(function(x) {return Libree.leftPad(parseInt(x, 2).toString(10));});
        } else if (userbitType.contains(["SMPTE"])){
            ubStr = ['SMPTE'];
        }
        
        var timecode = ltc.hr.toString().leftPad(2,'0')
            + ':' + ltc.min.toString().leftPad(2,'0')
            + ':' + ltc.sec.toString().leftPad(2,'0')
            + ':' + ltc.frame.toString().leftPad(2,'0');        
        
        $('#timecode').val(timecode);
        $('#binflag').val(ltc.binaryGroup.toString());
        $('#sync').val(ltc.syncPattern.toString(16).leftPad(4, '0').toUpperCase());
        
        $('#dropframe').prop('checked', ltc.dropFrame);
        $('#colourframe').prop('checked', ltc.colourFrame);
        $('#parity').prop('checked', ltc.parityBit);
        
        $('#userbits-input .main-input').val(ubStr.join(':').toUpperCase());
    };
    
    var encode = function () {
        var parityBit = $('#parity').prop('checked');
        var dropFrame = $('#dropframe').prop('checked');
        var colourFrame = $('#colourframe').prop('checked');
        var reservedBit = $('#reserved').prop('checked');
        var fps = parseInt($("#fps").val());
        
        var timecode = $('#timecode').val().split(':').map(function(x) {return parseInt(x,10);});
        
        var binaryGroup = parseInt($('#binflag').val()).toString(2).leftPad(2, '0');
        
        var ubs = $('#userbits-input .main-input').val().split(':')

        //hex -> bin
        ubs = ubs.map(function(x) {return parseInt(x,16).toString(2).leftPad(4,'0');});

        var syncPattern = parseInt($('#sync').val(),16);
        
        var ltc = LTC.encode(parityBit, dropFrame, colourFrame, reservedBit, 
                    timecode[0], timecode[1], timecode[2], timecode[3], 
                    ubs, binaryGroup, syncPattern, fps);
        
        var inputType = Libree.dropdownGetSelected("#data-input");
        if (inputType == "Hexadecimal"){
            ltc = Libree.binaryToHex(ltc).toUpperCase();
        }
        else {
            ltc = ltc.regroup(4);
        }
        
        $("#data-input .main-input").val(ltc);
    }
    
    var reportError = function(msg) {
        Libree.showError(msg, '#warnings', '.results')
    }

    var onInputTypeChange = function(oldType, newType) {
        var curr = $("#data-input .main-input").val();
        
        if (oldType.contains('Hex') && newType.contains('Bin')) {
            $("#data-input .main-input").val(Libree.hexToBinary(curr).regroup(4));
        } else if (oldType.contains('Bin') && newType.contains('Hex')) {
            $("#data-input .main-input").val(Libree.binaryToHex(curr).toUpperCase());
        }
    }

    
    var onUserbitTypeChange = function(oldType, newType) {
        decode();
    }
    
    var typingTimer;
    var makeBindings = function () {
        Libree.dropdownChangeSelected("#data-input", onInputTypeChange);
        Libree.dropdownChangeSelected("#userbits-input", onUserbitTypeChange);
        
        Libree.doneTyping("#encoded-area input", typingTimer, 500, decode);
        
        Libree.doneTyping("#decoded-area input", typingTimer, 500, encode);
        
        $(".btn#decode").click( function() {decode();});
        $(".btn#encode").click( function() {encode();});
    }

    $( document ).ready(function() {
        makeBindings();
        decode();
        Libree.setupTool();
    });

});
