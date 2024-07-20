(function ($) {
    $(function () {
        var allEvents = [];
        var reservedDates = [];
        // https://docs.google.com/spreadsheets/d/1W3DK8ySOsPGZDgCBQQRmc9KRO8C1OnEqSRnzrpXLOaA/edit?gid=87825228#gid=87825228
        var apiLocation = 'https://script.google.com/macros/s/AKfycbzT4Ee9ljsl5a2VkDzh68s77u8oOb8_6Pfk_jh5wXuJt-CGIINPlwKkMQSq2xoHhTWL/exec';
        $.get(apiLocation, {"path": "areas"}, function (areas) {
            const areaSet = new Set();
            areas.forEach((area, index) => {
                areaSet.add(area);
            })
            const cities = Array.from(areaSet.values()).map(area => {
                return `<option value = "${area}">${area}</option>`
            }).join("")
            $("#city select").html(`<option value = ""></option>${cities}`);
            $('#city select').selectpicker('refresh');
        });
        $("#city select").on("change", function () {
            var $this = $(this);
            var val = $this.val();
            if (val) {
                console.log("City", val, "selected");
            }
            $.get(apiLocation, {"path": "signups", area: val}, function (availableDates) {
                var html = availableDates.map(function ({date, value}, index) {
                    return [
                        '<option value="',
                        value,
                        '">',
                        date,
                        '</option>'].join("");
                }).join('');
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

                        function getFormData($form) {
                            var unindexed_array = $form.serializeArray();
                            var indexed_array = {};

                            $.map(unindexed_array, function (n, i) {
                                indexed_array[n['name']] = n['value'];
                            });

                            return indexed_array;
                        }

                        console.log(getFormData($this));

                        fetch(apiLocation, {
                            method: "POST",
                            mode: "no-cors",
                            redirect: "follow",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(getFormData($this)),
                        })
                            .then((response) => response.text())
                            .then((result) => {
                                alert(
                                    'We have requested for your signup. You will receive a confirmation  e-mail soon! If not see DC @ ssbcsj.devotion@gmail.com or 925-642-2680');
                                window.location.reload();
                            });
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
        });

        $('select').selectpicker();


    });

})(jQuery);
