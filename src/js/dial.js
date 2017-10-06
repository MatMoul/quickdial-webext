var app = {}
var dial = { 
	styles: {},
	page: 1,
	maxpage: 1
};

window.onload = function(){
	function initPage(){
		browser.runtime.getBackgroundPage().then(function(page){
			if(page.app.settings){
				app = page.app;
				dial.initUI();
				browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
					switch(request.command){
						case 'SettingsChanged':
							if(app.settings){
								dial.Head.removeChild(dial.Style);
								dial.Body.removeChild(dial.Grid);
								dial.initStyles();
								dial.Grid = dial.initGrid('Grid', app.settings.grid, dial.Body);
								var url = new URL(window.location);
								dial.path = url.searchParams.get('path');
								if(url.searchParams.get('path')) {
									dial.Node = app.getNode(app.settings.grid.node, dial.path + '/');
								}	else {
									dial.Node = app.getNode(app.settings.grid.node, '/');
								}
								dial.Title.innerText = dial.Node.title;
								dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
							}
							break;
						case 'GridNodesSaved':
							if(app.settings) dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
							break;
						case 'GridNodeSaved':
							// request.gridNode	
							if(app.settings) dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
							break;
					}
				});
			} else{
				setTimeout(initPage, 100);
			}
		}, function(){});
	}
	initPage();
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


dial.initUI = function(){
	dial.Head = document.getElementById('head');
	dial.Title = document.getElementById('title');
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
	dial.Title.innerText = dial.Node.title;
	dial.populateGrid(dial.Grid, app.settings.grid, dial.Node);
}

dial.initStyles = function(){
	dial.Style = document.createElement('style'), StyleSheet;
	document.head.appendChild(dial.Style);
	dial.styles.html = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('html { height: 100%; }')].style;
	dial.styles.body = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('body { user-select: none; -moz-user-select: none; display: flex;	width: 100%; height: 100%; margin: 0px; padding: 0px; background-color: ' + app.settings.backgroundColor + '; background-image: ' + app.settings.backgroundImage + '; background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid = {};
	dial.styles.grid.grid = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid { border-collapse: collapse; margin: auto; }')].style;
	dial.styles.grid.cell = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td { margin: 0px; padding: 0px; }')].style;
	dial.styles.grid.link = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a { display: block; outline: none; overflow: hidden; text-decoration: none; margin: ' + app.settings.grid.cells.margin + 'px; border: 1px solid ' + app.settings.grid.cells.borderColor + '; border-radius: ' + app.settings.grid.cells.borderRadius + 'px; }')].style;
	//dial.styles.grid.linkHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover { border-color: ' + app.settings.grid.cells.borderColorHover + '; border-radius: ' + app.settings.grid.cells.borderRadiusHover + 'px; }')].style;
	dial.styles.grid.linkHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover { border-color: ' + app.settings.grid.cells.borderColorHover + '; margin: ' + app.settings.grid.cells.marginHover + 'px; border-radius: ' + app.settings.grid.cells.borderRadiusHover + 'px; }')].style;
	dial.styles.grid.linkPanel = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:first-child { background-repeat: no-repeat; }')].style;
	if(app.settings.grid.cells.backgroundColor) dial.styles.grid.linkPanel.backgroundColor = app.settings.grid.cells.backgroundColor;
	dial.styles.grid.linkPanelHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover>div:first-child { }')].style;
	if(app.settings.grid.cells.backgroundColorHover) dial.styles.grid.linkPanelHover.backgroundColor = app.settings.grid.cells.backgroundColorHover;
	dial.styles.grid.linkTitle = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:last-child { height: ' + app.settings.grid.cells.titleHeight + 'px; font-size: ' + app.settings.grid.cells.titleFontSize + 'pt; font-family: ' + app.settings.grid.cells.titleFont + 'pt; text-align: center; overflow: hidden; color: ' + app.settings.grid.cells.titleColor + '; border-top: 1px solid ' + app.settings.grid.cells.borderColor + '; }')].style;
	if(app.settings.grid.cells.titleBackgroundColor) dial.styles.grid.linkTitle.backgroundColor = app.settings.grid.cells.titleBackgroundColor;
	dial.styles.grid.linkTitleHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover>div:last-child { color: ' + app.settings.grid.cells.titleColorHover + '; border-top-color: ' + app.settings.grid.cells.borderColorHover + ' }')].style;
	if(app.settings.grid.cells.titleBackgroundColorHover) dial.styles.grid.linkTitleHover.backgroundColor = app.settings.grid.cells.titleBackgroundColorHover;
	dial.styles.grid.linkEmpty = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Empty { display: none; }')].style;
	dial.styles.grid.linkBack = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Back :first-child { background-image: ' + app.settings.grid.backIcon + '; background-repeat: no-repeat; background-position: center center; }')].style;
	dial.styles.grid.linkFolder = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Folder :first-child { background-image: ' + app.settings.grid.folderIcon + '; background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid.linkBookmark = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Bookmark :first-child { background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid.linkBookmarkLoading = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.BookmarkLoading :first-child { background-image: url("' + app.settings.grid.cells.loadingIcon + '"); background-repeat: no-repeat; background-position: center center; }')].style;
}

dial.initMenus = function(){
	dial.PageMenu = document.createElement('menu');
	dial.PageMenu.type = 'context';
	dial.PageMenu.id = 'page'
	dial.PageMenuNew = document.createElement('menu');
	dial.PageMenuNew.label = browser.i18n.getMessage("menuNew");
	dial.PageMenuCreateBookmark = document.createElement('menuitem');
	dial.PageMenuCreateBookmark.label = browser.i18n.getMessage("menuNewBookmark");
	dial.PageMenuCreateBookmark.onclick = dial.createBookmark;
	dial.PageMenuCreateFolder = document.createElement('menuitem');
	dial.PageMenuCreateFolder.label = browser.i18n.getMessage("menuNewFolder");
	dial.PageMenuCreateFolder.onclick = dial.createFolder;
	dial.PageMenuSettings = document.createElement('menuitem');
	dial.PageMenuSettings.label = browser.i18n.getMessage("menuSettings");
	dial.PageMenuSettings.onclick = dial.editSettings;
	
	dial.PageMenu.appendChild(dial.PageMenuNew);
	dial.PageMenuNew.appendChild(dial.PageMenuCreateBookmark);
	dial.PageMenuNew.appendChild(dial.PageMenuCreateFolder);
	dial.PageMenu.appendChild(document.createElement('hr'));
	dial.PageMenu.appendChild(dial.PageMenuSettings);
	dial.Body.appendChild(dial.PageMenu);

	dial.ItemMenu = document.createElement('menu');
	dial.ItemMenu.type = 'context';
	dial.ItemMenu.id = 'item'

	dial.ItemMenuNew = document.createElement('menu');
	dial.ItemMenuNew.label = browser.i18n.getMessage("menuNew");
	
	dial.ItemMenuCreateBookmark = document.createElement('menuitem');
	dial.ItemMenuCreateBookmark.label = browser.i18n.getMessage("menuNewBookmark");
	dial.ItemMenuCreateBookmark.onclick = dial.createBookmark;
	dial.ItemMenuCreateFolder = document.createElement('menuitem');
	dial.ItemMenuCreateFolder.label = browser.i18n.getMessage("menuNewFolder");
	dial.ItemMenuCreateFolder.onclick = dial.createFolder;
	/*
	dial.ItemMenuEdit = document.createElement('menuitem');
	dial.ItemMenuEdit.label = 'Edit';
	//dial.ItemMenuEdit.onclick = dial.test;
	*/
	dial.ItemMenuRefresh = document.createElement('menuitem');
	dial.ItemMenuRefresh.label = browser.i18n.getMessage("menuRefreshItem");
	dial.ItemMenuRefresh.onclick = dial.refreshNode;

	dial.ItemMenuCapture = document.createElement('menuitem');
	dial.ItemMenuCapture.label = browser.i18n.getMessage("menuCapturePage");
	dial.ItemMenuCapture.onclick = dial.capturePage;
	
	dial.ItemMenuDelete = document.createElement('menuitem');
	dial.ItemMenuDelete.label = browser.i18n.getMessage("menuDeleteItem");
	dial.ItemMenuDelete.onclick = dial.deleteNode;

	dial.ItemMenuSettings = document.createElement('menuitem');
	dial.ItemMenuSettings.label = browser.i18n.getMessage("menuSettings");
	dial.ItemMenuSettings.onclick = dial.editSettings;
	
	dial.ItemMenu.appendChild(dial.ItemMenuNew);
	dial.ItemMenuNew.appendChild(dial.ItemMenuCreateBookmark);
	dial.ItemMenuNew.appendChild(dial.ItemMenuCreateFolder);
	dial.ItemMenu.appendChild(document.createElement('hr'));
	//dial.ItemMenu.appendChild(dial.ItemMenuEdit);
	dial.ItemMenu.appendChild(dial.ItemMenuRefresh);
	dial.ItemMenu.appendChild(dial.ItemMenuCapture);
	dial.ItemMenu.appendChild(dial.ItemMenuDelete);
	dial.ItemMenu.appendChild(document.createElement('hr'));
	dial.ItemMenu.appendChild(dial.ItemMenuSettings);
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
				var index = (dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.parentElement.getAttribute('gridindex'));
				if(settings.cells.backPanel && dial.path) index -= dial.page;
				console.log(index);
				ev.dataTransfer.setData("text/plain", index);
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
					EndIndex = (dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.parentElement.parentElement.getAttribute('gridindex'));
				} else{
					EndIndex =(dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.getAttribute('gridindex'));
				}
				if(settings.cells.backPanel && dial.path) EndIndex -= dial.page;
				app.setNodeIndex(dial.Node, StartIndex, EndIndex);
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
			case app.GridNodeType.empty:
				populateEmpty(grid.getLink(linkItem));
				break;
			case app.GridNodeType.folder:
				populateFolder(grid.getLink(linkItem), node.children[i]);
				break;
			case app.GridNodeType.bookmark:
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
	if(dial._selectedItem.Node.type == app.GridNodeType.bookmark){
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
	if(confirm(browser.i18n.getMessage("deleteItemConfimation", dial._selectedItem.Node.title)))
		app.deleteNode(dial.Node, dial._selectedItem.Node.id);
}

dial.capturePage = function(){
	if(dial._selectedItem.Node.type == app.GridNodeType.bookmark)
		app.capturePage(dial._selectedItem.Node);
}



dial.PopupPanel = function(width, height, modal){ // PopupPanel Object
	this.panelContainer = document.createElement('div');
	this.panelContainer.style.position = 'fixed';
	this.panelContainer.style.left = '0pt';
	this.panelContainer.style.top = '0pt';
	this.panelContainer.style.width = '100%';
	this.panelContainer.style.height = '100%';
	
	this.panel = document.createElement('div');
	this.panel.style.margin = 'auto';
	this.panel.style.marginTop = '30pt';
	this.panel.style.width = width + 'px';
	this.panel.style.height = height + 'px';
	this.panel.style.backgroundColor = '#FFFFFF';
	this.panelContainer.appendChild(this.panel);
	this.frame = this.panel;
	if(modal == true){
		this.modal = document.createElement('div');
		this.modal.style.position = 'fixed';
		this.modal.style.left = '0px';
		this.modal.style.top = '0px';
		this.modal.style.width = '100%';
		this.modal.style.height = '100%';
		this.modal.style.backgroundColor = '#404040';
		this.modal.style.opacity = 0.5;
		this._contextMenuHandler = function(e){ e.preventDefault(); }
		this.popup = function(){
			window.addEventListener('contextmenu', this._contextMenuHandler, false);
			dial.Body.appendChild(this.modal);
			dial.Body.appendChild(this.panelContainer);
		}
		this.close = function(){
			dial.Body.removeChild(this.modal);
			dial.Body.removeChild(this.panelContainer);
			window.removeEventListener('contextmenu', this._contextMenuHandler, false);
		}
	} else {
		this.popup = function(){
			dial.Body.appendChild(this.panelContainer);
		}
		this.close = function(){
			dialBody.removeChild(this.panelContainer);
		}
	}
}

dial.editSettings = function(){
	var popup = new dial.PopupPanel(500, 420, true);
	var iframe = document.createElement('iframe');
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.backgroundColor = 'transparent';
	iframe.style.border = '0px none transparent';
	iframe.style.padding = '0px';
	iframe.style.overflow = 'hidden';
	popup.frame.appendChild(iframe);
	iframe.src = '/html/settings.html';
	iframe.popup = popup;
	popup.popup();
}
