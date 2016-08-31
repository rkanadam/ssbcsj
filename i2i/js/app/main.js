define(["jquery", "underscore", "lib/db", "app/constants", "moment", "bootstrap", "html5shiv", "respond"], function ($, _, AppDatabase, k, moment) {
    $(document).ajaxStart(function () {
        $("#indicator").show();
    });
    $(document).ajaxStop(function () {
        $("#indicator").hide();
    });

    var db = new AppDatabase(k.appName);

    db.load().then(function () {
        return $.getJSON(k.apiEndpoint + "/i2i.php", {"what": "schedule", "event": "sep25"});
    }).done(function (events) {
        var groupedEvents = _.groupBy(events, function (e) {
            return e.location;
        })
        _.each(groupedEvents, function (events) {
            events.sort(function (e1, e2) {
                var d1 = new Date(e1.start);
                var d2 = new Date(e2.start);
                if (d1.getTime() == d2.getTime()) {
                    var e1 = new Date(e1.end);
                    var e2 = new Date(e2.end);
                    return e1.start - e2.end;
                } else {
                    return d1.getTime() - d2.getTime();
                }
            });
        });

        var $schedule = $("#schedule");
        var $panel = $schedule.find(".oneLocation").remove();

        _.each(groupedEvents, function (events, location) {
            var firstEvent = events.length ? events[0] : null;
            var lastEvent = events.length ? events[events.length - 1] : null;
            if (firstEvent && lastEvent) {
                var $aLocation = $panel.clone();

                var centerName = db.get(location);
                $aLocation.find(".panel-title").text(centerName || location);

                $aLocation.find(".address_link").attr("href", "https://www.google.com/maps/dir/''/" + encodeURIComponent(location));
                $aLocation.find(".address_link").attr("target", "_blank");
                $aLocation.find(".address").text(location);


                var $table = $aLocation.find(".panel-body table");
                var $tr = $table.find("tr").remove();
                _.each(events, function (event) {
                    var start = moment(event.start);
                    var end = moment(event.end);

                    var $event = $tr.clone();
                    if (start.format("A") === end.format("A")) {
                        $event.find("th").text(start.format("hh:mm") + "-" + end.format("hh:mm A"));
                    } else {
                        $event.find("th").text(start.format("hh:mm A") + "-" + end.format("hh:mm A"));
                    }
                    $event.find("td").text(event.summary);
                    $table.append($event)

                });
                $schedule.append($aLocation);
            }
        });
    });
});