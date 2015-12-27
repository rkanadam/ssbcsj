(function ($) {

    var parseBhajans = function (sheet) {
        var title = sheet.title;
        var allData = sheet.data;
        var matches = /(\d{2}\/\d{2}\/\d{4})/.exec(title);
        if (matches && matches.length) {
            var date = matches[1];
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
                    values.push(value);
                } else if (data[columns[0]] === "#") {
                    //This must be the header row
                    //get the column mapping
                    _.each(columns, function (column) {
                        var header = data[column];
                        if (header) {
                            header = header.replace(/\.?([A-Z]+)/g, function (x, y) {
                                return "_" + y.toLowerCase()
                            }).replace(/^_/, "")
                            headers[header] = column;
                        }
                    });
                    columnToHeaderName = _.invert(headers);
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
            return {
                "title": title,
                "sheet": sheet,
                "date": date,
                "values": values,
                "headers": headers,
                "columnToHeaderName": columnToHeaderName,
                "description": description.join('')
            }
        }
    };

    window.parse_bhajans = parseBhajans;
})(jQuery);