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

        var currentAndFutureEvents = [], pastEvents = [];
        var now = new Date ();
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
                if (event.start.getHours() === 20 || event.start.getHours() === 17 || /celebration in the center/i.exec(event.summary)) {
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

            //Sort past events in descending order
            pastEvents.sort(function (e1, e2) {
                return e2.start.getTime() - e1.start.getTime();
            });

            for (var i = 0; i < 9; ++i) {
                if (currentAndFutureEvents.length > i) {
                    var event = currentAndFutureEvents[i];
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
                    if (i !== 0) {
                        $event.find(".parking_link").hide ();
                    }
                } else {
                    break;
                }
            }

            $.get("server/blogger.php", function (blogs) {
                var first = true;
                for (var i = 0, len = Math.min(90, pastEvents.length); i < len; ++i) {
                    var event = pastEvents[i];
                    for (var j = 0, jlen = blogs.length; j < jlen; ++j) {
                        var pub = new Date(blogs[j].published);
                        if (pub.getDate() === event.start.getDate() && pub.getMonth() === event.start.getMonth() && pub.getYear() === event.start.getYear()) {
                            var $div = $("<div />");
                            $div.html(blogs[j].content);
                            var src = $div.find("img").attr("src");
                            $div.remove();
                            $div = $('<div class="item"><h6 style="text-align: center"></h6><a href = "#" target = "blank"><img src="" alt="" style="height:218px"></a><br/></div>');
                            $div.find("h6").text(months[event.start.getMonth()] + "/" + event.start.getDate () + " - " + (/celebration in the center/i.exec(event.summary) ? event.summary : event.summary.split(/\-/).splice(2).join(" - ")));
                            $div.find("img").attr("src", src);
                            $div.find("a").attr("href", src);
                            if (first) {
                                $("#carousel-inner div").first().removeClass("active");
                                $div.addClass("active");
                                first = false;
                            }
                            $div.appendTo("#carousel-inner");
                            break;
                        }
                    }
                }
            }, "json");
        }, "json");
    });
})(jQuery);