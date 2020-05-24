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

            this.jsDeleteById = function(id) {
                if(confirm("Delete element №"+id+" and its relatives?")) {
                    var childs = this_api.jsRecursiveByParent(id);
                    $.each(childs, function(i, el){
                        api4mindmap.jsFind(el.id, {del:1});
                    });
                    if(id!=1) api4mindmap.jsFind(id, {del:1});
                }
            }


        };
        return arguments.callee.instance;
    }


    //Update map
    this.jsRefreshMindmap = function() { // швидке оновлення всієї карти на екрані зі збереженням стану
        myjsPlumb.reset();// стираємо все лінії
        var save_scroll_top = $("#mindmap").scrollTop();// зберігаємо позиції скролінгу, щоб повернути
        var save_scroll_left = $("#mindmap").scrollLeft();//всё как было после перереисовки

        var hidden_elements = [];// масив зберігання згорнутих елементів

        $(".hide").each(function(){
            hidden_elements.push($(this).attr("myid"));
        });

        api4mindmap.jsRenderAllMap(1);// перемальовували всю карту заново

        $.each(hidden_elements, function(i, el){ // приховуємо елементи, які були приховані до.
            $("#node_"+el).addClass("hide");
        });

        api4mindmap.jsDrawMindmap(1);// намічаємо лінії, взявши видимі вузли з екрану
        onResize();// запускаємо отрисовку закеширувалася ліній

        $("#mindmap").scrollTop(save_scroll_top); // зберігаємо позиції скролінгу, щоб повернути
        $("#mindmap").scrollLeft(save_scroll_left);// все як було після перемальовки

    }
};
