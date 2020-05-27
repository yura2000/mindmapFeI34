var API_4_MINDMAP = function() {
    if ((typeof arguments.callee.instance == 'undefined')) {
        arguments.callee.instance = new function() {
            var this_api = this;

            var my_all_data = {};

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

            this.jsDeleteById = function(id) {
                if(confirm("Delete element №"+id+" and its relatives?")) {
                    var childs = this_api.jsRecursiveByParent(id);
                    $.each(childs, function(i, el){
                        api4mindmap.jsFind(el.id, {del:1});
                    });
                    if(id!=1) api4mindmap.jsFind(id, {del:1});
                }
            }
			
			 this.jsRenderAllMap = function(focus_id) { 
		 	 	 if(!focus_id) focus_id = 1;
			 	 var html = "<ul myid='"+focus_id+"'>";
			 	 html = this_api.jsRenderOneParent(focus_id, html); 
			 	 html += "</ul>";
			 	 $("#mindmap").html(html);
			 	 jsMakeDroppable(); 
		 	 }
			 
			this.jsRenderOneElement = function(id) { 
		 	 	 var element = this_api.jsFind(id); 
		 	 	 var childs_count = this_api.jsFindByParent(id).length; 

		 	 	 var icon_type = '';
		 	 	 if(element.icon) icon_type = element.icon; 
		 	 	 
		 	 	 if(childs_count>0) { 
		 	 	 	var collapser_html = "<div class='collapse'></div>"; 
			 	 	var icon = "<div class='type_icon'><i class='icon-folder-1 folder'><div class='count'>"+
			 	 		childs_count+"</div></i><i class='"+icon_type+"'></i>"+"</div>";
		 	 	 } else {
			 	 	var collapser_html = "";
			 	 	var icon = "<div class='type_icon'><i class='"+icon_type+"'></i></div>";
		 	 	 }
		 	 	 
			 	 var answer = icon+"<div class='n_title' contenteditable='true'>"+element.title+
			 	 			       "</div><div class='contextmenu'></div>"+collapser_html;
			 	 return answer; 
		 	 }

        };
        return arguments.callee.instance;

        this.jsRefreshMindmap = function() {
            myjsPlumb.reset();
            var save_scroll_top = $("#mindmap").scrollTop();
            var save_scroll_left = $("#mindmap").scrollLeft();

            var hidden_elements = [];

            $(".hide").each(function(){
                hidden_elements.push($(this).attr("myid"));
            });

            api4mindmap.jsRenderAllMap(1);

            $.each(hidden_elements, function(i, el){
                $("#node_"+el).addClass("hide");
            });

            api4mindmap.jsDrawMindmap(1);
            onResize();

            $("#mindmap").scrollTop(save_scroll_top);
            $("#mindmap").scrollLeft(save_scroll_left);

        }

    }
	
	
	 
    
    
    
     this.jsRegAllKeys = function() { 

			 	 $("#mindmap").on("keydown", ".n_title", function(e){ 
					 
			 	 	 if(e.keyCode==13) {
				 	 	e.preventDefault();
			 	 	 	$(this).blur(); 
			 	 	 }
			 	 });

			 	 $("#mindmap").on("keyup", ".n_title", function(e){
					 e.preventDefault();
			 	 	 if(e.keyCode==13) $(this).blur(); 
				 	 onResize(); 
			 	 });

			 	 $("#mindmap").on("blur", ".n_title", function(){ 
			 	 	 var n_title_text = $(this).html();
			 	 	 var id = $(this).parents("li:first").attr("myid");
			 	 	 if(n_title_text.length==0) n_title_text = "new element"; 
			 	 	 $(this).html( strip_tags(n_title_text) ); 
			 	 	 this_api.jsFind(id, {title:n_title_text}); 
				 	 onResize(); 
			 	 });

			 	 $("#mindmap").on("click", ".n_title", function(){ 
			 	 	$(this).focus();
			 	 });

			 	 $("#mindmap").on("focus", ".n_title", function(){ 
			 	 	var ntitle = $(this);
 	 		 	  	setTimeout(function(){ 
		 	  		if(ntitle.is(":focus")) document.execCommand('selectAll',false,null); 
		 	  		},3); 

			 	 });
			 	 
			 	 $("#mindmap").on("click", ".collapse", function(){ 
			 	 	$(this).parents("li:first").toggleClass("hide"); 
			 	 	api4mindmap.jsDrawMindmap(1); 
			 	 	onResize();
			 	 	return false;
			 	 });

			 	 var font_size = 14; 
			 	 $("#zoom_in").on("click", function(){ /
			 	 	font_size += 1;
			 	 	$("#mindmap").css("font-size", font_size+"px");
			 	 	onResize();
			 	 	return false;
			 	 });
			 	 $("#zoom_out").on("click", function(){ 
			 	 	font_size -= 1;
			 	 	$("#mindmap").css("font-size", font_size+"px");
			 	 	onResize();
			 	 	return false;
			 	 });
			 	 
			 	 $("#collapse_all").on("click", function(){ 
			 	 	$("#node_1 ul li").addClass("hide");
			 	 	onResize();
			 	 	return false;
			 	 });

			 	 $("#expand_all").on("click", function(){ 
			 	 	$("#node_1 ul li").removeClass("hide"); 
			 	 	onResize();
			 	 	return false;
			 	 });
			 	 

		 	 } 
    
    
    
    
    
    
    
    
    
    
    


    this.jsDrawMindmap = function(focus_id) {

        var line_cache = [];

        $("#mindmap ul:visible").each(function(){
            var ul_id = $(this).attr("myid");
            var childs = this_api.jsFindByParent(ul_id);

            $.each(childs, function(i,el){
                var target = el.id;
                if(!$("li[myid='"+target+"']"+" .big_n_title:first").hasClass("_jsPlumb_endpoint_anchor_")) {
                    var parent_id = el.parent_id;
                    line_cache.push( {source: parent_id, target: target} );
                }
            });
        });





};

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