// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
    "shim": {
        "bootstrap": { "deps": ["jquery"] }
    },
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
        "underscore": "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
        "html5shiv": "//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min",
        "respond": "//oss.maxcdn.com/respond/1.4.2/respond.min",
        "moment": "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment-with-locales"
    }
});