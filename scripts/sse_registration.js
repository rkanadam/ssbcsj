(function ($) {
    $(function () {

        $("#searchForm").validator().on("submit", function (e) {
            if (e.isDefaultPrevented()) {
                return;
            }
            e.preventDefault();
            var $this = $(this);
            $.get("../server/sse/api.php", $this.serialize(), function (responses) {
                if (responses === false) {
                    alert("Looks like we were not able to complete the search. Please let the web master know");
                    return false;
                } else if (responses.length === 0) {
                    alert("We found no children matching this search string. Please try again or you might want to try a new registration.");
                    return;
                }
                var html = [];
                for (var i = 0, len = responses.length; i < len; ++i) {
                    var response = responses[i];
                    html.push("<tr><td ")
                    html.push("searchData='");
                    html.push(JSON.stringify(response));
                    html.push("'><a href = '#'>");
                    html.push(response["firstnameofchild"]);
                    html.push("&nbsp;");
                    html.push(response["lastnameofchild"]);
                    html.push("</a></td></tr>");
                }
                $("#searchContent").hide();
                $("#searchResults").find("table").empty().html(html.join("")).end().show();
            }, "json");
        });

        $("#newRegistration").on("click", function (e) {
            $("#searchContent").hide();
            $("#registrationForm").find(":input").each(function () {
                $(this).val("");
            }).end().show();
            $("select.form-control").trigger("change");
        });

        $("#searchResults").on("click", "table tr td", function (e) {
            var $this = $(this);
            var query = $.trim($this.attr("searchData"));
            if (query) {
                if (query) {
                    $.get("../server/sse/api.php", {q: query}, function (responses) {
                        if (responses === false) {
                            alert("Looks like we were not able to complete the search. Please let the web master know");
                            return false;
                        }

                        var propertiesToCopy = ["fathersfirstname", "fatherslastname", "fathersemail", "fathersphone",
                            "mothersfirstname", "motherslastname", "mothersemail", "mothersphone", "comments", "centercommunication"
                        ];

                        var $form = $("#registrationForm");
                        $.each(propertiesToCopy, function (index, property) {
                            $form.find("input[name='" + property + "']").val(responses[0][property]);
                        });

                        //Next copy the children's properties
                        var propertiesToCopy = [
                            "firstnameofchild", "lastnameofchild", "ssegroupofchild", "schoolgradeofchild"
                        ];
                        for (var i = 1, len = Math.min(responses.length, 3); i <= len; ++i) {
                            $.each(propertiesToCopy, function (index, property) {
                                $form.find("[name='" + property + i + "']").val(responses[i - 1][property]);
                            });
                        }

                        $("select.form-control").trigger("change");


                        $("#searchResults").hide();
                        $form.find("[name=centercommunication]").first().val ("yes")
                        $form.find("[name=centercommunication]").last().val ("no")
                        $form.show();
                    }, "json");
                }
            }
        });

        $("#registrationForm").validator().on("submit", function (e) {
            if (e.isDefaultPrevented()) {
                return;
            }

            e.preventDefault();
            var $this = $(this);
            $.post("../server/sse/api.php", $this.serialize(), function (response) {
                if (response !== true) {
                    alert("Your information could not be saved. Please contact the web master.");
                } else {
                    alert("Your information was successfully saved.");
                }
                $("#registrationForm, #searchResults").hide();
                $("#searchContent").show();
                return false;
            }, "json");

        });

        $(document).ajaxStart(function () {
            window.scrollTo(0, 0);
            $("#indicator").show();
        });
        $(document).ajaxStop(function () {
            $("#indicator").hide();
        });

        $("select.form-control").change(function () {
            var $this = $(this);
            if (/nursery/i.exec($this.val())) {
                $this.next(".warning").show();
            } else {
                $this.next(".warning").hide();
            }
        });

        $("select.form-control").trigger("change");
    })
})(jQuery);