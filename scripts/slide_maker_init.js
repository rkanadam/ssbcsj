var script = document.createElement('script');
script.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js');
document.head.appendChild(script);
jQuery(function () {
    $.get("../slide_maker.html", {}, function (dom) {
        $("head > *", dom).each(function () {
            $(this).appendTo("head");
        });
        $("body").html($("body", dom).html());
    }, "html");
});