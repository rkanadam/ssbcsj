(function ($) {

    $(function () {

        $(document).ajaxStart(function () {
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });


        $.getJSON("i2i/server/i2i.php", {"what": "schedule", "event": "sep25"}, function (events) {
            var groupedEvents = _.groupBy (events, function (e) { return e.location; })
            _.each (groupedEvents, function (events) {
                events.sort(function (e1, e2) {
                    var d1 = new Date(e1.start);
                    var d2 = new Date(e2.start);
                    if (d1.getTime() == d2.getTime()) {
                        var e1 = new Date (e1.end);
                        var e2 = new Date (e2.end);
                        return e1.start - e2.end;
                    } else {
                        return d1.getTime() - d2.getTime();
                    }
                });
            });

            _.each (groupedEvents, function (events, location) {
                var firstEvent = events.length ? events[0] : null;
                var lastEvent = events.length ? events[events.length - 1] : null;
                if (firstEvent && lastEvent) {

                }
            });

        });

    });

})(jQuery);