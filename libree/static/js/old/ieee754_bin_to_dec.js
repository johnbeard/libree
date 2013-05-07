

define(["./bignumber"] , function(BigNumber) {
    
    var IEE754 = function () {};
    
    var exp, mant, sign, bits, expValue, mantValue;
    var bin; //binary representation
    var expLength = { 32: 8, 64:11};
    var expOffset = { 32: 127, 64:1024};
    var infExp = {32:255, 64:2047}; //exponents representing infinity
    
    var status;
    
    IEE754.parseBinary = function (_bits, bin) {
        
        bits = _bits;
        
        if (bin.length > bits)
            throw new Error("Invalid IEEE754: too many bits: " + bin.length);
        else if (! /^[01]+$/.test(bin))
            throw new Error("Invalid IEEE754: parse error: " + bin);
        else if (bits !== 32 && bits !== 64)
            throw new Error("Invalid IEEE754: unknown bit length: " + bits);
            
        //pad left to bits if needed
        if (bin.length < bits)
            Array( bits - bin.length + 1 ).join('0') + bin;
         
        var sign = bin[0] === "1";    
        var binExp = bin.substring(1,expLength[bits]+1);
        var binMant = bin.substring(expLength[bits]+1);
        
        var expValue = BigNumber(binExp, 2); //what is actually written
        var exp = expValue.minus(expOffset[bits]) //what that means

        var mantValue = BigNumber(binMant, 2);   // what is stored     
        var mant = BigNumber('1.' + binMant, 2); //what that means
    }
    
    IEE754.getDecimalValue = function () {
        var actual;
        
        if (expValue.equals(0)) {
            
            if mantValue.equals(0) {
                actual = BigNumber(0); //zero
                status = "normal";
            }
            else {
                actual = BigNumber(1); //denormal //FIXME
                status = "denormal";
            }
                
        } else if (expValue.equals(infExp[bits])) {
            
            if mantValue.equals(0) {
                actual = BigNumber(Infinity);
                status = "overflow"
            } else {
                status = "quiet" //FIXME spot signalling!
            }
                
        } else {
            actual = BigNumber(2).pow(exp).times(mant);
            status = "normal";
        }
            
        if (sign)
            actual = actual.neg();
            
        return [status, actual]
    }

    return IEE754;
}
