(function ($) {
    $(function () {
        var allEvents = [];
        var reservedDates = [];
        var apiLocation = 'https://slides.ssbcsj.org/sssbcsj_api/birthday/signups';
        $.get(apiLocation, function (events) {
            events = events || [];
            for (var i = 0, len = events.length; i < len; ++i) {
                var event = events[i];
                var start = new Date(event.start);
                //convert to PST
                start = new Date(
                    start.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'}));

                //If the event does not start at 5PM or 7:30 PM or 8PM then it must be a service event or something like that. Just ignore it
                if (!(start.getHours() === 17 || start.getHours() === 20 ||
                    start.getHours() === 19)) {
                    continue;
                }
                reservedDates.push(start.getTime());
            }
            allEvents = events;

            //Swami's birth year
            const swamisBirthday = new Date().getFullYear() - 1926 + 1;

            var availableDates = [];
            var firstDate = new Date(2023, 10, 22, 19, 30, 0, 0); // This should be the first day the bhajan starts
            firstDate.setDate(firstDate.getDate() - swamisBirthday);
            var lastDate = new Date(2023, 10, 22, 19, 30, 0, 0); // This should be the last day the bhajan starts
            var d = new Date(firstDate.getTime());
            for (var i = 1; i <= 98; ++i) {
                if (reservedDates.indexOf(d.getTime()) === -1 && d.getTime() <=
                    lastDate.getTime()) {
                    availableDates.push({
                        day: i,
                        date: d.getTime()
                    });
                }
                d.setDate(d.getDate() + 1);
            }
            var html = $(availableDates).map(function () {
                const d = new Date(this.date);
                return [
                    '<option value="',
                    d.toISOString(),
                    '">',
                    `${d.toDateString()} (day #${this.day})`,
                    '</option>'];
            }).get().join('');
            $('#date select').html('<option value = ""></option>' + html);
            $('#date select').selectpicker('refresh');
            $('#date').show();
            $('#date select').on("change", function () {
                var $this = $(this);
                var val = $this.val();
                if (!val) {
                    $('#details').hide();
                    $('#details:input').val('');
                    return;
                }
                $('#details').show();

                $('#bhajanSignupForm').validator().on('submit', function (e) {
                    if (e.isDefaultPrevented()) {
                        return;
                    }

                    e.preventDefault();
                    var $this = $(this);

                    function getFormData($form){
                        var unindexed_array = $form.serializeArray();
                        var indexed_array = {};

                        $.map(unindexed_array, function(n, i){
                            indexed_array[n['name']] = n['value'];
                        });

                        return indexed_array;
                    }

                    $.post(apiLocation, getFormData($this), function (response) {
                        if (response !== true) {
                            alert(
                                'Uh-oh we had some trouble requesting your signup. Please contact the web master.');
                        } else {
                            alert(
                                'We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Raghuram @ raghuram.kanadam@gmail.com');
                        }
                        window.location.reload();
                    }, 'json');

                });

                $(document).ajaxStart(function () {
                    window.scrollTo(0, 0);
                    $('#indicator').show();
                });
                $(document).ajaxStop(function () {
                    $('#indicator').hide();
                });
            });

        }, 'json');

        $('select').selectpicker();


    });

})(jQuery);
