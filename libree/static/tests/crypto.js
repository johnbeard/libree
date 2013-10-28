
define(["qunit",
	"../js/crypto/common",
    "../js/crypto/md5",
    "../js/crypto/sha1",
    "../js/crypto/ripemd160",
    "../js/crypto/sha256",
    "../js/crypto/sha512",
    "../js/crypto/tiger",
    "../js/crypto/gost",
    "../js/crypto/crc",
    ],
    function(Q, Crypto, MD5, SHA1, RMD160, SHA256, SHA512, TIGER, GOST, CRC) {

    return { run: function() {



        var nullStr = "";
        var qbfStr = "The quick brown fox jumps over the lazy dog.";
        var lorem1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam semper mauris ut augue rutrum ornare. Fusce ac sapien urna, dictum tincidunt quam. Vestibulum felis nibh, aliquet id fermentum ullamcorper, posuere ac arcu. Aenean eget urna quam. Donec mauris enim, malesuada id auctor in, vestibulum at nulla. Integer ante est, mollis tincidunt luctus a, blandit vestibulum odio. Donec quis neque quis nulla facilisis mollis. Mauris sollicitudin fermentum quam, id cursus augue aliquam at. Quisque ante ipsum, lacinia non tempus quis, lobortis a mi. Suspendisse viverra dapibus nisl ac pharetra."
        var hexStr = "71:69:55:63:6b:62:72:6f:77:6e:46:6f:78:26:5e:21:22:5f"



        module("CRC");
        
        test( "CRC32", function() {
            equal(Crypto.hashUtf8Str2Hex("test", new CRC()),
                "d87f7e0c"
            );
        });
        
        test( "CRC32 QBF", function() {
            equal(Crypto.hashUtf8Str2Hex("The quick brown fox jumps over the lazy dog", new CRC()),
                "414fa339"
            );
        });
        
        test( "CRC16-CCITT", function() {
            var hash = new CRC().configure({preset: 'crc16-ccitt'});
            equal(Crypto.hashHexStr2Hex("12345670", hash),
                "b1e4"
            );
        });
        
        module("MD5");
        test( "Empty string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, new MD5()),
                "d41d8cd98f00b204e9800998ecf8427e"
            );
        });

        test( "Quick brown fox", function() {
            equal(Crypto.hashUtf8Str2Hex(qbfStr, new MD5()),
                "e4d909c290d0fb1ca068ffaddf22cbd0"
            );
        });

        test( "Hex String", function() {
            equal(Crypto.hashHexStr2Hex(hexStr, new MD5()),
                "9d5f397093ddee5c708b83daee0748d9"
            );
        });

        test( "HMAC", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', 'msg', new MD5()),
                "18e3548c59ad40dd03907b7aeee71d67"
            );
        });

        test( "HMAC (long key, long msg)", function() {
            equal(Crypto.hmacUtf8Str2Hex(lorem1, lorem1, new MD5()),
                "5de45bf4b9c5529aad5ef931143fa229"
            );
        });

        test( "HMAC (hex string)", function() {
            equal(Crypto.hmacHexStr2Hex('6b:65:79', '6d:73:67', new MD5()),
                "18e3548c59ad40dd03907b7aeee71d67"
            );
        });

        module("SHA1");
        plainSha1 = new SHA1();
        test( "Empty string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainSha1),
                "da39a3ee5e6b4b0d3255bfef95601890afd80709"
            );
        });

        test( "Quick brown fox", function() {
            equal(Crypto.hashUtf8Str2Hex(qbfStr, plainSha1),
                "408d94384216f890ff7a0c3528e8bed1e0b01621"
            );
        });

        test( "HMAC (null-null)", function() {
            equal(Crypto.hmacUtf8Str2Hex('', '', plainSha1),
                "fbdb1d1b18aa6c08324b7d64b71fb76370690e1d"
            );
        });

        test( "HMAC (null-msg)", function() {
            equal(Crypto.hmacUtf8Str2Hex('', 'msg', plainSha1),
                "1df552b90836e9881b1873998715838bf13ae65e"
            );
        });

        test( "HMAC (key-null)", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', '', plainSha1),
                "f42bb0eeb018ebbd4597ae7213711ec60760843f"
            );
        });

        test( "HMAC (key-msg)", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', 'msg', plainSha1),
                "102900b72b7bf1031eec76b4804b66052376896b"
            );
        });

        module("SHA256");
        plainSha256 = new SHA256();
        test( "Empty string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainSha256),
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            );
        });

        test( "HMAC", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', 'msg', plainSha256),
                "2d93cbc1be167bcb1637a4a23cbff01a7878f0c50ee833954ea5221bb1b8c628"
            );
        });

        module("SHA512");
        plainSha512 = new SHA512();
        test( "Empty string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainSha512),
                "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
            );
        });

        test( "Quick brown fox", function() {
            equal(Crypto.hashUtf8Str2Hex(qbfStr, plainSha512),
                "91ea1245f20d46ae9a037a989f54f1f790f0a47607eeb8a14d12890cea77a1bbc6c7ed9cf205e67b7f2b8fd4c7dfd3a7a8617e45f3c463d481c7e586c39ac1ed"
            );
        });

        test( "HMAC (null-null)", function() {
            equal(Crypto.hmacUtf8Str2Hex('', '', plainSha512),
                "b936cee86c9f87aa5d3c6f2e84cb5a4239a5fe50480a6ec66b70ab5b1f4ac6730c6c515421b327ec1d69402e53dfb49ad7381eb067b338fd7b0cb22247225d47"
            );
        });

        test( "HMAC (key-msg)", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', 'msg', plainSha512),
                "1e4b55b925ccc28ed90d9d18fc2393fcbe164c0d84e67e173cc5aa486b7afc106633c66bdc309076f5f8d9fdbbb62456f894f2c23377fbcc12f4ab2940eb6d70"
            );
        });

        test( "HMAC (long key, long msg)", function() {
            equal(Crypto.hmacUtf8Str2Hex(lorem1, lorem1, plainSha512),
                "67b8ac30cdd127c1f59567aa0458e432d9a974988fc2253bd9eb9f29a278674a07efd6f2a87d608ab13d61084b92ac3673be79621315e9a4bf983f95b3b53a01"
            );
        });

        module("RIPEMD-160");
        var plainRmd160 = new RMD160();
        test( "Empty string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainRmd160),
                "9c1185a5c5e9fc54612808977ee8f548b2258d31"
            );
        });

        test( "Quick brown fox", function() {
            equal(Crypto.hashUtf8Str2Hex(qbfStr, plainRmd160),
                "fc850169b1f2ce72e3f8aa0aeb5ca87d6f8519c6"
            );
        });

        test( "HMAC", function() {
            equal(Crypto.hmacUtf8Str2Hex('key', 'msg', plainRmd160),
                "af9f1041c7727ee3161fdbda8821364fb888a0e2"
            );
        });

        module("Tiger");

        //no config option doesn't store state
        var plainTiger = new TIGER();
        //note that these are all MSB first!
        test( "Null string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainTiger),
                "3293ac630c13f0245f92bbb1766e16167a4e58492dde73f3"
            );
        });

        test( "Tiger", function() {
            equal(Crypto.hashUtf8Str2Hex("Tiger", plainTiger),
                "dd00230799f5009fec6debc838bb6a27df2b9d6f110c7937"
            );
        });

        test( "QBF", function() {
            equal(Crypto.hashUtf8Str2Hex("The quick brown fox jumps over the lazy dog", plainTiger),
                "6d12a41e72e644f017b6f0e2f7b44c6285f06dd5d2c5b075"
            );
        });

        test( "QBF", function() {
            var hash = new TIGER();
            hash.configure({hashLength: 160});
            equal(Crypto.hashUtf8Str2Hex("The quick brown fox jumps over the lazy dog", hash),
                "6d12a41e72e644f017b6f0e2f7b44c6285f06dd5"
            );
        });

        test( "QBF", function() {
            var hash = new TIGER().configure({hashLength: 128});
            equal(Crypto.hashUtf8Str2Hex("The quick brown fox jumps over the lazy dog", hash),
                "6d12a41e72e644f017b6f0e2f7b44c62"
            );
        });

        test( "QBF", function() {
            var hash = new TIGER().configure({passes: 4});
            equal(Crypto.hashUtf8Str2Hex("The quick brown fox jumps over the lazy dog", hash),
                "c1f3a704e9f6267e9f75fa47191f83c354100a04c4f1dc6f"
            );
        });
        
        test( "Perl test", function() {
            var hash = new TIGER();
            equal(Crypto.hashUtf8Str2Hex("what do ya want for nothing?", hash),
                "0695d88720e3c513c4dee399f8299201ac915f5cf32fc1fa"
            );
        });
        
        // http://www.mail-archive.com/cryptography-digest@senator-bedfellow.mit.edu/msg03988.html
        // Perl MHash test program test vectors don't agree - byte ordering?
        // no-one else agrees on either, so maybe we're all doing it wrong?
        test( "HMAC", function() {
            var hash = new TIGER();
            equal(Crypto.hmacUtf8Str2Hex('Jefe', 'what do ya want for nothing?', hash),
                "3a351b1dec6075d6290e68b604e553821edc39041b82da83"
            );
        });

        module("GOST");

        //no config option doesn't store state
        var plainGOST = new GOST();
        //note that these are all MSB first!
        test( "Null string", function() {
            equal(Crypto.hashUtf8Str2Hex(nullStr, plainGOST),
                "981e5f3ca30c841487830f84fb433e13ac1101569b9c13584ac483234cd656c0"
            );
        });

        test( "abc", function() {
            equal(Crypto.hashUtf8Str2Hex("abc", plainGOST),
                "b285056dbf18d7392d7677369524dd14747459ed8143997e163b2986f92fd42c"
            );
        });

        test( "50 byte", function() {
            equal(Crypto.hashUtf8Str2Hex("Suppose the original message has length = 50 bytes", plainGOST),
                "c3730c5cbccacf915ac292676f21e8bd4ef75331d9405e5f1a61dc3130a65011"
            );
        });

        test( "32 byte", function() {
            equal(Crypto.hashUtf8Str2Hex("This is message, length=32 bytes", plainGOST),
                "2cefc2f7b7bdc514e18ea57fa74ff357e7fa17d652c75f69cb1be7893ede48eb"
            );
        });

        test( "U's", function() {
            equal(Crypto.hashUtf8Str2Hex("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU", plainGOST),
                "1c4ac7614691bbf427fa2316216be8f10d92edfd37cd1027514c1008f649c4e8"
            );
        });

        test( "Test params, null", function() {
            var hash = new GOST().configure({'testParams': true});
            equal(Crypto.hashUtf8Str2Hex(nullStr, hash),
                "ce85b99cc46752fffee35cab9a7b0278abb4c2d2055cff685af4912c49490f8d"
            );
        });

        test( "Test params, a", function() {
            var hash = new GOST().configure({'testParams': true});
            equal(Crypto.hashUtf8Str2Hex('a', hash),
                "d42c539e367c66e9c88a801f6649349c21871b4344c6a573f849fdce62f314dd"
            );
        });

        //from Perl MHash test program
        test( "HMAC, test params", function() {
            var hash = new GOST().configure({'testParams': true});
            equal(Crypto.hmacUtf8Str2Hex('Jefe', 'what do ya want for nothing?', hash),
                "f21d212cec23fa36bd729ba41207e1e9dac81f3672aa6a8e3e739612a25c10b8"
            );
        });

    }};

});
