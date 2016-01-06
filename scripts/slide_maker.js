(function ($) {
    $(function () {

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

        if (window.google) {
            google.script.run
                .withSuccessHandler(function (bhajans) {
                    bhajans.sort(function (b1, b2) {
                        return b1[0].toLocaleLowerCase() - b2[0].toLocaleLowerCase();
                    });

                    bhajans = $.map(bhajans, function (b) {
                        var bhajan = {};
                        bhajan.firstLine = $.trim(b[0].split("\n")[0]);
                        bhajan.lyrics = b[0];
                        bhajan.meaning = b[1];
                        return bhajan;
                    });

                    var bhajanHound = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('firstLine'),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local: bhajans
                    });


                    bhajanHound.initialize();
                    $('#bhajanPicker').typeahead({
                            hint: true,
                            highlight: true,
                            minLength: 1
                        },
                        {
                            name: 'bhajanHound',
                            displayKey: 'firstLine',
                            limit: 15,
                            source: bhajanHound
                        }).on('typeahead:selected', function (e, bhajan) {
                            $("#lyrics textarea")
                                .val(bhajan.lyrics)
                            $("#meaning textarea")
                                .val(bhajan.meaning);
                        });
                    $("#bhajanPicker").parent(".twitter-typeahead").css("display", "block");
                })
                .withUserObject(this)
                .getDevotionalSongs();
        }

        $("#buttons").on("click", "a", function (e) {
            e.preventDefault();
            var $this = $(this);
            var href = $this.attr("href");
            $this.parents(".btn-group")
                .find("a").each(function () {
                    var id = $(this).attr("href");
                    $(id).hide();
                }).end().find("button .text").text($this.text());
            $(href).show();
            if (href === "#slideMaker") {
                google.script.run
                    .withSuccessHandler(function (sheet) {
                        console.log(sheet);
                        sheet = window.parse_bhajans(sheet);
                        console.log("After", sheet);
                    }).withUserObject(this)
                    .getCurrentSheet();
            }
        });
    });
})(jQuery);