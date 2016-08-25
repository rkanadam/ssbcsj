((function ($) {




    $(document).ajaxStart(function () {
        window.scrollTo(0, 0);
        $("#indicator").show();
    });
    $(document).ajaxStop(function () {
        $("#indicator").hide();
    });


})(jQuery));