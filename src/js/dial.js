var app = {}
var dial = { 
	styles: {},
	page: 1,
	maxpage: 1
};

window.onload = function(){
	browser.runtime.getBackgroundPage().then(function(page){
		app = page.app;
		dial.initUI();
	}, function(){});
}
window.onresize = function(){
	if(app && app.settings) dial.updateGridLayout(dial.Grid, app.settings.grid, dial.styles.grid);
}
window.onwheel = function(ev){
	if(app && app.settings){
		if(ev.deltaY > 0){
			if(dial.page < dial.maxpage){
				dial.page += 1;
				dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
			}
		} else if(ev.deltaY < 0){
			if(dial.page > 1){
				dial.page -= 1;
				dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
			}
		}
	}
}
browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	switch(request.command){
		case 'gridNodesSynced':
			if(app.settings) dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
			break;
	}
});


dial.initUI = function(){
	dial.Head = document.getElementById('head');
	dial.Body = document.getElementById('body');
	dial.Body.setAttribute('contextmenu', 'page');
	dial.Body.setAttribute('contextmenu', 'page');
	dial.initStyles();
	dial.initMenus();
	dial.Grid = dial.initGrid('Grid', app.settings.grid, dial.Body);
	var url = new URL(window.location);
	dial.path = url.searchParams.get('path');
	if(url.searchParams.get('path')) {
		dial.Node = app.getNode(app.settings.grid.node, dial.path + '/');
	}	else {
		dial.Node = app.getNode(app.settings.grid.node, '/');
	}
	dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
}

dial.initStyles = function(){
	dial.Style = document.createElement('style'), StyleSheet;
	document.head.appendChild(dial.Style);
	dial.styles.html = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('html { height: 100%; }')].style;
	dial.styles.body = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('body { user-select: none; -moz-user-select: none; display: flex;	width: 100%; height: 100%; margin: 0px; padding: 0px; background: ' + app.settings.background + '; }')].style;
	dial.styles.grid = {};
	dial.styles.grid.grid = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid { border-collapse: collapse; margin: auto auto; }')].style;
	dial.styles.grid.cell = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td { margin: 0px; padding: 0px; }')].style;
	dial.styles.grid.link = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a { display: block; outline: none; text-decoration: none; margin: ' + app.settings.grid.cells.margin + 'px; border: 1px solid ' + app.settings.grid.cells.borderColor + '; border-radius: ' + app.settings.grid.cells.borderRadius + 'px; }')].style;
	dial.styles.grid.linkHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover { border-color: ' + app.settings.grid.cells.borderColorHover + '; }')].style;
	dial.styles.grid.linkPanel = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:first-child { background-repeat: no-repeat; }')].style;
	dial.styles.grid.linkTitle = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:last-child { height: ' + app.settings.grid.cells.titleHeight + 'px; font-size: ' + app.settings.grid.cells.titleFontSize + 'pt; font-family: ' + app.settings.grid.cells.titleFont + 'pt; text-align: center; overflow: hidden; color: ' + app.settings.grid.cells.titleColor + '; border-top: 1px solid ' + app.settings.grid.cells.borderColor + '; }')].style;
	dial.styles.grid.linkTitleHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover>div:last-child { color: ' + app.settings.grid.cells.titleColorHover + '; border-top-color: ' + app.settings.grid.cells.borderColorHover + ' }')].style;
	dial.styles.grid.linkEmpty = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Empty { display: none; }')].style;
	dial.styles.grid.linkBack = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Back :first-child { background-image: url("' + app.settings.grid.cells.backIcon + '"); background-repeat: no-repeat; background-position: center center; }')].style;
	dial.styles.grid.linkFolder = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Folder :first-child { background-image: url("' + app.settings.grid.cells.folderIcon + '"); background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid.linkBookmark = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Bookmark :first-child { background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid.linkBookmarkLoading = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.BookmarkLoading :first-child { background-image: url("' + app.settings.grid.cells.loadingIcon + '"); background-repeat: no-repeat; background-position: center center; }')].style;
}

dial.initMenus = function(){
	dial.PageMenu = document.createElement('menu');
	dial.PageMenu.type = 'context';
	dial.PageMenu.id = 'page'
	dial.PageMenuCreateBookmark = document.createElement('menuitem');
	dial.PageMenuCreateBookmark.label = 'Add bookmark';
	dial.PageMenuCreateBookmark.onclick = dial.createBookmark;
	dial.PageMenuCreateFolder = document.createElement('menuitem');
	dial.PageMenuCreateFolder.label = 'Add folder';
	dial.PageMenuCreateFolder.onclick = dial.createFolder;
	dial.PageMenu.appendChild(dial.PageMenuCreateBookmark);
	dial.PageMenu.appendChild(dial.PageMenuCreateFolder);
	dial.Body.appendChild(dial.PageMenu);

	dial.ItemMenu = document.createElement('menu');
	dial.ItemMenu.type = 'context';
	dial.ItemMenu.id = 'item'
	dial.ItemMenuCreateBookmark = document.createElement('menuitem');
	dial.ItemMenuCreateBookmark.label = browser.i18n.getMessage("menuAddBookmark");
	dial.ItemMenuCreateBookmark.onclick = dial.createBookmark;
	dial.ItemMenuCreateFolder = document.createElement('menuitem');
	dial.ItemMenuCreateFolder.label = browser.i18n.getMessage("menuAddFolder");
	dial.ItemMenuCreateFolder.onclick = dial.createFolder;
	dial.ItemMenuEdit = document.createElement('menuitem');
	dial.ItemMenuEdit.label = 'Edit';
	//dial.ItemMenuEdit.onclick = dial.test;
	dial.ItemMenuRefresh = document.createElement('menuitem');
	dial.ItemMenuRefresh.label = 'Refresh';
	dial.ItemMenuRefresh.label = browser.i18n.getMessage("menuRefreshItem");
	dial.ItemMenuRefresh.onclick = dial.refreshNode;
	dial.ItemMenuDelete = document.createElement('menuitem');
	dial.ItemMenuDelete.label = browser.i18n.getMessage("menuDeleteItem");
	dial.ItemMenuDelete.onclick = dial.deleteNode;
	dial.ItemMenu.appendChild(dial.ItemMenuCreateBookmark);
	dial.ItemMenu.appendChild(dial.ItemMenuCreateFolder);
	dial.ItemMenu.appendChild(document.createElement('hr'));
	//dial.ItemMenu.appendChild(dial.ItemMenuEdit);
	dial.ItemMenu.appendChild(dial.ItemMenuRefresh);
	dial.ItemMenu.appendChild(dial.ItemMenuDelete);
	dial.Body.appendChild(dial.ItemMenu);
}

dial.initGrid = function(name, settings, container){
	var grid = document.createElement('table');
	grid.className = name;
	grid.getLink = function(index){
		var num_columns = grid.rows[0].cells.length;
		return grid.rows[Math.floor(index/num_columns)].cells[index % num_columns].childNodes[0];
	}
	for(var i=0; i<settings.rows; i++){
		var row = grid.insertRow();
		for(var j=0; j<settings.columns; j++){
			var cell = row.insertCell();
			var link = document.createElement('a');
			cell.setAttribute('gridindex', (i * settings.columns + j));
			cell.appendChild(link);
			link.appendChild(document.createElement('div'));
			link.appendChild(document.createElement('div'));
			link.onmousedown = function(){ dial._selectedItem = this; };
			
			function dragstart_handler(ev) {
				ev.dataTransfer.setData("text/plain", ev.target.parentElement.getAttribute('gridindex'));
			 }
			 function dragover_handler(ev) {
				ev.preventDefault();
				ev.dataTransfer.dropEffect = "move"
			}
			function drop_handler(ev) {
				ev.preventDefault();
				if(ev.buttons == 1) return;
				var StartIndex = ev.dataTransfer.getData("text");
				var EndIndex = 0;
				if(ev.target.tagName == 'DIV'){
					EndIndex = ev.target.parentElement.parentElement.getAttribute('gridindex')
				} else{
					EndIndex = ev.target.getAttribute('gridindex');
				}
				if(settings.cells.backPanel && dial.path){
					StartIndex-=1;
					EndIndex-=1;
				}
				app.setNodeIndex(dial.Node, StartIndex, EndIndex, function(){
					dial.populateGrid(grid, app.settings.grid, dial.Node);
				});
			}
			link.draggable = true;
			link.ondragstart = dragstart_handler;
			cell.ondragover = dragover_handler;
			cell.ondrop = drop_handler;
			
		}
	}
	container.appendChild(grid);
	dial.updateGridLayout(grid, settings, dial.styles.grid);
	return grid;
}

dial.updateGridLayout = function(grid, settings, styles){
	var fullWidth = grid.parentElement.offsetWidth - 2 * settings.margin;
	var fullHeight = grid.parentElement.offsetHeight - 2 * settings.margin;
	var linkWidth = fullWidth / settings.columns;
	var linkHeight = fullHeight / settings.rows;
	if(linkWidth <= linkHeight * settings.cells.ratioX / settings.cells.ratioY) linkHeight = linkWidth / settings.cells.ratioX * settings.cells.ratioY;
	else linkWidth = linkHeight / settings.cells.ratioY * settings.cells.ratioX;
	styles.cell.width = linkWidth.toString() + 'px';
	styles.cell.height = linkHeight.toString() + 'px';
	linkWidth = linkWidth - 2 * (settings.cells.margin + 1);
	linkHeight = linkHeight - 2 * (settings.cells.margin + 1);
	styles.link.width = linkWidth.toString() + 'px';
	styles.link.height = linkHeight.toString() + 'px';
	if(settings.cells.title) styles.linkPanel.height = (linkHeight - settings.cells.titleHeight - 1).toString() + 'px';
	else styles.linkPanel.height = linkHeight.toString() + 'px';
}

dial.populateGrid = function(grid, settings, node){
	populateEmpty = function(link){
		link.Node = null;
		link.className = 'Empty';
		link.childNodes[0].style.backgroundImage = '';
		link.href = null;
		link.onclick = null;
		link.removeAttribute('contextmenu');
	}
	populateBack = function(link){
		link.Node = null;
		link.className = 'Back';
		link.childNodes[0].style.backgroundImage = '';
		link.childNodes[1].innerText = 'Back';
		link.href = '#';
		link.onclick = function(){ window.history.back(); }
		link.removeAttribute('contextmenu');
	}
	populateFolder = function(link, node){
		link.Node = node;
		link.className = 'Folder';
		link.childNodes[0].style.backgroundImage = '';
		link.childNodes[1].innerText = node.title;
		if(dial.path) link.href = '?path=' + dial.path + '/' + node.title;
		else link.href = '?path=' + node.title;
		link.onclick = null;
		link.setAttribute('contextmenu', 'item');
	}
	populateBookmark = function(link, node){
		link.Node = node;
		if(node.image){
			link.className = 'Bookmark';
			link.childNodes[0].style.backgroundImage = 'url(' + node.image + ')';
		} else {
			link.className = 'BookmarkLoading';
			link.childNodes[0].style.backgroundImage = '';
			app.refreshNode(node, function(){
				link.className = 'Bookmark';
				link.childNodes[0].style.backgroundImage = 'url(' + node.image + ')';
				link.childNodes[1].innerText = node.title;
			});
		}
		link.childNodes[1].innerText = node.title;
		link.href = node.url;
		link.onclick = null;
		link.setAttribute('contextmenu', 'item');
	}

	var iBase = 0;
	var linkItem = 0;
	var allCells = settings.rows * settings.columns;
	var maxCells = allCells;
	if(settings.cells.backPanel && dial.path){
		populateBack(grid.getLink(linkItem));
		linkItem++;
		maxCells -= 1;
	}
	dial.maxpage = Math.floor(node.children.length / maxCells);
	if(dial.maxpage != node.children.length / maxCells) dial.maxpage += 1;
	if(dial.page > dial.maxpage) dial.page = dial.maxpage;
	if(dial.page > 1) iBase = (dial.page -1) * maxCells;
	for(var i = iBase; i<node.children.length && i<maxCells + iBase; i++) {
		switch(node.children[i].type){
			case 'empty':
				populateEmpty(grid.getLink(linkItem));
				break;
			case 'folder':
				populateFolder(grid.getLink(linkItem), node.children[i]);
				break;
			case 'bookmark':
				populateBookmark(grid.getLink(linkItem), node.children[i]);
				break;
		}
		linkItem++;
	}
	while(linkItem<allCells){
		populateEmpty(grid.getLink(linkItem));
		linkItem++;
	}
}

dial.createBookmark = function(){
	var url = prompt(browser.i18n.getMessage("AddBookmarkPrompt"), 'https://');
	if(url) app.createBookmark(dial.Node, url);
};

dial.createFolder = function(){
	var name = prompt(browser.i18n.getMessage("AddFolderPrompt"), 'New Folder');
	if(name) app.createFolder(dial.Node, name);
};

dial.refreshNode = function(){
	if(dial._selectedItem.Node.type == 'bookmark'){
		var link = dial._selectedItem;
		link.className = 'BookmarkLoading';
		link.childNodes[0].style.backgroundImage = '';
		app.refreshNode(link.Node, function(){
			link.className = 'Bookmark';
			link.childNodes[0].style.backgroundImage = 'url(' + link.Node.image + ')';
			link.childNodes[1].innerText = link.Node.title;
		});
	}
}

dial.deleteNode = function(){
	if(confirm(browser.i18n.getMessage("deleteItemConfimation", dial._selectedItem.Node.title))){
		app.deleteNode(dial._selectedItem.Node.id);
	}
}