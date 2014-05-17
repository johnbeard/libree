define(["jquery","github", "bootbox"], function($, Github, Bootbox) {

    (function($) {
        $.QueryString = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
                var p=a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'))
    })($);

    (function($) {
        $.RandString = function (n) {
            n = n || 10;

            var text = '';
            var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for(var i = 0; i < n; i++) {
                text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            }

            return text;
        }
    })($)

    var authDoneCallback = null;

    var getToken = function () {
        var githubAuth = JSON.parse(localStorage.getItem("auth.github"));
        return githubAuth && githubAuth.accessToken;
    }

    var initGithubObject = function () {
        var token = getToken();
        var github;

        if (token) {
            // try to use the token from storage
            github = new Github({token: token,
                                 auth: "oauth"
                                });
        }
        return github;
    }

    var instance = null;

    Github.getInstance = function () {
        return this.instance;
    }

    Github.executeIfNoAuthRequired = function (cb) {

        var github = initGithubObject();
        if (github) {
            this.instance = github;
            cb();
        }
    }

    Github.setupGithub = function (cb) {
        authDoneCallback = cb;

        if (this.instance) {
            authDoneCallback();
            return;
        }

        var github = initGithubObject();

        // either we have no token, or the one we had didn't work,
        // get another one!
        if (!github) {
            getGithubToken();
        } else {
            this.instance = github;
            authDoneCallback();
        }
    }

    var getGithubToken = function () {
        Bootbox.dialog({
            message: "A GitHub OAuth key is required to access the KiCad libraries. \
You authenticate with Github for access via LibrEE. \
Any stored API key is kept only in localStorage on your machine, and the \
LibrEE server does not see your Github credentials.",
            title: "GitHub authentication required",
            buttons: {
                main: {
                    label: "Authenticate",
                    className: "btn-primary",
                    callback: function(result) {
                        Github.goToAuth();
                    }
                }
            }
        });
    }

    Github.goToAuth = function () {

        var githubAuth = {
            preAuthOriginUri:  window.location.pathname,
            scope: "public_repo",
            state: $.RandString(20),
            redirectUri: "/auth/github", //TODO fix hardcoded url
            clientId: "784a03d1cbb34b2a25c2" //TODO put this in settings
        };

        localStorage.setItem("auth.github", JSON.stringify(githubAuth));

        var uri = "https://github.com/login/oauth/authorize?" +
            "client_id=" + githubAuth.clientId +
            "&state=" + githubAuth.state +
            "&redirect_uri=http://" + window.location.host + githubAuth.redirectUri +
            "&scope=" + githubAuth.scope;
        // go to the github auth endpoint
        window.open(uri, '_blank');
    };

    var handleAccessToken = function (fromGithub) {
        var githubAuth = JSON.parse(localStorage.getItem("auth.github"));

        var tokenData = JSON.parse(fromGithub);

        var newGithubAuth = {};
        var token = tokenData["access_token"];

        if ("access_token" in tokenData) {
            newGithubAuth["accessToken"] = token;
        }

        //could check for scope agreement here

        //save the token back to the local storage
        localStorage.setItem("auth.github", JSON.stringify(newGithubAuth));

        // and send back to whoever asked for auth
        window.opener.postMessage(token, window.location);

        //and close this window...
        window.close();
    }

    // callback from other window -  try to setup again
    window.addEventListener('message', function () {
        //var token = event.data;
        Github.setupGithub(authDoneCallback);
    });

    // implement the LibrEE auth callback API
    Github.authCallback = function () {

        var githubAuth = JSON.parse(localStorage.getItem("auth.github"));

        // now we need to get the code and turn it into an access token
        // we need to ask the librEE server for this, as it needs the
        // client secret

        $.ajax({
            url: "/auth/internal/github?code=" + $.QueryString["code"],
            success: handleAccessToken
        });
    }

    return Github;
});
