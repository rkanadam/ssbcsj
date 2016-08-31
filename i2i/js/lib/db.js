define(["jquery", "app/constants"], function ($, k) {
    var db = function (appName) {
        this.appName = appName;
    };

    db.prototype = Object.create({
        appName: "",
        db: {},
        load: function () {
            var d = new $.Deferred();
            $.ajax({
                dataType: "json",
                url: k.apiEndpoint + "/db.php",
                data: {"app": this.appName},
                context: this
            }).done(function (rows) {
                var db = {};
                _.each(rows, function (row) {
                    db[this.simplifyKey(row.key)] = row.value;
                }, this);
                this.db = db;

                d.resolveWith(this);
            });
            return d.promise();
        },

        simplifyKey: function (key) {
            return key ? key.toLowerCase().replace(/[^0-9a-z]/g, "") : "";
        },

        get: function (key) {
            var value = "";
            key = this.simplifyKey(key);
            _.each(this.db, function (dbValue, dbKey) {
                if (dbKey.indexOf(key) === 0 || key.indexOf(dbKey) === 0) {
                    value = dbValue;
                    return false;
                }
            }, this);
            return value;
        }
    });

    return db;
});