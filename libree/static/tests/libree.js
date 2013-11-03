
define(["../tools/libree_tools", "qunit"],
    function(Libree, Q) {

    return {run : function() {
		
        Q.module("Hex to binary");
        
        Q.test( "Null", function() {
            QUnit.equal(Libree.hexToBinary(""), "");
        });
        
        Q.test( "0 Hex to bin", function() {
            Q.equal(Libree.hexToBinary("0"), "0");
            Q.equal(Libree.hexToBinary("00"), "0");
            Q.equal(Libree.hexToBinary("0", true), "0000");
            Q.equal(Libree.hexToBinary("00", true), "00000000");
        });

        Q.test( "1 Hex to bin", function() {
            Q.equal(Libree.hexToBinary("1"), "1");
            Q.equal(Libree.hexToBinary("01"), "1");
            Q.equal(Libree.hexToBinary("1", true), "0001");
        });
        
        Q.test( "5 Hex to bin", function() {
            Q.equal(Libree.hexToBinary("5"), "101");
            Q.equal(Libree.hexToBinary("5", true), "0101");
        });
        
        Q.test( "AA Hex to bin", function() {
            Q.equal(Libree.hexToBinary("AA"), "10101010");
            Q.equal(Libree.hexToBinary("AA", true), "10101010");
        });
        
        Q.test( "ABCDEF9876543210 Hex to bin", function() {
            Q.equal(Libree.hexToBinary("ABCDEF9876543210"), 
            "1010101111001101111011111001100001110110010101000011001000010000");
        });
    }}
}); 
