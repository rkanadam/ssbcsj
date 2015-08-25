(function ($) {
    $(function () {
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var getUserFriendlyDayName = function (date) {
            if (!date) {
                return "";
            }
            var now = new Date();
            var names = ["Day Before Yesterday", "Yesterday", "Today", "Tomorrow", "Day After Tomorrow"];

            now.setDate(now.getDate() - 2);
            for (var i = 0; i < names.length; ++i) {
                if (now.getDate() === date.getDate() && now.getMonth() === date.getMonth() && now.getYear() === date.getYear()) {
                    return names[i];
                }
                now.setDate(now.getDate() + 1);
            }
            return days[date.getDay()];
        };

        var getUserFriendlyTime = function (start, end) {
            if (start.getHours() > 12 && end.getHours() > 12) {
                return (start.getHours() - 12) + ":" + (start.getMinutes() / 100).toFixed(2).toString().substr(2) + " - "
                    + (end.getHours() - 12) + ":" + (end.getMinutes() / 100).toFixed(2).toString().substr(2) + " P.M.";
            } else if (start.getHours() <= 12 && end.getHours() > 12) {
                return start.getHours() + ":" + (start.getMinutes() / 100).toFixed(2).toString().substr(2) + " A.M. - "
                    + (end.getHours() - 12) + ":" + (end.getMinutes() / 100).toFixed(2).toString().substr(2) + " P.M.";
            } else {
                return start.getHours() + ":" + (start.getMinutes() / 100).toFixed(2).toString().substr(2) + " - "
                    + end.getHours() + ":" + (end.getMinutes() / 100).toFixed(2).toString().substr(2) + " A.M.";
            }

        };

        var allEvents = [];
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        $.get("server/bhajan_signup/api.php", function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                event.start = new Date(event.start);
                event.end = new Date(event.end);
                if (event.start.getTime() >= today.getTime()) {
                    if (event.start.getHours() === 20 || event.start.getHours() === 17 || /celebration in the center/i.exec(event.summary)) {
                        allEvents.push(event);
                    }
                }
            }
            allEvents.sort(function (e1, e2) {
                return e1.start.getTime() - e2.start.getTime();
            });

            for (var i = 0; i < 9; ++i) {
                if (allEvents.length > i) {
                    var event = allEvents[i];
                    var $event = $("#event" + i);
                    if (!$event.length) {
                        $event = $("<div />");
                        $event.attr("id", "event" + i);
                        $("#event0").parent().append($event);
                        $event.html($("#event0").html());
                    }
                    $event.find(".day").text(getUserFriendlyDayName(event.start));
                    $event.find(".address").text(event.location);
                    $event.find("date").text(event.start.getDate());
                    $event.find(".month").text(months[event.start.getMonth()]);
                    $event.find(".summary").text(/celebration in the center/i.exec(event.summary) ? event.summary : event.summary.split(/\-/).splice(2).join(" - "));
                    $event.find(".address_link").attr("href", "https://www.google.com/maps/dir/''/" + encodeURIComponent(event.location));
                    $event.find(".address_link").attr("target", "_blank");
                    $event.find(".time").text(getUserFriendlyTime(event.start, event.end));
                    $event.show();
                } else {
                    break;
                }
            }
        }, "json");
    });
})(jQuery);