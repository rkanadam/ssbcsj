(function ($) {
    $(function () {

        $("#searchForm").submit(function (e) {
            e.preventDefault();
            var $this = $(this);
            $.get("server/sse/api.php", $this.serialize(), function (responses) {
                if (responses === false) {
                    alert("Looks like we were not able to complete the search. Please let the web master know");
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

        $("#searchResults table").on("click", "tr td", function (e) {
            var $this = $(this);
            var query = $.trim($this.attr("searchData"));
            if (query) {
                if (query) {
                    $.get("server/sse/api.php", {q:query}, function (responses) {
                        if (responses === false) {
                            alert("Looks like we were not able to complete the search. Please let the web master know");
                        }
                        console.log (responses);
                    }, "json");
                }
            }
        });
    })
})(jQuery);