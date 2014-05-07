define(["github", "bootbox"],
    function(Github, Bootbox) {

    var github = null;

    Github.setupGithub = function (cb) {

        var ghToken = localStorage.getItem('githubAPIToken');

        if (ghToken) {
            // try to use the token from storage
            github = new Github({token: ghToken,
                                 auth: "oauth"
                                });
        }

        // either we have no token, or the one we had didn't work,
        // get another one!
        if (!github) {
            ghToken = this.getGithubToken();
            return;
        } else {
            cb(github);
        }
    }

    Github.getGithubToken = function () {

        this.goToAuth();
/*
        Bootbox.dialog({
            message: "A GitHub OAuth key is required to access the KiCad libraries. Please enter it below.\
It will be stored only on your machine, and will not be sent to LibrEE\
<input id='githubToken' style='width:100%' />",
            title: "GitHub OAuth key required",
            buttons: {
                main: {
                    label: "OK",
                    className: "btn-primary",
                    callback: function(result) {
                        githubToken = $('input#githubToken').val().trim();
                        localStorage.setItem('githubAPIToken', githubToken);
                        console.log("Settings gh token: " + githubToken);
                        setupGithub();
                    }
                }
            }
        });*/
    }

    Github.goToAuth = function () {

        uri = "https://github.com/login/oauth/authorize?" + "client_id=" + "784a03d1cbb34b2a25c2" + "&state=tool/kicad_viewer|qwertyuiop" + "&redirect_uri=" + "http://localhost:8000/tool/kicad_viewer" + "&scope=" + "public_repo";

        window.location.href = uri;

    };

    return Github;
});
