(function ($) {
    $(function () {

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

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

        var currentAndFutureEvents = [], pastEvents = [];
        var now = new Date();
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        $.get("../server/fremont.php", function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                event.start = new Date(event.start);
                event.end = new Date(event.end);
                if (event.start.getHours() === 20 || event.start.getHours() === 17 || /celebration in the center/i.exec(event.summary) || event.start.getHours() === 5) {
                    if (event.start.getTime() >= today.getTime()) {
                        if (event.end.getTime() < now.getTime()) {
                            pastEvents.push(event);
                        }
                        currentAndFutureEvents.push(event);
                    } else {
                        pastEvents.push(event);
                    }
                }
            }

            currentAndFutureEvents.sort(function (e1, e2) {
                return e1.start.getTime() - e2.start.getTime();
            });

            var filledEvents = [], openEvents = [];
            $.each(currentAndFutureEvents, function (index, e) {
                if (e.location) {
                    filledEvents.push(e);
                } else {
                    openEvents.push(e);
                }
            });

            for (var i = 0, len = Math.min(9, filledEvents.length); i < len; ++i) {
                var event = filledEvents[i];
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
                $event.find(".summary").text(event.summary);
                $event.find(".address_link").attr("href", "https://www.google.com/maps/dir/''/" + encodeURIComponent(event.location));
                $event.find(".address_link").attr("target", "_blank");
                $event.find(".time").text(getUserFriendlyTime(event.start, event.end));
                $event.show();
                if (true || i !== 0) {
                    $event.find(".parking_link").hide();
                }
            }

            var html = $.map(openEvents, function (e) {
                return ["<option value = \"", e.id, "\">", moment(e.start.getTime()).tz('America/Los_Angeles').format('MMMM Do, h:mm a'), "</option>"];
            });

            $("#when").html(html.join(""));
            $("#when").selectpicker("refresh");

            $("#bhajanSignupForm").validator().on("submit", function (e) {
                if (e.isDefaultPrevented()) {
                    return;
                }

                e.preventDefault();
                var $this = $(this);
                $.post("../server/fremont.php", $this.serialize(), function (response) {
                    if (response !== true) {
                        alert("Uh-oh we had some trouble requesting your signup. Please contact the web master.");
                    } else {
                        alert("We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Mouli / Siva");
                    }
                    window.location.reload();
                }, "json");

            });

        }, "json");

        $('select').selectpicker();

    });
})(jQuery);