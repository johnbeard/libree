define(["../../js/bignumber", "../../js/ieee754", "../libree_tools"],
    function(BigDecimal, IEEE754, Libree) {
    
    var makeBindings = function () {
        
        var a = new IEEE754();
        
        var status = a.parseBinary(32, '00000001');
        
        var s = a.toDecimal();
    }
    
    var initialSetup = function () {
        
    };

    $( document ).ready(function () {
        makeBindings();
        Libree.setupTool();
        initialSetup();
    });
});
