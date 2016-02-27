(function ($) {

    var parseBhajans = function (sheet) {
        var title = sheet.title;
        var allData = sheet.data;
        var date = "2016/01/01";
        var matches = /(\d{2}\/\d{2}\/\d{4})/.exec(title);
        if (matches && matches.length) {
            date = matches[1];
        }
        var rows = _.map(_.keys(allData), function (key) {
            return parseInt(key, 10);
        }).sort(function (n1, n2) {
            return n1 - n2;
        });
        var headersFound = false;
        var values = [];
        var headers = {}, columnToHeaderName = {};
        var description = [];
        _.each(rows, function (row) {
            var data = allData[row];
            var columns = _.map(_.keys(data), function (key) {
                return parseInt(key, 10);
            }).sort(function (n1, n2) {
                return n1 - n2;
            })
            if (headersFound) {
                var value = {};
                _.each(columns, function (column) {
                    if (columnToHeaderName.hasOwnProperty(column)) {
                        var columnName = columnToHeaderName[column];
                        value[columnName] = data[column];
                    }
                });
                value.row = row;
                values.push(value);
            } else if (data[columns[0]] === "#") {
                //This must be the header row
                //get the column mapping
                _.each(columns, function (column) {
                    var header = data[column];
                    if (header) {
                        header = $.trim(header);
                        header = header.toLowerCase().replace(/\s+/g, "");
                        headers[header] = column;
                    }
                });
                columnToHeaderName = _.invert(headers);
                headers.row = row;
                headersFound = true;
            } else {
                _.each(columns, function (column) {
                    var value = data[column];
                    if (value) {
                        description.push(value)
                    }
                });
            }
            values.row = row;
        });
        var parts = title.split(" ", -1);
        var time = parts && parts.length > 1 ? parts.pop() : null;
        return {
            "time": time,
            "title": title,
            "sheet": sheet,
            "date": date,
            "values": values,
            "headers": headers,
            "columnToHeaderName": columnToHeaderName,
            "description": description.join('')
        }
    };

    window.parse_bhajans = parseBhajans;
})(jQuery);