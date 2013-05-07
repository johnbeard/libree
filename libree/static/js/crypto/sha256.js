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

        var SHA256 = function () {};

        SHA256.prototype.hashLength = 32;
        SHA256.prototype.bigEndian = true;

        var sha256_S = function(X, n) {return ( X >>> n ) | (X << (32 - n));};
        var sha256_R = function(X, n) {return ( X >>> n );}
        var sha256_Ch = function(x, y, z) {return ((x & y) ^ ((~x) & z));}
        var sha256_Maj = function(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}
        var sha256_Sigma0256 = function(x) {return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));}
        var sha256_Sigma1256 = function(x) {return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));}
        var sha256_Gamma0256 = function(x) {return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));}
        var sha256_Gamma1256 = function(x) {return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));}
        var sha256_Sigma0512 = function(x) {return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));}
        var sha256_Sigma1512 = function(x) {return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));}
        var sha256_Gamma0512 = function(x) {return (sha256_S(x, 1)  ^ sha256_S(x, 8) ^ sha256_R(x, 7));}
        var sha256_Gamma1512 = function(x) {return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));}

        var sha256_K = new Array (
            1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
            -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
            1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
            264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
            -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
            113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
            1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
            -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
            430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
            1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
            -1866530822, -1538233109, -1090935817, -965641998
        );

        /*
         * Calculate the SHA256 of an array of big-endian words, and a bit length.
         */
        SHA256.prototype.fromBin = function(m, l) {
            var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
                               1359893119, -1694144372, 528734635, 1541459225);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h;
            var i, j, T1, T2;

            /* append padding */
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;

            for(i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];

                for(j = 0; j < 64; j+=1) {
                    if (j < 16) {
                        W[j] = m[j + i];
                    } else {
                        W[j] = Crypto.safe_add(
                                Crypto.safe_add(
                                    Crypto.safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                                    sha256_Gamma0256(W[j - 15])),
                                W[j - 16]
                            );
                    }

                    T1 = Crypto.safe_add(
                            Crypto.safe_add(
                                Crypto.safe_add(
                                    Crypto.safe_add(h, sha256_Sigma1256(e)),
                                    sha256_Ch(e, f, g)),
                                sha256_K[j]),
                            W[j]);

                    T2 = Crypto.safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
                    h = g;
                    g = f;
                    f = e;
                    e = Crypto.safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = Crypto.safe_add(T1, T2);
                }

                HASH[0] = Crypto.safe_add(a, HASH[0]);
                HASH[1] = Crypto.safe_add(b, HASH[1]);
                HASH[2] = Crypto.safe_add(c, HASH[2]);
                HASH[3] = Crypto.safe_add(d, HASH[3]);
                HASH[4] = Crypto.safe_add(e, HASH[4]);
                HASH[5] = Crypto.safe_add(f, HASH[5]);
                HASH[6] = Crypto.safe_add(g, HASH[6]);
                HASH[7] = Crypto.safe_add(h, HASH[7]);
            }
            return HASH;
        }

        return SHA256;
});
