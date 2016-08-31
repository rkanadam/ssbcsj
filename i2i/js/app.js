requirejs.config({
    "baseUrl": "i2i/js"
});

requirejs(["lib/init"], function () {
    requirejs.config({
        "paths": {
            "app": "app"
        }
    });
    requirejs(["app/main"]);
});

