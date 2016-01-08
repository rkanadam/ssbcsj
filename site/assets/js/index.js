(function ($) {
    $(function () {

        $.get("server/docs.php?action=main", function (html) {
            var dom = $.parseHTML(html);
            var contents = $(dom).map(function () {
                return $(this).attr("id") === "contents" ? this : undefined;
            });
            $("#mainContent").html($(contents).html());
        }, "html");
    });
})(jQuery);