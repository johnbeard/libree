/*
 * UART Simulator
 * 
 * (c) John Beard 2013
 * Part of LibrEE.org
 * 
 * Released under the GPLv3
 * See libree.org/license
 */
define(["../libree_tools", 'jquery.flot', 'jquery.flot.resize', 'jquery.flot.axislabels'], function(Libree) {
    
    var slewRateError = function(minSlew) {this.minSlew = minSlew}
    
    var compute = function () {

        var baudrate = Libree.validateInput("#baudrate-input input", Libree.validatorNumber(false, 'e'));
        var bits = Libree.validateInput("#bits", Libree.validatorNumber(true, 8,8));
        var stop = Libree.validateInput("#stop", Libree.validatorNumber(true, 1));
        var parity = $("#parity").val();
        var format = $("#format").val();
        var vswing = Libree.validateInput("#vswing-input .main-input", Libree.validatorNumber(false));
        
        if ($("#slew-input .main-input").prop('disabled'))
            var slew = 0;
        else
            var slew = Libree.validateInput("#slew-input .main-input", Libree.validatorNumber(false, 'e'));
        
        var inputType = Libree.dropdownGetSelected("#data-input");
        
        if (inputType == "Text"){
            var data = Libree.textToBin(Libree.dropdownGetVal("#data-input"));
        }
        else {
            var hex = Libree.validateInput("#data-input input", Libree.validatorHex());
            var data = Libree.hexToBin(hex);
        }
        
        //data = Libree.repartitionData(data, bits);
        
        //check parameters
        if ($.inArray(null, [baudrate, bits, stop, parity, format, slew, data, vswing]) !== -1) {
            reportError("Bad input values");
            return;
        }
        
        try {
            var uartData = getUartPlot(data, baudrate, bits, parity, stop, format, slew, vswing);
            Libree.flagInputValidity("#slew-input .main-input", true);
        } catch (err){
            if (err instanceof slewRateError){
                Libree.flagInputValidity("#slew-input .main-input", false);
                reportError("Slew rate is too low: minimum for this baudrate is " + Libree.formatUnits(err.minSlew, 'V/uS', 2));
                return;
            } else {
                throw err;
            }
        }
        
        //clear errors
        Libree.clearError('#warnings', '.results')
            
        printBitstream(uartData.bitstream);
        plotData(uartData);
    }
    
    var reportError = function(msg) {
        Libree.showError(msg, '#warnings', '.results')
    }
    
    var printBitstream = function(arr) {
        bs = '';
        
        for (var i = 0; i < arr.length; i+=1)
            bs += arr[i] ? '1' : '0';
            
        $('#bitstream').text(bs);
    }
    
    var getUartPlot = function (data, baud, bits, parity, stop, format,slew, vswing) {
        
        var vmark, vspace;
        
        if (format == 'rs232' || format == 'rs485'){      
            vhigh = vswing/2;  
            vlow = -vhigh;  
            
            vspace = vhigh;
            vmark = vlow;
        } else { //UART
            vhigh = vswing;
            vlow = 0;
            
            vmark = vhigh;
            vspace = vlow;
        }
        
        var vdiff = Math.abs(vmark - vspace);
        var bitstream = getUartBitstream(data, bits, parity, stop);
        
        var bitperiod = 1e6 / baud; //in us
        
        // in V/uS
        var slewPeriod;
        
        if (slew){
            var minSlew = vdiff/bitperiod;
            
            if (slew < minSlew)
                throw new slewRateError(minSlew);
                
            slewPeriod = vdiff/slew; 
        } else {
            slewPeriod = 0;
        }
        
        var signal = [];
        var time = 0;
        
        //intial level = idle
        signal.push([-bitperiod, vmark]);
        
        var currentLevel = 1;
        
        for (var i = 0; i < bitstream.bitstream.length; i+=1) {
            if (bitstream.bitstream[i] != currentLevel) {
                signal.push([time, currentLevel? vmark : vspace]);
                currentLevel = bitstream.bitstream[i];
            }
            
            signal.push([time+slewPeriod, bitstream.bitstream[i]? vmark : vspace]);
            time += bitperiod;
        }
        
        signal.push([time, vmark]); //bit period for the last stop bit
        time += bitperiod;
        signal.push([time, vmark]); //some idle time 
        
        var invSignal = null;
        //create an inverse signal
        if (format == 'rs485') {
            invSignal = signal.map(function(x){return [x[0], -x[1]];})
        }
        
        //transform the start, stop and parity bits into valid bit times
        data = {
            bitperiod: bitperiod,
            bitstream: bitstream.bitstream,
            signal: [signal, invSignal],
            startBits: bitstream.start.map(function(x){return [x *bitperiod, (x+1) *bitperiod];}),
            stopBits: bitstream.stop.map(function(x){return [x[0]*bitperiod, (x[0]+x[1])*bitperiod];}),
            parityBits: bitstream.parity.map(function(x){return [x *bitperiod, (x+1) *bitperiod];}),
        }
        
        return data;
    }
        
    var getUartBitstream = function(data, bits, parity, stop) {
        var bitstream = [];
        
        var startBits = [],
            stopBits = [],
            parityBits = [];
        
        for (var i=0; i < data.length; i+=1) {
            startBits.push(bitstream.length);
            bitstream.push(0); //start
            var sum = 0;
            
            var currentBits = Libree.leftPad(data[i].toString(2), bits, '0');
            
            for (var j=currentBits.length-1; j >= 0 ; j--){
                var bit = (currentBits[j]  == '1') ? 1 : 0;
                bitstream.push(bit);
                sum += bit;
            }
            
            if (parity != 'n') {
                var even = sum % 2 == 0;
                parityBits.push(bitstream.length);
                
                var parBit = ((parity === 'e' && even) || (parity === 'o' && !even)) ? 0 : 1;
                bitstream.push(parBit);
            }
            
            stopBits.push([bitstream.length, stop]);
            for (var j=0; j < stop; j++){
                bitstream.push(1);
            }
        }
        
        return {bitstream:bitstream,
            start: startBits,
            stop: stopBits,
            parity: parityBits
        };
    }
    
    var plotData = function (data) {
        
        var markings = [];
        
        for (var i = 0; i < data.startBits.length; i+=1) {
            markings.push({color: '#aaffaa', xaxis: { 
                from: data.startBits[i][0], to: data.startBits[i][1]
            }});
        }
        
        for (var i = 0; i < data.stopBits.length; i+=1) {
            markings.push({color: '#ffaaaa', xaxis: { 
                from: data.stopBits[i][0], to: data.stopBits[i][1]
            }});
        }
        
        for (var i = 0; i < data.parityBits.length; i+=1) {
            markings.push({color: '#aaaaff', xaxis: { 
                from: data.parityBits[i][0], to: data.parityBits[i][1]
            }});
        }
        
        markings.push({color: '#000000', yaxis: {from:0, to:0}});
        
        var data;
        var haveDiffSignal = data.signal[1] !== null;
        
        if (haveDiffSignal)
            data = [{data:data.signal[0], label:'D+'}, {data:data.signal[1], label:'D-'}];
        else
            data = [data.signal[0]];
        
        var options = {
            xaxes: [{
                axisLabel: 'Time / μs',
            }],
            yaxes: [{
                axisLabel: 'Volts',
                position: 'left',
            }],
            grid: {markings: markings},
            colors: ["#0022ff", "#ff2200"],
            legend: {show: true},   
        };
        
        $.plot("#scope", data, options);
    }
    
    var onInputTypeChange = function(oldType, newType) {
        
        try {
            if (newType == 'Text' && oldType == 'Hexadecimal') {
                $("#data-input .main-input").val(Libree.hexToText($("#data-input .main-input").val()))
            } else if (newType == 'Hexadecimal' && oldType == 'Text') {
                 $("#data-input .main-input").val(Libree.textToHex($("#data-input .main-input").val()))
            } 
        } catch (err) {
            //remove parse errors, because we just changed mode
            if (err instanceof Libree.inputException) {
                Libree.flagInputValidity("#data-input .main-input", true);
            } else {
                throw err;
            }
        }
    }
    
    var typingTimer;
    var makeBindings = function () {
        Libree.dropdownSelectValue("#baudrate-input");
        Libree.dropdownChangeSelected("#data-input", onInputTypeChange);
        
        Libree.bindInputEnable("#slew-input", compute);
        
        Libree.doneTyping("input", typingTimer, 500, compute);
        Libree.doneTyping("select", typingTimer, 500, compute, 'click');
    }

    $( document ).ready(function() {
        makeBindings();
        compute();
        Libree.setupTool();
    });

});
