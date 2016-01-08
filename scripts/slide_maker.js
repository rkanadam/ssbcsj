(function ($) {
    $(function () {

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

        if (window.google) {
            google.script.run
                .withSuccessHandler(function (bhajans) {
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
                            $("#lyrics textarea")
                                .val(bhajan.lyrics)
                            $("#meaning textarea")
                                .val(bhajan.meaning);
                        });
                    $("#bhajanPicker").parent(".twitter-typeahead").css("display", "block");
                })
                .withUserObject(this)
                .getDevotionalSongs();
        }

        $("#buttons").on("click", "a", function (e) {
            e.preventDefault();
            var $this = $(this);
            var href = $this.attr("href");
            $this.parents(".btn-group")
                .find("a").each(function () {
                    var id = $(this).attr("href");
                    $(id).hide();
                }).end().find("button .text").text($this.text());
            $(href).show();
            if (href === "#slideMaker") {
                $("#indicator").show();
                google.script.run
                    .withSuccessHandler(function (sheet) {
                        console.log(sheet);
                        sheet = window.parse_bhajans(sheet);
                        console.log("After", sheet);
                        var thoughtForTheWeek = _.find(sheet.values, function (value) {
                            return value.description.match(/thought\s+for\s+the\s+week/i);
                        });
                        if (thoughtForTheWeek) {
                            thoughtForTheWeek = thoughtForTheWeek.devotionalsong;
                        }
                        $("#thoughtForTheWeek").text(thoughtForTheWeek);
                        var divineCodeOfConduct = _.find(sheet.values, function (value) {
                            return value.description.match(/divine\s+code\s+of\s+conduct/i);
                        });
                        if (divineCodeOfConduct) {
                            divineCodeOfConduct = divineCodeOfConduct.devotionalsong;
                        }
                        $("#divineCodeOfConduct").text(divineCodeOfConduct);
                        var unisons = _.filter(sheet.values, function (value) {
                            return value.description.match(/unison/i);
                        });
                        $("#unisons").text(unisons.length);
                        var bhajans = _.filter(sheet.values, function (value) {
                            return value.description.match(/unison/i) === null && value.description.match(/bhajan/i);
                        });
                        $("#bhajans").text(bhajans.length);

                        var missingBhajansHTML = $.map(sheet.values, function (bhajan) {
                            if (bhajan.description.match(/unison/i) || bhajan.description.match(/bhajan/i)) {
                                var missing = "";
                                if (!bhajan.devotionalsong) {
                                    missing += ", Missing Devotional Song"
                                }
                                if (!bhajan.scale) {
                                    missing += ", Missing Scale"
                                }
                                if (!bhajan.lyrics) {
                                    missing += ", Missing Lyrics"
                                }
                                if (missing) {
                                    return ["<li>", "#", bhajan["#"], ". ", bhajan.description, " [", missing.substring(2), "]", "</li>"];
                                }
                            }
                            return undefined;
                        }).join("");

                        $("#missingBhajans ul").html(missingBhajansHTML);

                        $("#bhajans").text(bhajans.length);
                        if (!missingBhajansHTML) {
                            var slideBhajans = _.map(bhajans.concat(unisons), function (bhajan) {
                                return {
                                    "scale": bhajan.scale,
                                    "lyrics": bhajan.lyrics,
                                    "meaning": bhajan.meaning
                                };
                            });
                            $("#slideGeneratorForm [name='bhajans']").val(JSON.stringify({
                                "divineCodeOfConduct": divineCodeOfConduct,
                                "thoughtForTheWeek": thoughtForTheWeek,
                                "bhajans": slideBhajans
                            }));
                            $("#downloadSlides").off("click").on("click", function () {
                                $("#slideGeneratorForm").submit();
                            });
                        } else {
                            $("#downloadSlides").hide();
                        }
                        $("#indicator").hide();
                    }).withUserObject(this)
                    .getCurrentSheet();
            } else if (href === "#emailReminder") {
                $("#sendEmail").off("click").on("click", function () {
                    $("#indicator").show();
                    google.script.run
                        .withSuccessHandler(function (sheet) {
                            console.log("Before parsing the sheet: ", sheet);
                            sheet = window.parse_bhajans(sheet);
                            console.log("After parsing the sheet: ", sheet);
                            var cc = $("#cc").val();
                            var bcc = $("#bcc").val()
                            var bhajans = jQuery.map(sheet.values, function (value) {
                                if (value && value.email && (value.lyrics || value.devotionalsong) && value.scale) {
                                    var bhajan = $.extend({}, value);
                                    bhajan.firstName = bhajan.name ? bhajan.name.split(" ", -1)[0] : "";
                                    bhajan.date = sheet.date;
                                    bhajan.time = sheet.time || "5:00 PM";
                                    bhajan.cc = cc;
                                    bhajan.bcc = bcc;
                                    return bhajan;
                                }
                            });
                            _.templateSettings = {
                                interpolate: /\{([^}].+?)\}/g
                            };
                            var email = _.template($("#email").summernote("code"));
                            var subject = _.template($("#subject").summernote("code"));
                            _.each(bhajans, function (bhajan) {
                                bhajan.subject = subject(bhajan);
                                bhajan.htmlBody = email(bhajan);
                            });

                            google.script.run
                                .withSuccessHandler(function (status) {
                                    if (status) {
                                        alert("Sent the e-mails successfully");
                                    } else {
                                        alert("Uh-oh we had trouble sending e-mails. Ask Raghu.");
                                    }
                                    $("#indicator").hide();
                                }).withUserObject(this)
                                .email(JSON.stringify(bhajans));

                        }).withUserObject(this)
                        .getCurrentSheet();
                });
            }

        });
    });

    $(function () {

        var hint = {
            words: [
                {
                    help: "Insert the bhajan lyrics",
                    value: '{lyrics}'
                },
                {
                    help: "Insert the meaning ",
                    value: '{meaning}'
                },
                {
                    help: "Insert the scale of the bhajan",
                    value: '{scale}'
                },
                {
                    help: "Insert the name of the singer",
                    value: '{name}'
                },
                {
                    help: "Insert the scheduled bhajan date",
                    value: '{date}'
                },
                {
                    help: "Insert the time of the bhajan slot",
                    value: '{time}'
                },
                {
                    help: "Insert the description of the bhajan",
                    value: '{description}'
                }
            ],
            match: /\{/,
            search: function (keyword, callback) {
                callback(this.words);
            },
            template: function (item) {
                return ["<div style='font-size:90%'>", item.value, " ", item.help, "</div>"].join("");
            },
            content: function (item) {
                return item.value;
            }
        };

        $('#email').summernote({
            height: 300,                 // set editor height
            minHeight: null,             // set minimum height of editor
            maxHeight: null,             // set maximum height of editor
            focus: true,                  // set focus to editable area after initializing summernote,
            placeholder: 'type { to see predefined placeholders',
            hint: hint
        });

        $('#subject').summernote({
            toolbar: false,
            height: 50,
            minHeight: null,             // set minimum height of editor
            maxHeight: 50,             // set maximum height of editor
            focus: true,                  // set focus to editable area after initializing summernote,
            placeholder: 'type { to see predefined placeholders',
            hint: hint
        });

    });
})(jQuery);