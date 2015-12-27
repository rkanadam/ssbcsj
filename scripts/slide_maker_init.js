(function () {
    window.onSlideMakerLoad = function (html) {
        document.open("text/html");
        document.write(html);
        document.close();
    };
    var script = document.createElement('script');
    script = document.createElement('script');
    script.setAttribute('src', "slide_maker.php?callback=onSlideMakerLoad");
    document.head.appendChild(script);
})();
