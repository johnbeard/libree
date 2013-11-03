/*
 * UART Simulator
 * 
 * (c) John Beard 2013
 * Part of LibrEE.org
 * 
 * Released under the GPLv3
 * See libree.org/license
 */
define(["../tools/libree_tools"], function(Libree) {
    
    var LTC = function() {}

    // ltc nibbles are stored LSB first
    var ltcNibbleVal = function(bits) {
        val = 0;
        bits = bits.leftPad(4,'0');
        for (var i = 0; i < 4; i++) {
            val += (bits[i] === '1' ? '1' : '0') * Math.pow(2, i);
        }
        return val;
    }
    
    var ltcGetNibble = function(val) {
        return val.toString(2).leftPad(4, '0').reverse();
    }
    
    LTC.InputLengthException = function (x) {this.len = x};
    LTC.ValueOverflowError = function (part, val) {this.part = part, this.val=val};
    
    LTC.decode = function (bin, fps) {
        
        if (bin.length !== 80)
            throw new LTC.InputLengthException(bin.length);
        
        var frame = ltcNibbleVal(bin.substr(0,4)) + 10 * ltcNibbleVal(bin.substr(8,2));
        var sec = ltcNibbleVal(bin.substr(16,4)) + 10 * ltcNibbleVal(bin.substr(24,3));
        var min = ltcNibbleVal(bin.substr(32,4)) + 10 * ltcNibbleVal(bin.substr(40,3));
        var hr = ltcNibbleVal(bin.substr(48,4)) + 10 * ltcNibbleVal(bin.substr(56,2));
                
        var binaryGroup = ltcNibbleVal(bin[43] + bin[59] + '00'); //FIXME
        
        var parityBit = bin[27] === '1';
        var reservedBit = bin[58] === '1';
        var dropFrame = bin[10] === '1';
        var colourFrame = bin[11] === '1';
        
        var syncPattern = parseInt(bin.substr(64,16), 2);
        
        //store user bits as binary chunks first
        var userbits = [ bin.substr(4,4), bin.substr(12,4), 
            bin.substr(20,4), bin.substr(28,4), bin.substr(36,4), 
            bin.substr(44,4), bin.substr(52,4), bin.substr(60,4) ];
       
       return { 
           parityBit : parityBit,
           reservedBit : reservedBit,
           dropFrame : dropFrame,
           colourFrame : colourFrame,
           syncPattern : syncPattern,
           frame : frame,
           sec : sec,
           min : min,
           hr : hr,
           binaryGroup : binaryGroup,
           userbits : userbits
       }
    };
    
    LTC.encode = function (parityBit, dropFrame, colourFrame, reserved, 
            hr, min, sec, frame, ubs, binFlag, sync, fps) {
        
        var hr1 = ltcGetNibble(hr % 10);
        var hr10 = ltcGetNibble(Math.floor(hr / 10)).substr(0,2);
        var min1 = ltcGetNibble(min % 10);
        var min10 = ltcGetNibble(Math.floor(min / 10)).substr(0,3);
        var sec1 = ltcGetNibble(sec % 10);
        var sec10 = ltcGetNibble(Math.floor(sec / 10)).substr(0,3);
        var frm1 = ltcGetNibble(frame % 10);
        var frm10 = ltcGetNibble(Math.floor(frame / 10)).substr(0,2);
        
        
            
        //construct binary ltc
        var ltc = frm1 + ubs[0] + frm10 
            + (dropFrame ? '1' : '0') + (colourFrame ? '1' : '0')
            + ubs[1]
            + sec1 + ubs[2] + sec10 + (parityBit ? '1' : '0') + ubs[3]
            + min1 + ubs[4] + min10 + (binFlag & 0x02 ? '1' : '0') + ubs[5]
            + hr1 + ubs[6] + hr10 + (reserved ? '1' : '0') + (binFlag & 0x01 ? '1' : '0') + ubs[7]
            + sync.toString(2).leftPad(16, '0');
        
        return ltc;
    }
    
    return LTC;

});
