(function ($) {
    $(function () {

        var daysToEvents = {};
        var daysToDates = {};

        $.get("server/bhajan_signup/api.php", function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                var start = new Date(event.start);
                var day = start.getDay();
                if (daysToEvents[day]) {
                    daysToEvents[day].push(event);
                    daysToDates[day].push(new Date(event.start).getTime());
                } else {
                    daysToEvents[day] = [event];
                    daysToDates[day] = [new Date(event.start).getTime()];
                }
            }
        }, "json");

        $('select').selectpicker();

        $("#city select").change(function () {
            $("#date, #details").hide();

            var $this = $(this);
            var val = $this.val();
            if (!val) {
                $("#date select").empty().selectpicker('refresh');
                $("#details:input").val("");
                return;
            }
            var dayOfTheWeek = parseInt(val);
            var d = new Date(2015, 7, 23, 20, 0, 0, 0)
            d.setDate(d.getDate() + dayOfTheWeek);
            var reservedDates = daysToDates[dayOfTheWeek];
            var availableDates = [];
            for (var i = 0; i < 13; ++i) {
                if (reservedDates.indexOf(d.getTime()) === -1) {
                    availableDates.push(d.getTime());
                }
                d.setDate(d.getDate() + 7);
            }
            var html = $(availableDates).map(function () {
                var d = new Date();
                d.setTime(this);
                return ["<option value=\"", d.toLocaleString(), "\">", d.toDateString(), "</option>"]
            }).get().join("");
            $("#date select").html("<option value = \"\"></option>" + html);
            $("#date select").selectpicker('refresh');
            $("#date").show();
        });

        $("#date select").change(function () {
            var $this = $(this);
            var val = $this.val();
            if (!val) {
                $("#details").hide();
                $("#details:input").val("");
                return;
            }
            $("#details").show();
        });

        $("#bhajanSignupForm").validator().on("submit", function (e) {
            if (e.isDefaultPrevented()) {
                return;
            }

            e.preventDefault();
            var $this = $(this);
            $.post("server/bhajan_signup/api.php", $this.serialize(), function (response) {
                if (response !== true) {
                    alert("Uh-oh we had some trouble requesting your signup. Please contact the web master.");
                } else {
                    alert("We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Raghu");
                }
                window.location.reload();
            }, "json");

        });

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });
    });
})(jQuery);