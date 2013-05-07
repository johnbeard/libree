
define(function() {

    var Crypto = function(){};

    Crypto.hashRstr = function(s, hash) {

        var toRStrFunc = hash.bigEndian ? Crypto.binb2rstr : Crypto.binl2rstr;
        var toBinFunc  = hash.bigEndian ? Crypto.rstr2binb : Crypto.rstr2binl;

        return toRStrFunc(hash.fromBin(toBinFunc(s), s.length * 8));
    };

    Crypto.hashHexStr2Hex = function(s, hash) {
        return Crypto.rstr2hex(Crypto.hashRstr(Crypto.hex2rstr(s), hash));
    };

    Crypto.hashUtf8Str2Hex = function(s, hash) {
        return Crypto.rstr2hex(Crypto.hashRstr(Crypto.str2rstr_utf8(s), hash));
    };

    /* Convert a hex string to raw string */
    Crypto.hex2rstr = function (input) {
        var str = input.replace(/^0?[hx]/, '')
            .toUpperCase().replace(/([^A-Z0-9]|\s)/g, '');

        //prepend a zero if there are an odd number of chars
        if (str.length % 2 != 0){
            str = '0' + str;
        }

        var output = "";

        //read of digits in pairs
        for (var i=0; i < str.length; i+=2) {
            var code0 = str.charCodeAt(i);
            var code1 = str.charCodeAt(i+1);

            if (code0 >= 65){ // A-Z
                code0 = (code0 - 55) << 4;
            } else { //0-9
                code0 = (code0 - 48) << 4;
            }
            if (code1 >= 65){
                code0 += code1 - 55;
            } else {
                code0 += code1 - 48;
            }

            output += String.fromCharCode(code0);
        }

        return output;
    };

    /*
     * Convert a raw string to a hex string
     */
    Crypto.rstr2hex = function(input, hexcase)
    {
      try { hexcase } catch(e) { hexcase=0; }
      var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
      var output = "";
      var x;
      for(var i = 0; i < input.length; i++)
      {
        x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F)
               +  hex_tab.charAt( x        & 0x0F);
      }
      return output;
    }

    /*
     * Convert a raw string to a base-64 string
     */
    Crypto.rstr2b64 = function(input, b64pad)
    {
      try { b64pad } catch(e) { b64pad='='; }
      var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var output = "";
      var len = input.length;
      for(var i = 0; i < len; i += 3)
      {
        var triplet = (input.charCodeAt(i) << 16)
                    | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                    | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
        for(var j = 0; j < 4; j++)
        {
          if(i * 8 + j * 6 > input.length * 8) output += b64pad;
          else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
        }
      }
      return output;
    }

    /*
     * Convert a raw string to an arbitrary string encoding
     */
    Crypto.rstr2any = function(input, encoding)
    {
      var divisor = encoding.length;
      var i, j, q, x, quotient;

      /* Convert to an array of 16-bit big-endian values, forming the dividend */
      var dividend = Array(Math.ceil(input.length / 2));
      for(i = 0; i < dividend.length; i++)
      {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
      }

      /*
       * Repeatedly perform a long division. The binary array forms the dividend,
       * the length of the encoding is the divisor. Once computed, the quotient
       * forms the dividend for the next step. All remainders are stored for later
       * use.
       */
      var full_length = Math.ceil(input.length * 8 /
                                        (Math.log(encoding.length) / Math.log(2)));
      var remainders = Array(full_length);
      for(j = 0; j < full_length; j++)
      {
        quotient = Array();
        x = 0;
        for(i = 0; i < dividend.length; i++)
        {
          x = (x << 16) + dividend[i];
          q = Math.floor(x / divisor);
          x -= q * divisor;
          if(quotient.length > 0 || q > 0)
            quotient[quotient.length] = q;
        }
        remainders[j] = x;
        dividend = quotient;
      }

      /* Convert the remainders to the output string */
      var output = "";
      for(i = remainders.length - 1; i >= 0; i--)
        output += encoding.charAt(remainders[i]);

      return output;
    }

    /*
     * Encode a string as utf-8.
     * For efficiency, this assumes the input is valid utf-16.
     */
    Crypto.str2rstr_utf8 = function(input)
    {
      var output = "";
      var i = -1;
      var x, y;

      while(++i < input.length)
      {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
        {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i++;
        }

        /* Encode output as utf-8 */
        if(x <= 0x7F)
          output += String.fromCharCode(x);
        else if(x <= 0x7FF)
          output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                        0x80 | ( x         & 0x3F));
        else if(x <= 0xFFFF)
          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                        0x80 | ((x >>> 6 ) & 0x3F),
                                        0x80 | ( x         & 0x3F));
        else if(x <= 0x1FFFFF)
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                        0x80 | ((x >>> 12) & 0x3F),
                                        0x80 | ((x >>> 6 ) & 0x3F),
                                        0x80 | ( x         & 0x3F));
      }
      return output;
    }

    /*
     * Encode a string as utf-16
     */
    Crypto.str2rstr_utf16le = function(input)
    {
      var output = "";
      for(var i = 0; i < input.length; i++)
        output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                      (input.charCodeAt(i) >>> 8) & 0xFF);
      return output;
    }

    Crypto.str2rstr_utf16be = function(input)
    {
      var output = "";
      for(var i = 0; i < input.length; i++)
        output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                       input.charCodeAt(i)        & 0xFF);
      return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    Crypto.rstr2binl = function(input)
    {
      var output = Array(input.length >> 2);
      for(var i = 0; i < output.length; i++)
        output[i] = 0;
      for(var i = 0; i < input.length * 8; i += 8)
        output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
      return output;
    }

    /*
     * Convert an array of little-endian words to a string
     */
    Crypto.binl2rstr = function(input)
    {
      var output = "";
      for(var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
      return output;
    }

    /*
     * Convert a raw string to an array of big-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    Crypto.rstr2binb = function(input)
    {
      var output = Array(input.length >> 2);
      for(var i = 0; i < output.length; i++)
        output[i] = 0;
      for(var i = 0; i < input.length * 8; i += 8)
        output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
      return output;
    }

    /*
     * Convert an array of big-endian words to a string
     */
    Crypto.binb2rstr = function(input)
    {
      var output = "";
      for(var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
      return output;
    }

// LOGICAL & ARITHMETIC OPERATIONS

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    Crypto.safe_add = function(x, y)
    {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    Crypto.bit_rol = function(num, cnt)
    {
      return (num << cnt) | (num >>> (32 - cnt));
    }

    Crypto.byte_swap = function(x, wordLength) {
        var intsPerWord =  wordLength / 32;

        for (var i = 0; i < x.length; i += intsPerWord) {
            var int32 = 0;
            while (i + int32 < i + (intsPerWord - int32 - 1)) {
                var l = x[i + int32],
                r = x[i + (intsPerWord - int32 - 1)];

                x[i + (intsPerWord - int32 - 1)] = ((l & 0xFF) << 24)
                                + (((l >> 8) & 0xFF) << 16)
                                + (((l >> 16) & 0xFF) << 8)
                                + ((l >> 24) & 0xFF);
                x[i + int32] = ((r & 0xFF) << 24)
                                + (((r >> 8) & 0xFF) << 16)
                                + (((r >> 16) & 0xFF) << 8)
                                + ((r >> 24) & 0xFF);
                int32 += 1;
            }
            
            //and the middle one...
            if (i + int32 === i + (intsPerWord - int32 - 1)){
                x[i + int32] = ((x[i + int32] & 0xFF) << 24)
                                + (((x[i + int32] >> 8) & 0xFF) << 16)
                                + (((x[i + int32] >> 16) & 0xFF) << 8)
                                + ((x[i + int32] >> 24) & 0xFF);
            }
        }
    }



// HMAC functions
    /*
     * Calculate the HMAC, of a key and some data (hex string)
     */
    Crypto.hmacHexStr2Hex = function(key, data, hashFunc)
    {
        return Crypto.rstr2hex(Crypto.hmacRStr(
                Crypto.hex2rstr(key),
                Crypto.hex2rstr(data),
                hashFunc));
    }

    Crypto.hmacUtf8Str2Hex = function(key, data, hashFunc)
    {
        return Crypto.rstr2hex(Crypto.hmacRStr(
                Crypto.str2rstr_utf8(key),
                Crypto.str2rstr_utf8(data),
                hashFunc));
    }

    /*
     * Calculate the HMAC, of a key and some data (rstring in out)
     */
    Crypto.hmacRStr = function(key, data, hashFunc)
    {
        var toRStrFunc = hashFunc.bigEndian ? Crypto.binb2rstr : Crypto.binl2rstr;
        var toBinFunc  = hashFunc.bigEndian ? Crypto.rstr2binb : Crypto.rstr2binl;

        return toRStrFunc(
            Crypto.hmacBin(
                toBinFunc(key), key.length,
                toBinFunc(data), data.length,
                hashFunc)
            );
    }
    /*
     * Calculate the HMAC, of a key and some data (binary in/out)
     */
    Crypto.hmacBin = function(key, keyLen, data, dataLen, hashFunc)
    {
        var len = hashFunc.hashLength;
        var blockSize;

        if(key.length > len)
            key = hashFunc.fromBin(key, keyLen * 8);

        //defualt blocksize to 64 bytes
        if (hashFunc.hmacBlockSize != undefined) {
            blockSize = hashFunc.hmacBlockSize;
        } else {
            blockSize = 512;
        }

        var padSize = blockSize/32;
        var ipad = Array(padSize), opad = Array(padSize);
        for(var i = 0; i < padSize; i++)
        {
            ipad[i] = key[i] ^ 0x36363636;
            opad[i] = key[i] ^ 0x5C5C5C5C;
        }

        var hash = hashFunc.fromBin(ipad.concat(data), blockSize + dataLen * 8);
        return hashFunc.fromBin(opad.concat(hash), blockSize + len * 8);
    }

    return Crypto;
});
