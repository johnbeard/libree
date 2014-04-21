define(["jquery", "bootbox"], function($, bootbox) {

    var Github = function () {};

    var apiLimitReached = function() {
        bootbox.alert("Github API limit reached!");


    }

    Github.prototype.getContent = function (url, successFn) {
        $.ajax({
            url: url,
            dataType: 'jsonp',
            success: function(results)
            {
                if (results.meta.status == 200) {

                    // strip out newlines
                    //var content = atob(results.data.content.replace(/\s/g, ''));
                    var content = atob(results.data.content.replace(/\s/g, ''));
                    successFn(content);
                } else if (results.meta["X-RateLimit-Remaining"] == 0) {
                    apiLimitReached()
                }
            }
        });
    }

    return Github;

});
