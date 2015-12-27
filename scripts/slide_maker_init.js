(function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js');
    script.onload = function () {
        jQuery.get("http://localhost/ssbcsj/slide_maker.php", {}, function (html) {
            document.open("text/html");
            document.write(html);
            document.close();
        }, "html");
    };
    document.head.appendChild(script);
}) ();
