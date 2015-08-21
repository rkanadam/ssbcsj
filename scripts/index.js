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
        }

        var allEvents = [];
        $.get("server/bhajan_signup/api.php", function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                event.start = new Date(event.start);
                if (event.start.getHours() === 20 || event.start.getHours() === 17) {
                    allEvents.push(event);
                }
            }
            allEvents.sort(function (e1, e2) {
                return e1.start.getTime() - e2.start.getTime();
            });

            for (var i = 0; i < 2; ++i) {
                if (allEvents.length > i) {
                    var day = allEvents[i];
                    var $day = $("#day" + i);
                    if (!$day.length) {
                        $day = $("<div />");
                        $day.attr("id", "day" + i);
                        $("#day0").parent().append($day);
                        $day.html($("#day0").html ());
                    }
                    $day.find(".day").text(getUserFriendlyDayName(day.start));
                    $day.find(".address").text(day.location);
                    $day.find("date").text(day.start.getDate());
                    $day.find(".month").text(months[day.start.getMonth()]);
                    $day.find(".address_link").attr ("href", "https://www.google.com/maps/dir/''/" + encodeURIComponent(day.location));
                    $day.find(".address_link").attr ("target", "_blank");
                    $day.show();
                }
            }
        }, "json");
    });
})(jQuery);