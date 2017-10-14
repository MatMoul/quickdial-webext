var utils = {};
var app = {};
var dial = {
	page: 1,
	maxpage: 1
};

document.addEventListener("DOMContentLoaded", function(event) {
	document.body.style.backgroundColor = utils.getBackgroundColor();
	app.init();
	dial.init();
});

window.onresize = function(){
	if(app && app.settings) dial.updateGridLayout();
}
window.onwheel = function(ev){
	if(app && app.settings){
		if(ev.deltaY > 0){
			if(dial.page < dial.maxpage){
				dial.page += 1;
				dial.populateGrid();
			}
		} else if(ev.deltaY < 0){
			if(dial.page > 1){
				dial.page -= 1;
				dial.populateGrid();
			}
		}
	}
}



utils.getBackgroundColor = function(){
	return new URL(window.location).searchParams.get('bg');
};
utils.getPath = function(){
	var path = new URL(window.location).searchParams.get('path');
	if(path) return path + '/';
	else return '/';
};

app.init = function(){
	app.Messages.getSettings(function(settings){
		if(settings && settings.grid) app.Settings._changed(settings);
		dial.path = utils.getPath();
		app.Messages.getNode(dial.path, app.GridNodes._changed);
		app.Messages.init();
	});
};

app.Messages = {};
app.Messages.Commands = {
	getSettings: 0,
	setSettings: 1,
	getNode: 2,
	getNodeByID: 3,
	updateNode: 4,
	setNodeIndex: 5,
	createBookmark: 6,
	createFolder: 7,
	deleteNode: 8,
	refreshNode: 9,
	capturePage: 10,
	settingsChanged: 100,
	gridNodesLoaded: 101
};
app.Messages.init = function(){
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.cmd){
			case app.Messages.Commands.settingsChanged:
				app.Messages.getSettings(app.Settings._changed);
				break;
			case app.Messages.Commands.gridNodesLoaded:
				app.Messages.getNode(dial.path, app.GridNodes._changed);
				break;
		}
	});
};
app.Messages.getSettings = function(callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.getSettings }).then(callback, callback);
};
app.Messages.getNode = function(path, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.getNode, path: path }).then(callback);
};
app.Messages.setNodeIndex = function(index, newIndex, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.setNodeIndex, path: dial.path, index: index, newIndex: newIndex }).then(callback);
};
app.Messages.createBookmark = function(url, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.createBookmark, path: dial.path, url: url, title: url }).then(callback);
};
app.Messages.createFolder = function(name, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.createFolder, path: dial.path, name: name }).then(callback);
};
app.Messages.deleteNode = function(id, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.deleteNode, path: dial.path, id: id }).then(callback);
};
app.Messages.refreshNode = function(id, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.refreshNode, path: dial.path, id: id }).then(callback);
}
app.Messages.capturePage = function(id, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.capturePage, path: dial.path, id: id }).then(callback);
}


app.Settings = {};
app.Settings._changed = function(settings){
	app.settings = settings;
	dial.initStyles();
	dial.initGrid();
};

app.GridNodes = {};
app.GridNodes.GridNodeType = { // GridNodeType
	back: -1,
	empty: 0,
	folder: 1,
	bookmark: 2
}
app.GridNodes._changed = function(node){
	app.node = node;
	dial.Title.innerText = app.node.title;
	dial.populateGrid();
};




dial.init = function(){
	dial.initMenus();
	dial.Title = document.createElement('title');
	document.head.appendChild(dial.Title);
};
dial.initMenus = function(){
	document.body.setAttribute('contextmenu', 'page');
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
	document.body.appendChild(dial.PageMenu);

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
	
	dial.ItemMenuProperties = document.createElement('menuitem');
	dial.ItemMenuProperties.label = browser.i18n.getMessage("menuProperties");
	dial.ItemMenuProperties.onclick = function(){
		dial.editProperties(dial._selectedItem);
	};
	
	dial.ItemMenuRefresh = document.createElement('menuitem');
	dial.ItemMenuRefresh.label = browser.i18n.getMessage("menuRefreshItem");
	dial.ItemMenuRefresh.onclick = function(){
		dial.refreshNode(dial._selectedItem);
	};

	dial.ItemMenuCapture = document.createElement('menuitem');
	dial.ItemMenuCapture.label = browser.i18n.getMessage("menuCapturePage");
	dial.ItemMenuCapture.onclick = function(){
		dial.capturePage(dial._selectedItem);
	};
	
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
	dial.ItemMenu.appendChild(dial.ItemMenuProperties);
	dial.ItemMenu.appendChild(dial.ItemMenuRefresh);
	dial.ItemMenu.appendChild(dial.ItemMenuCapture);
	dial.ItemMenu.appendChild(dial.ItemMenuDelete);
	dial.ItemMenu.appendChild(document.createElement('hr'));
	dial.ItemMenu.appendChild(dial.ItemMenuSettings);
	document.body.appendChild(dial.ItemMenu);
}
dial.initStyles = function(){
	if(dial.Style) document.head.removeChild(dial.Style);
	dial.Style = document.createElement('style'), StyleSheet;
	document.head.appendChild(dial.Style);
	dial.styles = {};
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
};
dial.initGrid = function(){
	if(dial.Grid) document.body.removeChild(dial.Grid);
	dial.Grid = document.createElement('table');
	var grid = document.createElement('table');
	dial.Grid.className = 'Grid';
	dial.Grid.getLink = function(index){
		var num_columns = dial.Grid.rows[0].cells.length;
		return dial.Grid.rows[Math.floor(index/num_columns)].cells[index % num_columns].childNodes[0];
	}
	for(var i=0; i<app.settings.grid.rows; i++){
		var row = dial.Grid.insertRow();
		for(var j=0; j<app.settings.grid.columns; j++){
			var cell = row.insertCell();
			var link = document.createElement('a');
			cell.setAttribute('gridindex', (i * app.settings.grid.columns + j));
			cell.appendChild(link);
			link.className = 'Empty';
			link.appendChild(document.createElement('div'));
			link.appendChild(document.createElement('div'));
			link.onmousedown = function(){ dial._selectedItem = this; };
			
			function dragstart_handler(ev) {
				var index = (dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.parentElement.getAttribute('gridindex'));
				if(app.settings.grid.backNode && dial.path != '/') index -= dial.page;
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
					EndIndex = (dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.getAttribute('gridindex'));
				}
				if(app.settings.grid.backNode && dial.path != '/') EndIndex -= dial.page;
				app.Messages.setNodeIndex(StartIndex, EndIndex);
			}
			link.draggable = true;
			link.ondragstart = dragstart_handler;
			cell.ondragover = dragover_handler;
			cell.ondrop = drop_handler;
		}
	}
	document.body.appendChild(dial.Grid);
	dial.updateGridLayout();
	return dial.Grid;
};
dial.updateGridLayout = function(){
	var fullWidth = dial.Grid.parentElement.offsetWidth - 2 * app.settings.grid.margin;
	var fullHeight = dial.Grid.parentElement.offsetHeight - 2 * app.settings.grid.margin;
	var linkWidth = fullWidth / app.settings.grid.columns;
	var linkHeight = fullHeight / app.settings.grid.rows;
	if(linkWidth <= linkHeight * 4 / 3) linkHeight = linkWidth / 4 * 3;
	else linkWidth = linkHeight / 3 * 4;
	
	dial.styles.grid.cell.width = linkWidth.toString() + 'px';
	dial.styles.grid.cell.height = linkHeight.toString() + 'px';

	linkWidth = linkWidth - 2 * (app.settings.grid.cells.margin + 1);
	linkHeight = linkHeight - 2 * (app.settings.grid.cells.margin + 1);
	
	dial.styles.grid.link.width = linkWidth.toString() + 'px';
	dial.styles.grid.link.height = linkHeight.toString() + 'px';
	if(app.settings.grid.cells.title) dial.styles.grid.linkPanel.height = (linkHeight - app.settings.grid.cells.titleHeight - 1).toString() + 'px';
	else dial.styles.grid.linkPanel.height = linkHeight.toString() + 'px';
};
dial.populateGrid = function(){
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
		if(node.image) link.childNodes[0].style.backgroundImage = 'url(' + node.image + ')';
		else link.childNodes[0].style.backgroundImage = '';
		link.childNodes[1].innerText = node.title;
		if(dial.path) link.href = '?' + 'bg=' + encodeURIComponent(app.settings.backgroundColor) + '&path=' + encodeURIComponent(dial.path + node.title);
		else link.href = '?' + 'bg=' + encodeURIComponent(app.settings.backgroundColor) + '&path=' + encodeURIComponent(node.title);
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
			dial.refreshNode(link);
		}
		link.childNodes[1].innerText = node.title;
		link.href = node.url;
		link.onclick = null;
		link.setAttribute('contextmenu', 'item');
	}

	var iBase = 0;
	var linkItem = 0;
	var allCells = app.settings.grid.rows * app.settings.grid.columns;
	var maxCells = allCells;
	if(app.settings.grid.backNode && dial.path != '/'){
		populateBack(dial.Grid.getLink(linkItem));
		linkItem++;
		maxCells -= 1;
	}
	dial.maxpage = Math.floor(app.node.children.length / maxCells);
	if(dial.maxpage != app.node.children.length / maxCells) dial.maxpage += 1;
	if(dial.page > dial.maxpage) dial.page = dial.maxpage;
	if(dial.page > 1) iBase = (dial.page -1) * maxCells;
	for(var i = iBase; i<app.node.children.length && i<maxCells + iBase; i++) {
		switch(app.node.children[i].type){
			case app.GridNodes.GridNodeType.empty:
				populateEmpty(dial.Grid.getLink(linkItem));
				break;
			case app.GridNodes.GridNodeType.folder:
				populateFolder(dial.Grid.getLink(linkItem), app.node.children[i]);
				break;
			case app.GridNodes.GridNodeType.bookmark:
				populateBookmark(dial.Grid.getLink(linkItem), app.node.children[i]);
				break;
		}
		linkItem++;
	}
	while(linkItem<allCells){
		populateEmpty(dial.Grid.getLink(linkItem));
		linkItem++;
	}
};
dial.createBookmark = function(){
	var url = prompt(browser.i18n.getMessage("AddBookmarkPrompt"), 'https://');
	if(url) app.Messages.createBookmark(url);
};
dial.createFolder = function(){
	var name = prompt(browser.i18n.getMessage("AddFolderPrompt"), 'New Folder');
	if(name) app.Messages.createFolder(name);
};
dial.deleteNode = function(){
	if(confirm(browser.i18n.getMessage("deleteItemConfimation", dial._selectedItem.Node.title)))
		app.Messages.deleteNode(dial._selectedItem.Node.id);
}
dial.refreshNode = function(selectedItem){
	selectedItem.className = 'BookmarkLoading';
	selectedItem.childNodes[0].style.backgroundImage = app.settings.grid.loadingIcon;
	app.Messages.refreshNode(selectedItem.Node.id);
}
dial.capturePage = function(selectedItem){
	selectedItem.className = 'BookmarkLoading';
	selectedItem.childNodes[0].style.backgroundImage = app.settings.grid.loadingIcon;
	app.Messages.capturePage(selectedItem.Node.id);
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
			document.body.appendChild(this.modal);
			document.body.appendChild(this.panelContainer);
		}
		this.close = function(){
			document.body.removeChild(this.modal);
			document.body.removeChild(this.panelContainer);
			window.removeEventListener('contextmenu', this._contextMenuHandler, false);
		}
	} else {
		this.popup = function(){
			document.body.appendChild(this.panelContainer);
		}
		this.close = function(){
			document.body.removeChild(this.panelContainer);
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

dial.editProperties = function(selectedItem){
	var popup = new dial.PopupPanel(500, 420, true);
	var iframe = document.createElement('iframe');
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.backgroundColor = 'transparent';
	iframe.style.border = '0px none transparent';
	iframe.style.padding = '0px';
	iframe.style.overflow = 'hidden';
	popup.frame.appendChild(iframe);
	iframe.src = '/html/properties.html?id=' + selectedItem.Node.id;
	iframe.popup = popup;
	popup.popup();
}
