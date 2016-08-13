(function ($) {
    $(function () {

        var daysToEvents = {};
        var daysToDates = {};
        var apiLocation = "../server/birthday_bhajan_signup.php";
        $.get(apiLocation, function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                var start = new Date(event.start);
                var day = start.getDay();
                //If the event does not start at 5PM or 8PM then it must be a service event or something like that. Just ignore it
                if (!(start.getHours() === 17 || start.getHours() === 20)) {
                    continue;
                }
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

            var firstDate = new Date(2016, 7, 24, 20, 0, 0, 0); // This should be the first day the bhajan starts
            var d = new Date(firstDate.toISOString());
            d.setDate(d.getDate() - d.getDay() + dayOfTheWeek);
            //We are trying to determine the very first day of the said week of the day when the bhajan will begin
            //So let us say the bhajan starts on a Wednesday then the first monday will be after that date
            if (d.getTime() < firstDate.getTime()) {
                d.setDate(d.getDate() + 7);
            }

            var reservedDates = daysToDates[dayOfTheWeek] || [];
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
                return ["<option value=\"", d.toISOString(), "\">", d.toDateString(), "</option>"]
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
            $.post(apiLocation, $this.serialize(), function (response) {
                if (response !== true) {
                    alert("Uh-oh we had some trouble requesting your signup. Please contact the web master.");
                } else {
                    alert("We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Raghu @ raghuram.kanadam@gmail.com");
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