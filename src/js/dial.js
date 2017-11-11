var utils = {};
var app = {};
var dial = {
	page: 1,
	maxpage: 1,
	capture: 0
};

document.addEventListener("DOMContentLoaded", function(event) {
	document.body.style.backgroundColor = utils.getBackgroundColor();
	app.init();
	dial.init();
});

window.addEventListener('resize', function(){
	if(app && app.settings) dial.updateGridLayout();
});
window.addEventListener('wheel', function(e){
	if(app && app.settings){
		if(e.deltaY > 0){
			if(dial.page < dial.maxpage){
				dial.page += 1;
				dial.populateGrid();
			}
		} else if(e.deltaY < 0){
			if(dial.page > 1){
				dial.page -= 1;
				dial.populateGrid();
			}
		}
	}
});
window.addEventListener('keyup', function(e){
	switch(e.key){
		case 'PageDown':
			if(dial.page < dial.maxpage){
				dial.page += 1;
				dial.populateGrid();
			}
			break;
		case 'PageUp':
			if(dial.page > 1){
				dial.page -= 1;
				dial.populateGrid();
			}
			break;
	}
});



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
				if(dial.skipUpdate!=true) app.Messages.getNode(dial.path, app.GridNodes._changed);
				break;
		}
	});
};
app.Messages.getSettings = function(callback){
	browser.runtime.getBackgroundPage().then(function(page){
		if(page){
			if(callback) callback(page.app.settings);
		} else {
			browser.runtime.sendMessage({ cmd: app.Messages.Commands.getSettings }).then(callback, callback);
		}
	});
};
app.Messages.getNode = function(path, callback){
	browser.runtime.getBackgroundPage().then(function(page){
		if(page){
			if(callback) callback(page.app.GridNodes.getNode(page.app.node, dial.path.substr(1)));
		} else {
			browser.runtime.sendMessage({ cmd: app.Messages.Commands.getNode, path: path }).then(callback);
		}
	});
};
app.Messages.updateNode = function(id, value, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.updateNode, id: id, value: value }).then(callback);
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

	dial.ItemMenuCaptureHere = document.createElement('menuitem');
	dial.ItemMenuCaptureHere.label = browser.i18n.getMessage("menuCaptureHere");
	dial.ItemMenuCaptureHere.onclick = function(){
		dial.captureHere(dial._selectedItem);
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
	dial.ItemMenu.appendChild(dial.ItemMenuCaptureHere);
	dial.ItemMenu.appendChild(dial.ItemMenuCapture);
	dial.ItemMenu.appendChild(dial.ItemMenuDelete);
	dial.ItemMenu.appendChild(document.createElement('hr'));
	dial.ItemMenu.appendChild(dial.ItemMenuSettings);
	document.body.appendChild(dial.ItemMenu);
}
dial.initStyles = function(){
	function applyImageMode(imageMode, target){
		switch(imageMode){
			case 0:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = '100% 100%';
				break;
			case 1:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = 'cover';
				target.backgroundPosition = 'center';
				break;
			case 2:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = 'contain';
				target.backgroundPosition = 'center';
				break;
			case 3:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundPosition = 'center';
				break;
		}
	}

	var oldStyle = dial.Style;
	dial.Style = document.createElement('style'), StyleSheet;
	document.head.appendChild(dial.Style);
	dial.styles = {};
	dial.styles.html = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('html { height: 100%; }')].style;
	dial.styles.body = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('body { user-select: none; -moz-user-select: none; display: flex;	width: 100%; height: 100%; margin: 0px; padding: 0px; background-color: ' + app.settings.backgroundColor + '; background-image: ' + app.settings.backgroundImage + '; }')].style;
	applyImageMode(app.settings.backgroundMode, dial.styles.body);
	dial.styles.grid = {};
	dial.styles.grid.grid = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid { border-collapse: collapse; margin: auto; }')].style;
	dial.styles.grid.cell = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td { margin: 0px; padding: 0px; }')].style;
	dial.styles.grid.cellHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td:hover {}')].style;
	dial.styles.grid.link = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a { display: block; outline: none; overflow: hidden; text-decoration: none; margin: ' + app.settings.grid.cells.margin + 'px; opacity: ' + app.settings.grid.cells.opacity + '; border: ' + app.settings.grid.cells.borderSize + 'px solid ' + app.settings.grid.cells.borderColor + '; border-radius: ' + app.settings.grid.cells.borderRadius + 'px; }')].style;
	dial.styles.grid.linkHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover { border-color: ' + app.settings.grid.cells.borderColorHover + '; border-width: ' + app.settings.grid.cells.borderSizeHover + 'px; margin: ' + app.settings.grid.cells.marginHover + 'px; opacity: ' + app.settings.grid.cells.opacityHover + '; border-radius: ' + app.settings.grid.cells.borderRadiusHover + 'px; }')].style;
	dial.styles.grid.linkPanel = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:first-child { background-repeat: no-repeat; }')].style;
	if(app.settings.grid.cells.backgroundColor) dial.styles.grid.linkPanel.backgroundColor = app.settings.grid.cells.backgroundColor;
	dial.styles.grid.linkPanelHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover>div:first-child { }')].style;
	if(app.settings.grid.cells.backgroundColorHover) dial.styles.grid.linkPanelHover.backgroundColor = app.settings.grid.cells.backgroundColorHover;
	dial.styles.grid.linkTitle = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a>div:last-child { height: ' + app.settings.grid.cells.titleHeight + 'px; font-size: ' + app.settings.grid.cells.titleFontSize + 'pt; font-family: ' + app.settings.grid.cells.titleFont + 'pt; text-align: center; overflow: hidden; color: ' + app.settings.grid.cells.titleColor + '; border-top: ' + app.settings.grid.cells.titleBorderSize + 'px solid ' + app.settings.grid.cells.borderColor + '; }')].style;
	if(app.settings.grid.cells.titleBackgroundColor) dial.styles.grid.linkTitle.backgroundColor = app.settings.grid.cells.titleBackgroundColor;
	dial.styles.grid.linkTitleHover = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a:hover>div:last-child { font-size: ' + app.settings.grid.cells.titleFontSizeHover + 'pt; color: ' + app.settings.grid.cells.titleColorHover + '; border-top-width: ' + app.settings.grid.cells.titleBorderSizeHover + 'px; border-top-color: ' + app.settings.grid.cells.borderColorHover + ' }')].style;
	if(app.settings.grid.cells.titleBackgroundColorHover) dial.styles.grid.linkTitleHover.backgroundColor = app.settings.grid.cells.titleBackgroundColorHover;
	dial.styles.grid.linkEmpty = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Empty { display: none; }')].style;
	dial.styles.grid.linkBack = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Back :first-child { background-image: ' + app.settings.grid.backIcon + '; }')].style;
	applyImageMode(app.settings.grid.backIconMode, dial.styles.grid.linkBack);
	dial.styles.grid.linkFolder = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Folder :first-child { background-image: ' + app.settings.grid.folderIcon + '; background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	applyImageMode(app.settings.grid.folderIconMode, dial.styles.grid.linkFolder);
	dial.styles.grid.linkBookmark = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.Bookmark :first-child { background-repeat: no-repeat; background-size: 100% 100%; }')].style;
	dial.styles.grid.linkBookmarkLoading = dial.Style.sheet.cssRules[dial.Style.sheet.insertRule('.Grid td>a.BookmarkLoading :first-child { background-image: url("' + app.settings.grid.cells.loadingIcon + '"); background-repeat: no-repeat; background-position: center center; }')].style;
	if(oldStyle) document.head.removeChild(oldStyle);
};
dial.initGrid = function(){
	var oldGrid = dial.Grid;
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
			link.onmousedown = function(){
				dial._selectedItem = this;
				if(dial._selectedItem.Node){
					switch(dial._selectedItem.Node.type){
						case app.GridNodes.GridNodeType.folder:
							dial.ItemMenuCaptureHere.hidden = true;
							break;
						case app.GridNodes.GridNodeType.bookmark:
							//dial.ItemMenuCaptureHere.hidden = false;
							dial.ItemMenuCaptureHere.hidden = true;
							break;
					}
				}
			};
			
			function dragstart_handler(ev) {
				if(!ev.target.Node){
					ev.preventDefault();
					return;
				}
				var index = (dial.page - 1) * (app.settings.grid.rows * app.settings.grid.columns) + +(ev.target.parentElement.getAttribute('gridindex'));
				if(app.settings.grid.backNode && dial.path != '/') index -= dial.page;
				ev.dataTransfer.setData("text/plain", index);
			}
			function dragover_handler(ev) {
				ev.preventDefault();
				if(app.settings.grid.backNode && dial.path != '/'){
					var gridIndex = 0;
					if(ev.target.tagName == 'DIV') gridIndex = +(ev.target.parentElement.parentElement.getAttribute('gridindex'));
					else gridIndex = +(ev.target.getAttribute('gridindex'));
					if(gridIndex==0) ev.dataTransfer.dropEffect = "none";
					else ev.dataTransfer.dropEffect = "move";
				} else {
					ev.dataTransfer.dropEffect = "move";
				}
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
				if(StartIndex != EndIndex) app.Messages.setNodeIndex(StartIndex, EndIndex);
			}
			link.draggable = true;
			link.ondragstart = dragstart_handler;
			cell.ondragover = dragover_handler;
			cell.ondrop = drop_handler;
		}
	}
	document.body.appendChild(dial.Grid);
	dial.updateGridLayout();
	if(oldGrid) document.body.removeChild(oldGrid);
	return dial.Grid;
};
dial.updateGridLayout = function(){
	var parentWidth = dial.Grid.parentElement.offsetWidth;
	var parentHeight = dial.Grid.parentElement.offsetHeight;
	
	function calc(gridMargin, cellsMargin, borderSize, titleBorderSize){
		var fullWidth = parentWidth - 2 * gridMargin;
		var fullHeight = parentHeight - 2 * gridMargin;
		var cellWidth = fullWidth / app.settings.grid.columns;
		var cellHeight = fullHeight / app.settings.grid.rows;
		var linkWidth = 0;
		var linkHeight = 0;
		if(cellWidth <= cellHeight * 4 / 3) cellHeight = cellWidth / 4 * 3;
		else cellWidth = cellHeight / 3 * 4;
		linkWidth = cellWidth - 2 * (cellsMargin + 1) - 2 * borderSize;
		linkHeight = cellHeight - 2 * (cellsMargin + 1) - 2 * borderSize - titleBorderSize;
		return {
			cellWidth: cellWidth,
			cellHeight: cellHeight,
			linkWidth: linkWidth,
			linkHeight: linkHeight
		};
	}

	var values = calc(app.settings.grid.margin, app.settings.grid.cells.margin, app.settings.grid.cells.borderSize, app.settings.grid.cells.titleBorderSize);
	dial.styles.grid.cell.width = values.cellWidth.toString() + 'px';
	dial.styles.grid.cell.height = values.cellHeight.toString() + 'px';
	dial.styles.grid.link.width = values.linkWidth.toString() + 'px';
	dial.styles.grid.link.height = values.linkHeight.toString() + 'px';
	if(app.settings.grid.cells.title) dial.styles.grid.linkPanel.height = (values.linkHeight - app.settings.grid.cells.titleHeight - 1 - app.settings.grid.cells.titleBorderSize).toString() + 'px';
	else dial.styles.grid.linkPanel.height = values.linkHeight.toString() + 'px';

	values = calc(app.settings.grid.margin, app.settings.grid.cells.marginHover, app.settings.grid.cells.borderSizeHover, app.settings.grid.cells.titleBorderSizeHover);
	dial.styles.grid.cellHover.width = values.cellWidth.toString() + 'px';
	dial.styles.grid.cellHover.height = values.cellHeight.toString() + 'px';
	dial.styles.grid.linkHover.width = values.linkWidth.toString() + 'px';
	dial.styles.grid.linkHover.height = values.linkHeight.toString() + 'px';
	if(app.settings.grid.cells.titleHover) dial.styles.grid.linkPanelHover.height = (values.linkHeight - app.settings.grid.cells.titleHeightHover - 1 - app.settings.grid.cells.titleBorderSizeHover).toString() + 'px';
	else dial.styles.grid.linkPanelHover.height = values.linkHeight.toString() + 'px';
};
dial.populateGrid = function(){
	function applyImageMode(imageMode, target){
		switch(imageMode){
			case -1:
				target.backgroundRepeat = '';
				target.backgroundSize = '';
				target.backgroundPosition = '';
				break;
			case 0:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = '100% 100%';
				target.backgroundPosition = '';
				break;
			case 1:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = 'cover';
				target.backgroundPosition = 'center';
				break;
			case 2:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = 'contain';
				target.backgroundPosition = 'center';
				break;
			case 3:
				target.backgroundRepeat = 'no-repeat';
				target.backgroundSize = 'auto auto';
				target.backgroundPosition = 'center';
				break;
		}
	}
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
		if(node.imageMode || node.imageMode == 0) applyImageMode(node.imageMode, link.childNodes[0].style);
		else applyImageMode(-1, link.childNodes[0].style);
		if(node.image){
			if(node.image.indexOf('url(')>=0) link.childNodes[0].style.backgroundImage = node.image;
			else link.childNodes[0].style.backgroundImage = 'url(' + node.image + ')';
		} else link.childNodes[0].style.backgroundImage = '';
		link.childNodes[1].innerText = node.title;
		if(dial.path) link.href = '?' + 'bg=' + encodeURIComponent(app.settings.backgroundColor) + '&path=' + encodeURIComponent(dial.path + node.title);
		else link.href = '?' + 'bg=' + encodeURIComponent(app.settings.backgroundColor) + '&path=' + encodeURIComponent(node.title);
		link.onclick = null;
		link.setAttribute('contextmenu', 'item');
	}
	populateBookmark = function(link, node){
		link.Node = node;
		if(node.imageMode || node.imageMode == 0) applyImageMode(node.imageMode, link.childNodes[0].style);
		else applyImageMode(-1, link.childNodes[0].style);
		if(node.image){
			link.className = 'Bookmark';
			if(node.image.indexOf('url(')>=0) link.childNodes[0].style.backgroundImage = node.image;
			else link.childNodes[0].style.backgroundImage = 'url(' + node.image + ')';
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
dial.captureHere = function(selectedItem){
	function headersReceived(e){
		for (let i = e.responseHeaders.length - 1; i >= 0; i--) {
			switch(e.responseHeaders[i].name.toLowerCase()){
				case 'x-frame-options':
				case 'frame-options':
				case 'content-security-policy':
					e.responseHeaders.splice(i, 1);
					break;
			}
		}
		return { responseHeaders: e.responseHeaders };
	};
	function pageLoaded(){
		if(!iframe) return;
		function clean(){
			if(!iframe) return;
			selectedItem.children[0].removeChild(iframe);
			dial.capture -= 1;
			if(dial.capture == 0){
				browser.webRequest.onHeadersReceived.removeListener(headersReceived);
				browser.tabs.update(tab.id, {muted: false}).then();
			}
			iframe = null;
		}
		setTimeout(function(){
			browser.tabs.captureVisibleTab().then(function(img){
				var imgObj = new Image;
				imgObj.src = img;
				var canvas = document.createElement('canvas');
				canvas.style.width = rect.width.toString() + 'px';
				canvas.style.height = rect.height.toString() + 'px';
				canvas.width = rect.width;
				canvas.height = rect.height;
				var ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, rect.width, rect.height);
				ctx.save();
				setTimeout(function(){
					ctx.drawImage(imgObj, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
					ctx.restore();
					img = canvas.toDataURL();
					selectedItem.children[0].style.backgroundImage = 'url(' + img + ')';
					clean();
					app.Messages.updateNode(selectedItem.Node.id, { image: img }, function(){
						setTimeout(function(){
							if(dial.capture == 0) dial.skipUpdate = false;
						}, 500);
					});
				}, 500);
			}, clean);
		}, 3000);


	};

	var tab = null;
	var previewWidth = 1200; // Need to be linked to settings
	var previewHeight = 710; // Need to be linked to settings
	var iframe = document.createElement('iframe');
	var rect = selectedItem.children[0].getBoundingClientRect();
	browser.tabs.getCurrent().then(function(currentTab){
		tab = currentTab;
		var ratioX = previewWidth / selectedItem.children[0].offsetWidth;
		var ratioY = previewHeight / selectedItem.children[0].offsetHeight;
		iframe.style.width = ratioX * selectedItem.children[0].offsetWidth + 'px';
		iframe.style.height = ratioY * selectedItem.children[0].offsetHeight + 'px';
		iframe.style.position = 'absolute';
		iframe.style.MozTransform = 'scale(' + (1/ratioX) + ', ' + (1/ratioY) + ')';
		iframe.style.MozTransformOrigin = 'top left';
		iframe.sandbox = 'allow-scripts allow-same-origin';
		iframe.onload = function(){ pageLoaded(); }
		dial.capture += 1;
		if(dial.capture == 1){
			dial.skipUpdate = true;
			browser.webRequest.onHeadersReceived.addListener(headersReceived, { urls:['*://*/*'], types:['sub_frame'] }, ['blocking', 'responseHeaders']);
			browser.tabs.update(tab.id, {muted: true}).then();
		}
		iframe.src = selectedItem.Node.url;
		selectedItem.children[0].appendChild(iframe);
		//setTimeout(function(){ pageLoaded(); }, 6000);
	});
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
	var popup = new dial.PopupPanel(500, 440, true);
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
	iframe.focus();
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
	iframe.focus();
}
