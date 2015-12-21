(function ($) {
    $(function () {

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

        $.getJSON("server/center_devotional_lead_signup.php").then(function (bhajans) {
            var firstLines = [];
            for (var i = 1, len = bhajans.length; i < len; ++i) {
                var firstLine = bhajans[i][0].split("\n")[0]
                firstLines.push($.trim(firstLine).toLowerCase());
            }
            firstLines.sort();
            var c = completely($("#bhajanPicker").get(0));
            c.options = firstLines;
            var oc = c.onChange;
            c.onChange = function (text) {
                if (text.toLowerCase() != text) {
                    c.hint.value = text.toLowerCase();
                    c.input.value = text.toLowerCase();
                }
                oc();
            };
            return $.getJSON("server/center_devotional_lead_signup.php?action=list");
        }).then(function (sheets) {
            sheets = $.map(sheets, function (sheet) {
                return window.parse_bhajans(sheet);
            });

            _.each(sheets, function (sheet) {
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
                var availableSlotDescriptions = _.keys(availableSlots);
                availableSlotDescriptions.sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
            });

            sheets = $.map(sheets, function (sheet) {
                return sheet.isSlotAvailable ? sheet : undefined;
            });

            sheets.sort(function (s1, s2) {
                return s1.sheet.timestamp - s2.sheet.timestamp;
            });


            var dates = $.map(sheets, function (sheet, index) {
                var d = new Date();
                d.setTime(sheet.sheet.timestamp);
                return ["<option value = \"", index, "\">", d.toDateString(), "</option>"];
            });

            $("#when select").html(dates.join(""));
            $("#when select").selectpicker();
            $("#when select").change(function () {
                var index = parseInt($(this).val(), 10);
                if (!isNaN(index)) {
                    var sheet = sheets[index];

                    var slotsHtml = $.map(sheet.availableSlots, function (slot) {
                        return ["<option value = \"", slot[0], "\">", slot.description, " (", slot.length, " Remaining)</option>"];
                    }).join('');
                    $("#slot select").html(slotsHtml);
                    $("#slot select").selectpicker();
                    $("#slot select").selectpicker('refresh');
                    $("#slot select").trigger ('change');
                }
            }).trigger("change");


        });
    });
})(jQuery);