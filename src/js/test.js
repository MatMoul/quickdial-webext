window.onload = function (){
	var url = 'https://www.matmoul.ch/';
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.timeout = 2000;
	xmlHttp.open('GET', url, true);
	xmlHttp.onload = function(){
		var iframe = document.getElementById('IFrame');
		iframe.contentWindow.document.write(xmlHttp.responseText.replace('<head>', '<head><base href="' + url + '">'));
	}
	xmlHttp.send(null);
}
