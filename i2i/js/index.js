(function ($) {

    $(function () {

        $(document).ajaxStart(function () {
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });


        $.get("i2i/server/i2i.php", {"what": "schedule", "event": "sep25"}, function (events) {

        });

    });

})(jQuery);