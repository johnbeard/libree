/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

define(["../../js/crypto/common"], function(Crypto) {
    "use strict";

    var SHA1 = function () {};

    SHA1.prototype.hashLength = 20;
    SHA1.prototype.bigEndian = true;
    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    SHA1.prototype.fromBin = function(x, len)
    {
      /* append padding */
      x[len >> 5] |= 0x80 << (24 - len % 32);
      x[((len + 64 >> 9) << 4) + 15] = len;

      var w = Array(80);
      var a =  1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d =  271733878;
      var e = -1009589776;

      for(var i = 0; i < x.length; i += 16)
      {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;

        for(var j = 0; j < 80; j++)
        {
          if(j < 16) w[j] = x[i + j];
          else w[j] = Crypto.bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
          var t = Crypto.safe_add(Crypto.safe_add(Crypto.bit_rol(a, 5), sha1_ft(j, b, c, d)),
                           Crypto.safe_add(Crypto.safe_add(e, w[j]), sha1_kt(j)));
          e = d;
          d = c;
          c = Crypto.bit_rol(b, 30);
          b = a;
          a = t;
        }

        a = Crypto.safe_add(a, olda);
        b = Crypto.safe_add(b, oldb);
        c = Crypto.safe_add(c, oldc);
        d = Crypto.safe_add(d, oldd);
        e = Crypto.safe_add(e, olde);
      }
      return Array(a, b, c, d, e);
    }

    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    var sha1_ft = function(t, b, c, d)
    {
      if(t < 20) return (b & c) | ((~b) & d);
      if(t < 40) return b ^ c ^ d;
      if(t < 60) return (b & c) | (b & d) | (c & d);
      return b ^ c ^ d;
    }

    /*
     * Determine the appropriate additive constant for the current iteration
     */
    var sha1_kt = function(t)
    {
      return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
             (t < 60) ? -1894007588 : -899497514;
    }

    return SHA1;
});
