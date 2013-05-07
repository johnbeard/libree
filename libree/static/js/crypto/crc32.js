/*!
* crypto-tiger module Version 0.1.0-20130605
* Copyright 2013, John Beard
*           2011, Alexander Okrugin (http://ideone.com/LYNnw)
*
* Originally based on C code by Alexei Kravchenko and Markku-Juhani Saarinen
*
* Part of the LibrEE project: https://github.com/inductiveload/libree
*
* Licensed under the GNU Lesser General Public License (LGPL) Version 3.
*
* For the full license text see the enclosed LGPL-LICENSE.TXT, or go to:
* https://github.com/nikola/gruft/LGPL-LICENSE.txt
*
* If you are using this library for commercial purposes, please consider
* purchasing a commercial license. Visit the project homepage for more
* details.
*/

define(["../../js/crypto/common"], function(Crypto) {
        "use strict";

        function CRC () {

        };

        CRC.prototype.hashLength = 4;
        CRC.prototype.bigEndian = false;
        
        var polynomial = 0x04C11DB7;

        /*
         * Calculate the CRC of an array of big-endian words, and a bit length.
         */
        CRC.prototype.fromBin = function(msg, len) {

            var initialValue = 0xFFFFFFFF;
            var finalXORValue = 0xFFFFFFFF;
            var crc = initialValue,
            var table = [], i, j, c;
 
            function reverse(x, n) {
                var b = 0;
                while (n) {
                    b = b * 2 + x % 2;
                    x /= 2;
                    x -= x % 1;
                    n--;
                }
                return b;
            }
 
            for (i = 255; i >= 0; i--) {
                c = reverse(i, 32);
 
                for (j = 0; j < 8; j++) {
                    c = ((c * 2) ^ (((c >>> 31) % 2) * polynomial)) >>> 0;
                }
 
                table[i] = reverse(c, 32);
            }
 
            for (i = 0; i < s.length; i++) {
                j = (crc % 0xFF) ^ (x[i >>> 2] >>> ((i%4) << 3)) & 0xFF;
                crc = ((crc / 0xFF) ^ table[j]) >>> 0;
            }
 
            return (crc ^ finalXORValue) >>> 0;
        }
        
        return GOST;
});
