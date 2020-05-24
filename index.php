<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ru" class="" style="">

<meta HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">
<meta charset="utf-8">
<meta name="keywords" content="MindMap"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
<link rel="icon" href="favicon.png" type="image/x-icon" />

<head>

	<link rel="stylesheet" href="mindmap.css">
	<link rel="stylesheet" href="fontello/css/fontello.css">
    <link rel="stylesheet" type="text/css" href="contextmenu/src/jquery.contextMenu.css"/>
	<script src="js/jquery-1.10.1.min.js"></script>
	<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
 	<script src="js/jquery.jsPlumb-1.4.1-all.js"></script>
	<script src="mindmap.js"></script>
    <script src="contextmenu/src/jquery.contextMenu.js"></script>	  	  
 	<script src="contextmenu/src/jquery.ui.position.js"></script>	  	  
	<script src="js/ydn.db-jquery-0.7.5.js"></script>
	
	<title>MindMap </title>
</head>
<body onload="jsDoFirst();" onresize="onResize()">
<div id="mindmap_header">	
	<i id="zoom_out" class="icon-zoom-out" title="Zoom- map"></i>	
	<i id="zoom_in" class="icon-zoom-in" title="Zoom+ map"></i>	
	&nbsp;&nbsp;
	<i id="collapse_all" class="icon-minus-circle" title="Collapse all"></i>
	<i id="expand_all" class="icon-plus-circle" title="Expand all"></i>
</div>
<div id="mindmap_content">
	<div id="mindmap">
	</div>
</div>
<div id="mindmap_footer">
</div>
</body>
</html>