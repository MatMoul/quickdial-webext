var url = 'https://www.matmoul.ch';
var xmlHttp = new XMLHttpRequest();
xmlHttp.timeout = 10000
xmlHttp.open('GET', url, true);
//xmlHttp.setRequestHeader('X-PINGOTHER', 'pingpong');
//xmlHttp.setRequestHeader('Content-Type', 'text/plain');
//xmlHttp.setRequestHeader('Access-Control-Request-Method', '*');
//xmlHttp.setRequestHeader('Origin', url);
//xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
xmlHttp.onload = function(){
	iframe = document.getElementById('iframe');
	iframe.width = 800
	iframe.height = 600
	iframe.style.position = 'absolute';
	//iframe.style.visibility = 'hidden';
	var content = xmlHttp.responseText.replace('<head>', '<head><base href="' + url + '">');
	//iframe.onload = function(){ pageLoaded(); }
	//document.body.appendChild(iframe);
	iframe.srcdoc = content;
}
xmlHttp.send();
