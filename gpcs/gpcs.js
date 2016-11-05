(function ($) {
    $(function () {

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

        $.getJSON("server/grand_parents_collection_service.php").then(function (sheet) {
            sheet = window.parse_bhajans(sheet)
            var availableSlots = {};
            _.each(sheet.values, function (row) {
                if (row.description && !row.name) {
                    if (!availableSlots[row.description]) {
                        availableSlots[row.description] = [];
                        availableSlots[row.description].description = row.description;
                    }
                    availableSlots[row.description].push(row.row);
                }
            });

            if (_.isEmpty(availableSlots)) {
                sheet.isSlotAvailable = false;
                sheet.availableSlots = null;
            } else {
                availableSlots = _.values(availableSlots);
                availableSlots.sort(function (s1, s2) {
                    return s1[0] - s2[0];
                });
                sheet.isSlotAvailable = true;
                sheet.availableSlots = availableSlots;
            }
            var slots = $.map(sheet.availableSlots, function (slot) {
                return ["<option value = \"", slot[0], "\">", slot.description, " (", slot.length, " Remaining)</option>"];
            });
            slots.splice(0, 0, ["<option value = \"\">Select an item</option>"]);

            $("#slot select").html(slots.join(""));
            $("#slot select").selectpicker();
            $("#slot select").selectpicker('refresh');
            $("#slot select").trigger('change');
            $("#slot").show();
            if (sheet.description) {
                $("#description").show().find("p").text(sheet.description);
            } else {
                $("#description").hide();
            }

            $("#signupForm").off("submit").on("submit", function (e) {
                var $this = $(this);
                e.preventDefault();
                var slot = parseInt($("#slot select").val(), 10);
                slot = _.find(sheet.availableSlots, function (slots) {
                    return slots[0] === slot ? slots : null;
                });

                var postParams = [];
                postParams.push({name: "sheetTitle", value: sheet.title});
                postParams.push({name: "row", value: $("#slot select").val()});
                postParams.push({name: "name", value: $("input[name='name']").val()});
                postParams.push({
                    name: "description",
                    value: slot ? slot.description : $("#slot select option:selected").text()
                });
                postParams.push({name: "email", value: $("input[name='email']").val()});
                postParams.push({name: "date", value: sheet.date});
                postParams.push({name: "col" + sheet.headers["name"], value: $("input[name='name']").val()});
                postParams.push({name: "col" + sheet.headers["email"], value: $("input[name='email']").val()});
                postParams.push({
                    name: "col" + sheet.headers["phonenumber"],
                    value: $("input[name='phone']").val()
                });
                postParams.push({
                    name: "col" + sheet.headers["notes"],
                    value: $("textarea[name='comments']").val()
                });
                postParams.push({
                    name: "col" + sheet.headers["timestamp"],
                    value: moment().tz('America/Los_Angeles').format('MMMM Do YYYY, h:mm:ss a')
                });
                postParams.push({
                    name: "colCount",
                    value: Math.max.apply(this, _.keys(sheet.columnToHeaderName))
                });

                $.post("server/grand_parents_collection_service.php", postParams, function (response) {
                    if (response !== true) {
                        alert("Uh-oh we had some trouble requesting your signup. Please contact the web master.");
                    } else {
                        alert("We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Ashwini/Vikranth");
                    }
                    window.location.reload();
                }, "json");
            });

            $("#slot select").change(function () {
                var val = $(this).val();
                if (val) {
                    var description = $(this).find("[value=" + val + "]").text();
                    $("#signup, #contact, #comments").show();
                } else {
                    $("#signup, #contact, #comments").hide();
                }
            });
        });
    });
})(jQuery);