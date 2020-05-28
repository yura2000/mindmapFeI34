var API_4_MINDMAP = function() {
    if ((typeof arguments.callee.instance == 'undefined')) {
        arguments.callee.instance = new function() {
            var this_api = this;

            var my_all_data = {};

            var my_all_data_template = {
                "n1": { id: 1, parent_id: 0, title: "MindMap" },
            };

            this.jsSaveAllToDB = function() {
                $.each(my_all_data, function(i, el) {
                    db.put("mindmap_db", el).done(function() {});
                });
            };

            this.jsLoadAllFromDB = function() {
                var d = new $.Deferred();

                my_all_data = {};
                db.values("mindmap_db", null, 99999999).done(function(records) {
                    if (records.length) {
                        $.each(records, function(i, el) {
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

            this.jsFind = function(id, changes) {

                var answer = my_all_data["n" + id];
                if (!answer) return false;

                if (changes) {
                    $.each(changes, function(name_field, new_field_value) {
                        answer[name_field] = new_field_value;
                    });

                    db.put("mindmap_db", answer).done(function() {});

                }
                return answer;
            }

            this.jsFindByParent = function(parent_id) {
                var answer = [];
                $.each(my_all_data, function(i, el) {
                    if ((el.parent_id == parent_id) && (!el.del)) answer.push(el);
                });
                return answer;
            }

            this.jsRecursiveByParent = function(id, recursive_array) {
                if (!recursive_array) recursive_array = [];

                var answer = this_api.jsFindByParent(id);

                $.each(answer, function(i, el) {
                    recursive_array.push(el);
                    recursive_array = this_api.jsRecursiveByParent(el.id, recursive_array);
                });
                return recursive_array;
            }

            this.jsAddNew = function(parent_id, title) {
                var max_id = 0;
                $.each(my_all_data, function(i, el) {
                    if (el.id > max_id) max_id = el.id;
                });
                var new_id = (parseInt(max_id) + 1);
                my_all_data["n" + new_id] = {};
                my_all_data["n" + new_id] = { id: new_id, parent_id: parent_id, title: title };

                return new_id;
            }

            this.jsDeleteById = function(id) {
                if (confirm("Delete element №" + id + " and its relatives?")) {
                    var childs = this_api.jsRecursiveByParent(id);
                    $.each(childs, function(i, el) {
                        api4mindmap.jsFind(el.id, { del: 1 });
                    });
                    if (id != 1) api4mindmap.jsFind(id, { del: 1 });
                }
            }

            this.jsRenderAllMap = function(focus_id) {
                if (!focus_id) focus_id = 1;
                var html = "<ul myid='" + focus_id + "'>";
                html = this_api.jsRenderOneParent(focus_id, html);
                html += "</ul>";
                $("#mindmap").html(html);
                jsMakeDroppable();
            }

            this.jsRenderOneParent = function(parent_id, html) {
                html += "<li id='node_" + parent_id + "' myid='" + parent_id + "'>";
                html += "<div class='big_n_title'>";
                html += this_api.jsRenderOneElement(parent_id);
                html += "</div>";

                var childs = this_api.jsFindByParent(parent_id);
                if (childs.length) {
                    html += "<ul class='childs' myid='" + parent_id + "'>";
                }
                $.each(childs, function(i, el) {
                    html = this_api.jsRenderOneParent(el.id, html);
                });
                if (childs.length) {
                    html += "</ul>";
                }

                html += "</li>";
                return html;
            }

            this.jsRenderOneElement = function(id) {
                var element = this_api.jsFind(id);
                var childs_count = this_api.jsFindByParent(id).length;

                var icon_type = '';
                if (element.icon) icon_type = element.icon;

                if (childs_count > 0) {
                    var collapser_html = "<div class='collapse'></div>";
                    var icon = "<div class='type_icon'><i class='icon-folder-1 folder'><div class='count'>" +
                        childs_count + "</div></i><i class='" + icon_type + "'></i>" + "</div>";
                } else {
                    var collapser_html = "";
                    var icon = "<div class='type_icon'><i class='" + icon_type + "'></i></div>";
                }

                var answer = icon + "<div class='n_title' contenteditable='true'>" + element.title +
                    "</div><div class='contextmenu'></div>" + collapser_html;
                return answer;
            }

            this.jsRefreshMindmap = function() {
                myjsPlumb.reset();
                var save_scroll_top = $("#mindmap").scrollTop();
                var save_scroll_left = $("#mindmap").scrollLeft();

                var hidden_elements = [];

                $(".hide").each(function() {
                    hidden_elements.push($(this).attr("myid"));
                });

                api4mindmap.jsRenderAllMap(1);

                $.each(hidden_elements, function(i, el) {
                    $("#node_" + el).addClass("hide");
                });

                api4mindmap.jsDrawMindmap(1);
                onResize();

                $("#mindmap").scrollTop(save_scroll_top);
                $("#mindmap").scrollLeft(save_scroll_left);

            }

            this.jsRegAllKeys = function() {

                $("#mindmap").on("keydown", ".n_title", function(e) {

                    if (e.keyCode == 13) {
                        e.preventDefault();
                        $(this).blur();
                    }
                });

                $("#mindmap").on("keyup", ".n_title", function(e) {
                    e.preventDefault();
                    if (e.keyCode == 13) $(this).blur();
                    onResize();
                });

                $("#mindmap").on("blur", ".n_title", function() {
                    var n_title_text = $(this).html();
                    var id = $(this).parents("li:first").attr("myid");
                    if (n_title_text.length == 0) n_title_text = "new element";
                    $(this).html(strip_tags(n_title_text));
                    this_api.jsFind(id, { title: n_title_text });
                    onResize();
                });

                $("#mindmap").on("click", ".n_title", function() {
                    $(this).focus();
                });

                $("#mindmap").on("focus", ".n_title", function() {
                    var ntitle = $(this);
                    setTimeout(function() {
                        if (ntitle.is(":focus")) document.execCommand('selectAll', false, null);
                    }, 3);

                });

                $("#mindmap").on("click", ".collapse", function() {
                    $(this).parents("li:first").toggleClass("hide");
                    api4mindmap.jsDrawMindmap(1);
                    onResize();
                    return false;
                });

                var font_size = 14;
                $("#zoom_in").on("click", function() {
                    font_size += 1;
                    $("#mindmap").css("font-size", font_size + "px");
                    onResize();
                    return false;
                });
                $("#zoom_out").on("click", function() {
                    font_size -= 1;
                    $("#mindmap").css("font-size", font_size + "px");
                    onResize();
                    return false;
                });

                $("#collapse_all").on("click", function() {
                    $("#node_1 ul li").addClass("hide");
                    onResize();
                    return false;
                });

                $("#expand_all").on("click", function() {
                    $("#node_1 ul li").removeClass("hide");
                    onResize();
                    return false;
                });


            }

            this.jsDrawMindmap = function(focus_id) {

                var line_cache = [];

                $("#mindmap ul:visible").each(function() {
                    var ul_id = $(this).attr("myid");
                    var childs = this_api.jsFindByParent(ul_id);

                    $.each(childs, function(i, el) {
                        var target = el.id;
                        if (!$("li[myid='" + target + "']" + " .big_n_title:first").hasClass("_jsPlumb_endpoint_anchor_")) {
                            var parent_id = el.parent_id;
                            line_cache.push({ source: parent_id, target: target });
                        }
                    });
                });

                if (line_cache.length) {
                    if (!myjsPlumb.isSuspendDrawing()) {
                        myjsPlumb.setSuspendDrawing(true, true);
                        console.info("set_suspend");
                    }
                }


                $.each(line_cache, function(i, el) {

                    if (el.source == 1) {
                        anchor1 = [1, 0.5, 1, 0, -1, -1];
                    } else {
                        anchor1 = [1, 1, 1, 0, -1, -1];
                    }

                    var p1 = myjsPlumb.addEndpoint("node_" + el.source + " .big_n_title:first", { anchor: anchor1 });
                    var p2 = myjsPlumb.addEndpoint("node_" + el.target + " .big_n_title:first", { anchor: [0, 1, -1, 0, 1, -1] });
                    var count = this_api.jsFindByParent(el.source).length;

                    if (count > 10) {
                        var LineType = "Straight";
                    } else {
                        var LineType = "Bezier";
                    }

                    myjsPlumb.connect({
                        source: p1,
                        target: p2,
                        scope: "someScope",
                        deleteEndpointsOnDetach: true,
                        connector: [LineType,
                            { curviness: 30, cornerRadius: 20 }
                        ]
                    });
                });
            }
        };
    }
    return arguments.callee.instance;
}

function onResize() {
    myjsPlumb.setSuspendDrawing(false, true);
}

function jsGetIcons(n) {
    var icons = {};

    icons[0] = ["progress-0", "progress-1", "progress-2", "progress-3", "dot", "dot-2", "dot-3", "star-empty", "star", "record"];
    icons[1] = ["check", "heart-empty", "heart", "bookmark-empty", "bookmark", "ok-2", "help", "wallet", "mail-2", "cloud"];
    icons[2] = ["tree", "chat-2", "article-alt", "volume", "flash", "aperture-alt", "layers", "steering-wheel", "skiing", "flight"];
    icons[3] = ["lock-open", "lock", "umbrella", "camera", "book-open", "clock-1", "plus", "minus", "trash", "music"];
    icons[4] = ["calculator", "address", "pin", "vcard", "basket-1", "swimming", "youtube", "leaf", "mic", "target"];
    icons[5] = ["monitor", "phone", "download", "bell", "at", "pause", "play", "stop-1", "flag", "key"];
    icons[6] = ["users-1", "eye", "inbox", "brush", "moon", "college", "fast-food", "coffee", "top-list", "bag"];
    icons[7] = ["chart-area", "info", "home-1", "hourglass", "attention", "scissors", "tint", "guidedog", "archive", "flow-line"];
    icons[8] = ["emo-grin", "emo-happy", "emo-wink", "emo-sunglasses", "emo-thumbsup", "emo-sleep", "emo-unhappy", "emo-devil", "emo-surprised", "emo-tongue"];
    icons[9] = ["plus", "minus", "keyboard", "fast-fw", "to-end", "to-start", "cancel-circle", "check", "flash", "feather"];
    icons[10] = ["plus-circle", "pencil-alt", "target-1", "chart-pie", "adjust", "user-add", "volume", "install", "flow-cascade", "sitemap"];
    icons[11] = ["minus-circle", "clock-1", "light-down", "light-up", "lamp", "upload", "picture-2", "dollar", "gift", "link-1"];

    answer = {};

    $.each(icons, function(j, icon_group) {
        sub_icons = {};
        $.each(icons[j], function(i, icon) {
            sub_icons["icon-" + icon] = {};
            sub_icons["icon-" + icon] = { name: icon, icon: "icon-" + icon };
        });

        answer["icon-group" + icon_group] = {};
        answer["icon-group" + icon_group] = { name: "Набор №" + (parseInt(j) + 1), icon: "icon-" + icons[j][0], items: sub_icons };

    });

    return answer;
}

function jsMakeDroppable() {

    $(".n_title").not("ui-draggable").draggable({
        zIndex: 999,
        delay: 50,
        revert: false,
        helper: "clone",
        appendTo: "body",
        refreshPositions: true
    });

    $(".n_title").not("ui-droppable").droppable({
        accept: ".n_title",
        activeClass: "ui-can-recieve",
        tolerance: "pointer",
        hoverClass: "ui-can-hover",
        over: function(event, ui) {},
        drop: function(event, ui) {

            var my_draggable = $(ui.draggable[0]);
            var my_droppable = $(event.target);

            my_draggable_id = my_draggable.parents("li:first").attr("myid");
            my_droppable_id = my_droppable.parents("li:first").attr("myid");

            if (jsCanDrop(my_draggable_id, my_droppable_id)) {
                api4mindmap.jsFind(my_draggable_id, { parent_id: my_droppable_id });
                api4mindmap.jsRefreshMindmap();
                $(".ui-draggable-dragging").remove();

            } else {
                alert("can not transfer the element inside itself");
            }

        }
    });

}

function jsCanDrop(draggable_id, droppable_id) {
    var can_drop = true;
    var all_childs = api4mindmap.jsRecursiveByParent(my_draggable_id);
    $.each(all_childs, function(i, el) {
        console.info(el.id, droppable_id);
        if (el.id == droppable_id)
            can_drop = false;
    });

    if (draggable_id == droppable_id) var can_drop = false;

    return can_drop;
}

function strip_tags(str) {
    if (!str) return "";
    answer = str.replace(/<\/?[^>]+>/gi, '');
    answer = answer.replace(/\n/gi, '');
    return answer;
}

var myjsPlumb;

function jsDoFirst() {
    api4mindmap = new API_4_MINDMAP();

    jsPlumb.Defaults.Container = $("#mindmap");
    myjsPlumb = jsPlumb.getInstance({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        PaintStyle: {
            lineWidth: 1,
            strokeStyle: "#888"
        },
        Connector: ["Bezier", { curviness: 30 }],
        Endpoint: ["Blank", { radius: 5 }],
        EndpointStyle: { fillStyle: "#567567" },
        Anchors: [
            [1, 1, 1, 0, -1, -1],
            [0, 1, -1, 0, 1, -1]
        ]
    });

    var icons_html = jsGetIcons(0);


    $.contextMenu({
        selector: '.contextmenu',
        trigger: 'left',
        callback: function(key, options) {
            var id = $(this).parents("li:first").attr("myid");
            if (/icon-/ig.test(key)) {
                api4mindmap.jsFind(id, { icon: key });
                api4mindmap.jsRefreshMindmap();
            } else if (key == "delete") {
                api4mindmap.jsDeleteById(id);
                api4mindmap.jsRefreshMindmap(id);
            } else if (key == "add_down") {
                var parent_id = api4mindmap.jsFind(id).parent_id;
                var new_id = api4mindmap.jsAddNew(parent_id, "Новий елемент");
                api4mindmap.jsRefreshMindmap();
                $("#node_" + new_id + " .n_title").focus();
            } else if (key == "add_right") {
                var new_id = api4mindmap.jsAddNew(id, "Новий елемент");
                $(this).parents("li").removeClass("hide");
                api4mindmap.jsRefreshMindmap();
                $("#node_" + new_id + " .n_title").focus();
            }
        },
        delay: 0,
        items: {
            "add_down": { "name": "Добавити вниз", "icon": "icon-down-1" },
            "add_right": { "name": "Добавити вправо", "icon": "icon-right-1" },
            "sep1": "--------",
            "delete": { "name": "Удалити", "icon": "icon-trash" },
            "context_make_did1011": {
                "name": "Іконка",
                "icon": "icon-emo-wink",
                "items": icons_html
            }
        }
    });

    var mindmap_store_schema = {
        name: "mindmap_db",
        keyPath: 'id',
        autoIncrement: false
    };

    var schema = {
        stores: [mindmap_store_schema]
    };

    if (navigator.userAgent.toLowerCase().indexOf("android") != -1) {
        var options = { mechanisms: ['websql', 'indexeddb'] };
    } else {
        var options = {};
    }

    db = new ydn.db.Storage('_all_mindmap', schema, options);

    api4mindmap.jsLoadAllFromDB().done(function() {
        api4mindmap.jsRegAllKeys();
        api4mindmap.jsRenderAllMap(1);
        api4mindmap.jsDrawMindmap(1);
        onResize();
    });

}