(function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js');
    script.onload = function () {
        $.ajax({
            url: "slide_maker.php",
            jsonp: "callback",
            dataType: "jsonp",
            success: function (html) {
                document.open("text/html");
                document.write(html);
                document.close();
            }
        });
    };
    document.head.appendChild(script);
})();
