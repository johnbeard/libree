
define(["./bignumber"], function(BigNumber) {

    var NumConvert = function(){};
    
    var strRepeat = function(s, num )
    {
        return new Array( num + 1 ).join( s );
    };
    
    var padLeft = function(s, length, padding) {
        if (s.length < length) {
            return strRepeat(padding, length - s.length) + s;
        }
        return s;
    };  
    
    NumConvert.InvalidIntegerException = function(num) {this.num = num}
    NumConvert.OutOfRangeException = function(num) {this.num = num}

    NumConvert.validateInteger = function (bn) {
        if (!bn.isInt())
            throw new NumConvert.InvalidIntegerException(bn);
    }

    NumConvert.baseToBase = function(s, baseIn, baseOut, isInt) {
        
        isInt = typeof pad !== 'undefined' ? isInt : false;
        
        var bn = BigNumber(s, baseIn);
        
        if (isInt)
            this.validateInteger(bn);
        
        return bn.toString(baseOut);
    };
    
    NumConvert.unsignedFixedBaseToBase = function(s, bits, baseIn, baseOut, pad) {

        pad = typeof pad !== 'undefined' ? pad : true;

        //throws here if it's a bad string...
        var newNum = BigNumber(s, baseIn);
        
        this.validateInteger(newNum);
        
        //range check, between 0 and 2^length - 1
        if (newNum.cmp(0) < 0 || newNum.cmp(BigNumber(2).pow(bits).minus(1)) > 0) {
            throw new NumConvert.OutOfRangeException();
        } 
        
        if (!pad) {
            return newNum.toString(baseOut)
        } else {
            var bitsPerChar = Math.log(baseOut) / Math.log(2);
            return padLeft(newNum.toString(baseOut), Math.ceil(bits/bitsPerChar), "0");
        }
    }
    
    // convert a "natural" integer string into a machine signed representation
    // presented in whichever base you want
    NumConvert.naturalToSignedMachineBase = function(s, bits, baseIn, baseOut) {
        //throws here if it's a bad string...

        newNum = BigNumber(s, baseIn);
        this.validateInteger(newNum);
      
        if (newNum.cmp(BigNumber(2).pow(bits-1).neg()) < 0 || newNum.cmp(BigNumber(2).pow(bits-1).minus(1)) > 0) {
            throw new NumConvert.OutOfRangeException(newNum);
        }
        
        if (newNum.cmp(0) !== 0) {//zero counts as positive
 
            var sign = newNum.cmp(0);
            var abs = newNum.abs();
            
            //pad out to the right length
            if (sign < 0) 
                newNum = BigNumber(2).pow(bits).minus(abs)
        }

        //if we don't have enough chars after rebasing, it means we need to re-pad with zeros
        var bitsPerChar = Math.log(baseOut) / Math.log(2);
        return padLeft(newNum.toString(baseOut), Math.ceil(bits/bitsPerChar), "0");
    }
    
    NumConvert.signedMachineToNaturalBase = function(s, bits, baseIn, baseOut) {
        //throws here if it's a bad string...
        newNum = BigNumber(s, baseIn);
        
        this.validateInteger(newNum);

        // from 0 to 2^N - 1 ---> sign bit is 0
        if (newNum.cmp(0) >= 0 && newNum.cmp(BigNumber(2).pow(bits-1).minus(1)) <= 0) {
            
            
        // sign bit is one, convert it!
        } else if (newNum.cmp(BigNumber(2).pow(bits-1)) >= 0 
                && newNum.cmp(BigNumber(2).pow(bits).minus(1)) <= 0) {
                    
            newNum = BigNumber(2).pow(bits).minus(newNum).neg();

        } else { //what is this?? negative or too big!
            throw new NumConvert.OutOfRangeException(newNum);
        }
        
        return newNum.toString(baseOut);
    }

    
    return NumConvert;
});
