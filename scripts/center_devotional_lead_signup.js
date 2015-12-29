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

            bhajans.sort(function (b1, b2) {
                return b1[0].toLocaleLowerCase() - b2[0].toLocaleLowerCase();
            });

            bhajans = $.map(bhajans, function (b) {
                var bhajan = {};
                bhajan.firstLine = $.trim(b[0].split("\n")[0]);
                bhajan.lyrics = b[0];
                bhajan.meaning = b[1];
                return bhajan;
            });

            var bhajanHound = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('firstLine'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: bhajans
            });


            bhajanHound.initialize();
            $('#bhajanPicker').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'bhajanHound',
                    displayKey: 'firstLine',
                    limit: 15,
                    source: bhajanHound
                }).on('typeahead:selected', function (e, bhajan) {
                    $("#lyrics")
                        .find("textarea")
                        .val(bhajan.lyrics)
                        .end()
                        .show();
                    $("#scale").show();
                });
            $("#bhajanPicker").parent(".twitter-typeahead").css("display", "block");


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
                        availableSlots[row.description].push(row["#"]);
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
            dates.splice(0, 0, ["<option value = \"\">Select a date</option>"]);

            $("#when select").html(dates.join(""));
            $("#when select").selectpicker();
            $("#when select").change(function () {
                var index = parseInt($(this).val(), 10);
                if (!isNaN(index)) {
                    var sheet = sheets[index];

                    var slots = $.map(sheet.availableSlots, function (slot) {
                        return ["<option value = \"", slot[0], "\">", slot.description, " (", slot.length, " Remaining)</option>"];
                    });
                    slots.splice(0, 0, ["<option value = \"\">Select an item</option>"]);

                    $("#slot select").html(slots.join(""));
                    $("#slot select").selectpicker();
                    $("#slot select").selectpicker('refresh');
                    $("#slot select").trigger('change');
                    $("#slot").show();
                } else {
                    $("#slot, #contact, #signup, #scale, #bhajan #comments").hide();
                }
            }).trigger("change");
            $("#when").show();

            $("#slot select").change(function () {
                var val = $(this).val();
                if (val) {
                    var description = $(this).find("[value=" + val + "]").text();
                    if (/bhajan/i.exec(description) || /song/i.exec(description)) {
                        $("#bhajan").show();
                    }
                    $("#signup, #contact, #comments").show();
                } else {
                    $("#signup, #contact, #scale, #bhajan, #comments").hide();
                }
            });

            $("#signupForm").submit(function (e) {
                var $this = $(this);
                e.preventDefault();
                var object = $this.serializeArray();
                var sheetIndexObject = _.where(object, {"name": "when"})[0];
                sheetIndexObject.value = sheets[sheetIndexObject.value].title;

                $.post("server/center_devotional_lead_signup.php", $.param(object), function (response) {
                    debugger;
                });
            });

        });

    });
})(jQuery);