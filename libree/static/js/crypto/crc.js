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
            this.polynomial = 0x04C11DB7;
            this.finalXORValue = 0xFFFFFFFF;
            this.initialValue = 0xFFFFFFFF;
            this.bits = 32;
        };

        CRC.prototype.bigEndian = false;
        
        CRC.prototype.configure = function(c) {
            if (c.preset) { 
                if (c.preset == 'crc16-ccitt') {
                    this.polynomial = 0x1021;
                    this.finalXORValue = 0;
                    this.initialValue = 0xFFFFFFFF;
                    this.bits = 16;
                } else if ( c.preset == 'crc32') {
                    this.polynomial = 0x04C11DB7;
                    this.finalXORValue = 0xFFFFFFFF;
                    this.initialValue = 0xFFFFFFFF;
                    this.bits = 32;
                }
            }
            return this;
        }
        
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

        /*
         * Calculate the CRC of an array of big-endian words, and a bit length.
         */
        CRC.prototype.fromBin = function(x, len) {
            var crc = this.initialValue;
            var table = [], i, j, c;
 
            for (i = 255; i >= 0; i--) {
                c = reverse(i, this.bits);
 
                for (j = 0; j < 8; j++) {
                    c = ((c * 2) ^ (((c >>> 31) % 2) * this.polynomial)) >>> 0;
                }
                
                table[i] = reverse(c, this.bits);
            }
 
            for (i = 0; i < (len >>> 3); i++) {
                c = (x[i >>> 2] >>> ((i%4) << 3)) & 0xFF;
                j = (crc % 256) ^ c;
                crc = ((crc / 256) ^ table[j]) >>> 0;
            }
            
            j = [crc ^ this.finalXORValue];
            Crypto.byte_swap(j, 32);
 
            return j;
        }
        
        return CRC;
});
