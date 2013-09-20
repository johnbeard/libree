define(["../libree_tools"],
    function(Libree) {
        
    var makeBindings = function () {
        
    }

    $( document ).ready(function () {
        
        makeBindings();
        Libree.setupTool();
        
        // Check for the various File API support.
        if (!Libree.supportsFile()) {
            $('#b64-warnings')
                .empty()
                .append($("<div>", {'class':'alert alert-danger'})
                    .text('This browser does not fully support the HTML5 File API. This is required to use the Base64 converter.')
                )
        }
    });
});
