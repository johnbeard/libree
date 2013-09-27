define(["../libree_tools", "../../js/base64"], function(Libree) {
    
    var inputMethod = 'text';
    var outputMethod;
    
    var printB64 = function (b64) {        
        var lineLength = parseInt($('#lineLength').val());
        var out = '';
        
        $('#output-textbox').empty();

        for (var offset = 0, strLen = b64.length; offset < strLen; offset += lineLength) {

            out += (offset > 0)? '\n' : '';
            out += b64.slice(offset, lineLength + offset);
        }
        
        $('#output-textbox').val(out).removeClass('error-box');
    }
    
    var decode = function () {
        try {
            $('#input-textbox').empty();
            
            var b6 = $('#output-textbox').val().replace(/\s/g, "");
            var text = window.atob(b6);
            
            $('#input-textbox').val(text)
            
            $('#output-textbox').removeClass('error-box');
        } catch (err) {
            if (err instanceof DOMException)
                $('#output-textbox').addClass('error-box');
        }
    }
    
    var outputChanged = function () {
        switchInputMethod('text');
        decode();
    }
    
    var encode = function () {

        if (inputMethod === 'text') {
            var b64 = window.btoa($("#input-textbox").val());
            printB64(b64);
        } else if (inputMethod === 'file') {
            var file = $('#input-filechooser').get(0).files[0];
            
            var fr = new FileReader();
            
            fr.onload = (function() {
                return function(e) {
                    var b64 = e.target.result.split(',')[1];
                    printB64(b64);
                };
            })(file);
            
            fr.readAsDataURL( file );
        }
    }
    
    // internal changed - updage buttons and areas
    var switchInputMethod = function(newMethod) {
        $('.input-area').addClass('hidden');
        
        inputMethod = newMethod;
        
        //activate the right button
        $('#input-select .btn').removeClass('active');
        $('#' + 'input-' + inputMethod).addClass('active');
        
        //show the right area
        $('#' + inputMethod + '-input').removeClass('hidden');
    }
    
    // button was pressed - update internals and areas
    var inputMethodChanged = function() {
        $('.input-area').addClass('hidden');
        
        var id = $('#input-select .btn.active').attr('id');
        
        var old = inputMethod;

        inputMethod = id.split('-')[1];
        
        // convert the input data to the new stylee
        if (old !== inputMethod) {
            
        }
        
        //show the right input area
        var areaId;
        if (inputMethod === 'hex')
            areaId = 'text-input';
        else
            areaId = inputMethod + '-input';
        
        $('#' + areaId).removeClass('hidden');
    }
        
    var typingTimer;
    var makeBindings = function () {
        Libree.setupToggleButton("#input-select", inputMethodChanged);
        
        $('#input-filechooser').change( function() { 
            encode();
        });
        
        $('#lineLength').change( function () {
            //re-parse with new line length
            printB64($('#output-textbox').val().replace(/\s/g, ""));
        });
        
        Libree.doneTyping("#input-textbox", typingTimer, 500, encode);
        
        Libree.doneTyping("#output-textbox", typingTimer, 500, outputChanged);
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
