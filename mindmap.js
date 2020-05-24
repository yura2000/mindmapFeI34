var API_4_MINDMAP = function() {
    if ((typeof arguments.callee.instance == 'undefined')) {
        arguments.callee.instance = new function () {
            var this_api = this;

            var my_all_data = {};


            this.jsSaveAllToDB = function () {
                $.each(my_all_data, function (i, el) {
                    db.put("mindmap_db", el).done(function () {
                    });
                });
            };

            this.jsLoadAllFromDB = function () {
                var d = new $.Deferred();

                my_all_data = {};
                db.values("mindmap_db", null, 99999999).done(function (records) {
                    if (records.length) {
                        $.each(records, function (i, el) {
                            my_all_data["n" + el.id] = {};
                            my_all_data["n" + el.id] = el;
                        });
                    } else {
                        my_all_data = my_all_data_template;
                        this_api.jsSaveAllToDB();
                    }
                    d.resolve();
                });

                return d.promise();

            };


        };
        return arguments.callee.instance;
    }
};
