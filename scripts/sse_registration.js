(function ($) {
    $(function () {

        $("#searchForm").submit(function (e) {
            e.preventDefault();
            var $this = $(this);
            $.get("server/sse/api.php", $this.serialize(), function (responses) {
                if (responses === false) {
                    alert("Looks like we were not able to complete the search. Please let the web master know");
                    return false;
                }
                var html = [];
                for (var i = 0, len = responses.length; i < len; ++i) {
                    var response = responses[i];
                    html.push("<tr><td ")
                    html.push("searchData='");
                    html.push(JSON.stringify(response));
                    html.push("'>");
                    html.push(response["firstnameofchild"]);
                    html.push("&nbsp;");
                    html.push(response["lastnameofchild"]);
                    html.push("</td></tr>");
                }
                $("#searchContent").hide();
                $("#searchResults").find("table").empty().html(html.join("")).end().show();
            }, "json");
        });

        $("#searchResults").on("click", "table tr td", function (e) {
            var $this = $(this);
            var query = $.trim($this.attr("searchData"));
            if (query) {
                if (query) {
                    $.get("server/sse/api.php", {q: query}, function (responses) {
                        if (responses === false) {
                            alert("Looks like we were not able to complete the search. Please let the web master know");
                            return false;
                        }

                        var propertiesToCopy = ["fathersfirstname", "fatherslastname", "fathersemail", "fathersphone",
                            "mothersfirstname", "motherslastname", "mothersemail", "mothersphone"
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

                        $("#searchResults").hide();
                        $form.show();
                    }, "json");
                }
            }
        });
    })
})(jQuery);