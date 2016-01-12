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
            });

            sheets = $.map(sheets, function (sheet) {
                return sheet.isSlotAvailable ? sheet : undefined;
            });

            sheets.sort(function (s1, s2) {
                return s1.sheet.timestamp - s2.sheet.timestamp;
            });


            $('#when .typeahead').typeahead({
                    minLength: 0,
                    highlight: true
                },
                {
                    "name": 'availableDates',
                    "display": function (sheet) {
                        return moment(sheet.sheet.timestamp).tz('America/Los_Angeles').format('MMMM Do');
                    },
                    source: function (q, sync, async) {
                        sync(sheets);
                    },
                    templates: {
                        suggestion: _.template("<div><p><strong><%= moment(sheet.timestamp).tz('America/Los_Angeles').format('MMMM Do YY') %></strong></p><% if (description) { %><div class='description'><%= description %></div><% } %></div>")
                    }
                }).on("typeahead:select", function (e, sheet) {
                    if (sheet) {
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
                    } else {
                        $("#slot, #contact, #signup, #scale, #bhajan #comments").hide();
                    }
                }).on("click", function (e) {
                    $(this).typeahead('open');
                });
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
                var sheet = sheets[parseInt($("#when select").val(), 10)];
                var slot = parseInt($("#slot select").val(), 10);
                slot = _.find(sheet.availableSlots, function (slots) {
                    return slots[0] === slot ? slots : null;
                });

                var postParams = [];
                postParams.push({name: "sheetTitle", value: sheet.title});
                postParams.push({name: "row", value: $("#slot select").val()});
                postParams.push({name: "name", value: $("input[name='name']").val()});
                postParams.push({name: "description", value: slot ? slot.description : $("#slot select option:selected").text()});
                postParams.push({name: "email", value: $("input[name='email']").val()});
                postParams.push({name: "date", value: sheet.date});
                postParams.push({name: "col" + sheet.headers["name"], value: $("input[name='name']").val()});
                postParams.push({name: "col" + sheet.headers["devotionalsong"], value: $("input[name='bhajan']").val()});
                postParams.push({name: "col" + sheet.headers["scale"], value: $("input[name='scale']").val()});
                postParams.push({name: "col" + sheet.headers["lyrics"], value: $("textarea[name='lyrics']").val()});
                postParams.push({name: "col" + sheet.headers["email"], value: $("input[name='email']").val()});
                postParams.push({name: "col" + sheet.headers["phonenumber"], value: $("input[name='phone']").val()});
                postParams.push({name: "col" + sheet.headers["notes"], value: $("textarea[name='comments']").val()});
                postParams.push({name: "col" + sheet.headers["timestamp"], value: moment().tz('America/Los_Angeles').format('MMMM Do YYYY, h:mm:ss a')});
                postParams.push({name: "colCount", value: Math.max.apply(this, _.keys(sheet.columnToHeaderName))});

                $.post("server/center_devotional_lead_signup.php", postParams, function (response) {
                    if (response !== true) {
                        alert("Uh-oh we had some trouble requesting your signup. Please contact the web master.");
                    } else {
                        alert("We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Raghu");
                    }
                    window.location.reload();
                }, "json");
            });

        });

    });
})(jQuery);