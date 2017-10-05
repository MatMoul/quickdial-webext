var core = {}; // Main app object in background.js
var app = {};  // Shared app object with pages

core.init = function(){ // Init module
	core.Settings.load(function(){
		core.GridNodes.sync(app.settings.grid.node, app.settings.grid.root, function(){ // Sync bookmarks with stored data
			core.ContextMenus.initMenu();
			core.Bookmarks.initListener();
		});
	});
}

core.Settings = {}; // Settings helper object
core.Settings.load = function(callback){ // Load settings
	browser.storage.local.get({
		backgroundColor: '#3c4048',
		backgroundImage: null,
		grid: {
			margin: 10,
			rows: 4,
			columns: 5,
			cells: {
				margin: 4,
				marginHover: 4,
				ratioX: 4,
				ratioY: 3,
				borderColor: '#333333',
				borderColorHover: '#a9a9a9',
				borderRadius: 4,
				borderRadiusHover: 4,
				title: true,
				titleHeight: 16,
				titleFontSize: 10,
				titleFont: 'Arial, Verdana, Sans-serif',
				titleColor: '#ffffff',
				titleColorHover: '#33ccff',
				backPanel: true,
				backIcon: 'img/back.png',
				folderIcon: 'img/folder.png',
				loadingIcon: 'img/throbber.gif'
			},
			root: 'Quick Dial',
			node: {}
		}
	}).then(function(obj){
		app.settings = obj;
		if(callback) callback();
	});
}
core.Settings.save = function(){ // Save settings
	browser.storage.local.set(app.settings);
	browser.runtime.sendMessage({ command: 'SettingsChanged' });
}

core.init();

core.ContextMenus = {} // ContextMenu helper Object
core.ContextMenus.initMenu = function(){ // (Called from core.init) Init context menu in all pages
	browser.contextMenus.create({ // Create Context menu
		id: 'AddToQuickDial',
		title: browser.i18n.getMessage("menuAddToQuickDial"),
		contexts: ["all"],
		documentUrlPatterns: [ 'http://*/*', 'https://*/*', 'file://*/*' ]
	}, function(){});
	browser.contextMenus.onClicked.addListener(function(info, tab) { // Context menu click event
		if (info.menuItemId == "AddToQuickDial")
			core.GridNodes.createBookmark(app.settings.grid.node, info.pageUrl, tab.title, function(){});
	});
}

core.Bookmarks = {} // Bookmarks helper object
core.Bookmarks._onCreated = function(){ core.GridNodes.sync(app.settings.grid.node, app.settings.grid.root); }
core.Bookmarks._onChanged = function(){ core.GridNodes.sync(app.settings.grid.node, app.settings.grid.root); }
core.Bookmarks._onMoved = function(){ core.GridNodes.sync(app.settings.grid.node, app.settings.grid.root); }
core.Bookmarks._onRemoved = function(){ core.GridNodes.sync(app.settings.grid.node, app.settings.grid.root); }
core.Bookmarks.initListener = function(){ // (Called from core.init) (/!\ Need filter to root tree only) Init listener of bookmarks
	browser.bookmarks.onCreated.addListener(core.Bookmarks._onCreated);
	//browser.bookmarks.onChanged.addListener(core.Bookmarks._onChanged);
	browser.bookmarks.onMoved.addListener(core.Bookmarks._onMoved);
	browser.bookmarks.onRemoved.addListener(core.Bookmarks._onRemoved);		
}
core.Bookmarks.load = function(rootPath, callback){ // Load root bookmark and create it if not exist
	if(!callback) return;
	browser.bookmarks.getSubTree('menu________').then(function(bookmarkItems){
		function getChildItem(bookmarkItem, path, callback){
			if(path.length == 0){
				callback(bookmarkItem);
				return;
			}
			for(var child of bookmarkItem.children)
				if((path + '/').startsWith(child.title + '/'))
					return getChildItem(child, path.substr(child.title.length + 1), callback);
			browser.bookmarks.create({
				parentId: bookmarkItem.id,
				title: path.substr(0, (path + '/').indexOf('/'))
			}).then(function(bookmarkItem){
				return getChildItem(bookmarkItem, path.substr(bookmarkItem.title.length + 1), callback);
			}, function(){ callback(); });
		}
		getChildItem(bookmarkItems[0], rootPath, callback);
	}, function(){ callback(); });
}

core.SiteInfos = {} // Siteinfos helper object
core.SiteInfos.fromTab = function(callback){ // Retrieve infos from current tab. callback( { url, title, icon, screenshot } || error: callback() )
	browser.tabs.getCurrent().then(function(tab){
		function whaitLoaded(){
			browser.tabs.get(tab.id).then(function(tab){
				if(tab.status == 'loading') setTimeout(whaitLoaded, 300);
				else {
					browser.tabs.update(tab.id, {active: true}).then(function(){
						setTimeout(function(){
							browser.tabs.captureVisibleTab().then(function(img){
								browser.tabs.remove(tab.id);
								if(callback) callback( { url: tab.url, title: tab.title, icon: tab.favIconUrl, screenshot: img } );
							}, function(){
								browser.tabs.remove(tab.id);
								if(callback) callback();
							});
						}, 300);
					}, function(){ if(callback) callback(); });
				}
			}, function(){ if(callback) callback(); });
		}
		setTimeout(whaitLoaded, 300);
	}, function(){ if(callback) callback();	});
}
core.SiteInfos.fromNewTab1 = function(url, callback){  // Retrieve infos from a new tab. callback( { url, title, icon, screenshot } || error: callback() )
	browser.tabs.create({url: url, active: false}).then(function(tab){
		browser.tabs.update(tab.id, {muted: true}).then();
		function whaitLoaded(){
			browser.tabs.get(tab.id).then(function(tab){
				if(tab.status == 'loading') setTimeout(whaitLoaded, 300);
				else {
					browser.tabs.update(tab.id, {active: true}).then(function(){
console.log('Hello');						
						setTimeout(function(){
							browser.tabs.captureVisibleTab().then(function(img){
								browser.tabs.remove(tab.id);
								
								var previewWidth = 1200; // Need to be linked to settings
								var previewHeight = 710; // Need to be linked to settings
								var imgObj = new Image;
								imgObj.src = img;

								var canvas = document.createElement('canvas');
								canvas.style.width = previewWidth.toString() + 'px';
								canvas.style.height = previewHeight.toString() + 'px';
								canvas.width = previewWidth / 2;
								canvas.height = previewHeight / 2;
								var ctx = canvas.getContext('2d');
								ctx.clearRect(0, 0, previewWidth, previewHeight);
								ctx.save();
								ctx.scale(0.5, 0.5);
								//ctx.drawImage(img, 0, 0, previewWidth, previewHeight, 'rgb(255, 255, 255)');
console.log(img);
								ctx.drawImage(imgObj, 0, 0, 0, 0, 'rgb(255, 255, 255)');
								ctx.restore();
								img = canvas.toDataURL();
														
								
								if(callback) callback( { url: tab.url, title: tab.title, icon: tab.favIconUrl, screenshot: img } );
							}, function(){
								browser.tabs.remove(tab.id);
								if(callback) callback();
							});
						}, 300);
					}, function(){ if(callback) callback(); });
				}
			}, function(){ if(callback) callback(); });
		}
		setTimeout(whaitLoaded, 300);
	}, function(){ if(callback) callback(); });
}
core.SiteInfos.fromFrame = function(url, callback){ // Retrieve infos from an iframe. callback( { url, title, (/!\ Not handled now)icon, screenshot } || error: callback() )
	function pageLoaded(){
		if(!iframe) return;
		var docTitle = iframe.contentWindow.document.title;
		var docIcon = null;
		var docScreenshot = null;
		//title
		if(docTitle == '') docTitle = url;
		//icon
		//screenshot
		var canvas = document.createElement('canvas');
		canvas.style.width = previewWidth.toString() + 'px';
		canvas.style.height = previewHeight.toString() + 'px';
		canvas.width = previewWidth / 2;
		canvas.height = previewHeight / 2;
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, previewWidth, previewHeight);
		ctx.save();
		ctx.scale(0.5, 0.5);
		ctx.drawWindow(iframe.contentWindow, 0, 0, previewWidth, previewHeight, 'rgb(255, 255, 255)');
		ctx.restore();
		docScreenshot = canvas.toDataURL();

		document.body.removeChild(iframe);
		iframe = null;
		if(callback) callback({ url: url, title: docTitle, icon: docIcon, screenshot:docScreenshot });
	}

	var previewWidth = 1200; // Need to be linked to settings
	var previewHeight = 710; // Need to be linked to settings
	var iframe;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.timeout = 10000
	xmlHttp.open('GET', url, true);
	xmlHttp.onload = function(){
		iframe = document.createElement('iframe');
		iframe.width = previewWidth
		iframe.height = previewHeight
		iframe.style.position = 'absolute';
		//iframe.style.visibility = 'hidden';
		var content = xmlHttp.responseText.replace('<head>', '<head><base href="' + url + '">');
		iframe.onload = function(){ pageLoaded(); }
		document.body.appendChild(iframe);
		iframe.srcdoc = content;
		setTimeout(function(){ pageLoaded(); }, 6000);
	}
	xmlHttp.onabort = function(){ if(callback) callback(); }
	xmlHttp.onerror = function(){ if(callback) callback(); }
	xmlHttp.ontimeout = function(){ if(callback) callback(); }
	xmlHttp.send();
}
core.SiteInfos.fromWS = function(url, callback){ // Retrieve infos from a Web Service. callback( { url, title, (/!\ Not handled now)icon, screenshot } || error: callback() )
	console.log('Not implemented');
	return core.SiteInfos.fromFrame(url, callback);
}

/*
core.GridNodes.GridNode = function(){
	this.id = null; // 0
	//this.lastUpdate = new Date(0);
	this.type = core.GridNodes.GridNodeType.empty;
	//this.path = '';
	this.title = null; // ''
	this.icon = null; // ''
	this.image = null; // ''
	this.url = null; // ''
	this.children = null; // []
}
*/
core.GridNodes = {}; // GridNodes helper object
core.GridNodes.GridNodeType = { // GridNodeType
	back: -1,
	empty: 0,
	folder: 1,
	bookmark: 2
}
core.GridNodes.sync = function(gridNode, rootPath, callback){ // Sync GridNodes with Bookmarks
	core.Bookmarks.load(rootPath, function(bookmarkItem){
		function syncNode(gridNode, bookmarkItem){
			gridNode.id = bookmarkItem.id;
			if(!gridNode.title) gridNode.title = bookmarkItem.title;
			if(bookmarkItem.url){
				gridNode.type = core.GridNodes.GridNodeType.bookmark;
				if(!gridNode.url) gridNode.url = bookmarkItem.url;
			} else if(bookmarkItem.children){
				gridNode.type = core.GridNodes.GridNodeType.folder;
				var EmptyNodes = [];
				if(! gridNode.children) gridNode.children = [];
				else {
					for(var i=gridNode.children.length-1; i>=0; i--){
						if(gridNode.children[i].type==core.GridNodes.GridNodeType.empty){
							EmptyNodes.unshift(gridNode.children[i]);
						} else {
							var found = false;
							for(var child of bookmarkItem.children){
								if(child.id==gridNode.children[i].id){
									found = true;
									break;
								}
							}
							if(! found){
								if(i<gridNode.children.length - 1){
									gridNode.children[i] = { type: core.GridNodes.GridNodeType.empty };
									EmptyNodes.unshift(gridNode.children[i]);
								} else {
									gridNode.children.pop();
								}
							}
						}
					}
				}
				for(var child of bookmarkItem.children){
					var childGridNode = core.GridNodes.getChildNode(gridNode, child.id);
					if(!childGridNode){
						if(EmptyNodes.length>0){
							childGridNode = EmptyNodes[0];
							EmptyNodes.shift();
						}else {
							childGridNode = {};
							gridNode.children.push(childGridNode)
						}
					}
					syncNode(childGridNode, child);
				}
				EmptyNodes.length = 0;
			} else {
				gridNode.type = core.GridNodes.GridNodeType.empty;
			}
		}

		syncNode(gridNode, bookmarkItem);
		core.GridNodes.save();
		if(callback) callback();
	});
}
core.GridNodes.save = function(){ // Save GridNode
	browser.storage.local.set(app.settings);
	browser.runtime.sendMessage({ command: 'GridNodesSaved'});
}
core.GridNodes.getNode = function(gridNode, path){ // Return GridNode from RootGridNode path
	if(path.length == 0 || path == '/') return gridNode;
	for(var child of gridNode.children)
		if(path.startsWith(child.title + '/'))
			return core.GridNodes.getNode(child, path.substr(child.title.length + 1));
	return null;
}
core.GridNodes.getChildNode = function(gridNode, id){ // Return child node by ID
	for(var child of gridNode.children) if(child.id == id) return child;
	return null;
}
core.GridNodes.saveNode = function(gridNode){ // Save GridNode
	browser.storage.local.set(app.settings);
	browser.runtime.sendMessage({ command: 'GridNodeSaved', gridNode: gridNode });
}
core.GridNodes.setNodeIndex = function(gridNode, index, newIndex, callback){ // Set Child GridNodeIndex. callback(gridNode, node1, node2)
	while(newIndex>=gridNode.children.length)
		gridNode.children.push({ type: core.GridNodes.GridNodeType.empty });
	var node1 = gridNode.children[index];
	var node2 = gridNode.children[newIndex];
	gridNode.children[index] = node2;
	gridNode.children[newIndex] = node1;
	for(var i=gridNode.children.length-1; i>=0; i--){
		if(gridNode.children[i].type != core.GridNodes.GridNodeType.empty) break;
		gridNode.children.pop();
	}
	core.GridNodes.saveNode(gridNode);
	if(callback) callback(gridNode, node1, node2);
}
core.GridNodes.createFolder = function(gridNode, name, callback){ // Create a new folder in a GridNode. callback(gridNode, newGridNode)
	browser.bookmarks.onCreated.removeListener(core.Bookmarks._onCreated);
	browser.bookmarks.create({
		parentId: gridNode.id,
		title: name
	}).then(function(bookmarkItem){
		if(!gridNode) return; // ??? Why this method are called a second time with gridNode = null ???
		browser.bookmarks.onCreated.addListener(core.Bookmarks._onCreated);
		var newGridNode = { id: bookmarkItem.id, type: core.GridNodes.GridNodeType.folder, title: name, children: [] };
		var EmptyCellFound = false;
		for(var i=0; i<gridNode.children.length; i++){
			if(gridNode.children[i].type == core.GridNodes.GridNodeType.empty){
				EmptyCellFound = true;
				gridNode.children[i] = newGridNode;
				break;
			}
		}
		if(EmptyCellFound == false) gridNode.children.push(newGridNode);
		core.GridNodes.saveNode(newGridNode);
		if(callback) callback(gridNode, newGridNode);
	}, function(){
		browser.bookmarks.onCreated.addListener(core.Bookmarks._onCreated);
	});
}
core.GridNodes.createBookmark = function(gridNode, url, title, callback){ // Create a new Bookmark in a GridNode.  callback(gridNode, newGridNode)
	browser.bookmarks.onCreated.removeListener(core.Bookmarks._onCreated);
	browser.bookmarks.create({
		parentId: gridNode.id,
		title: title || url,
		url: url
	}).then(function(bookmarkItem){
		if(!gridNode) return; // ??? Why this method are called a second time with gridNode = null ???
		browser.bookmarks.onCreated.addListener(core.Bookmarks._onCreated);
		var newGridNode = { id: bookmarkItem.id, type: core.GridNodes.GridNodeType.bookmark, url: url, title };
		var EmptyCellFound = false;
		for(var i=0; i<gridNode.children.length; i++){
			if(gridNode.children[i].type == core.GridNodes.GridNodeType.empty){
				EmptyCellFound = true;
				gridNode.children[i] = newGridNode;
				break;
			}
		}
		if(EmptyCellFound == false) gridNode.children.push(newGridNode);
		core.GridNodes.saveNode(newGridNode);
		if(callback) callback(gridNode, newGridNode);
	}, function(){
		browser.bookmarks.onCreated.addListener(core.Bookmarks._onCreated);
	});
}
core.GridNodes.deleteNode = function(gridNode, id, callback){ // Delete a GridNode. callback(gridNode, id)
	for(var i=0; i<gridNode.children.length; i++){
		if(gridNode.children[i].id == id){
			gridNode.children[i] = { type: core.GridNodes.GridNodeType.empty };
			core.GridNodes.saveNode(gridNode);
			break;
		}
	}
	for(var i=gridNode.children.length-1; i>=0; i--){
		if(gridNode.children[i].type != core.GridNodes.GridNodeType.empty) break;
		gridNode.children.pop();
	}
	browser.bookmarks.onRemoved.removeListener(core.Bookmarks._onRemoved);
	browser.bookmarks.removeTree(id).then(function(){
		browser.bookmarks.onRemoved.addListener(core.Bookmarks._onRemoved);
	}, function(){
		browser.bookmarks.onRemoved.addListener(core.Bookmarks._onRemoved);
	});
	if(callback) callback(gridNode, id);
}

core.GridNodes.refreshNode = function(gridNode, callback){ // Refresh content of a GridNode
	if(gridNode.__isLoading == true) return;
	gridNode.__isLoading = true;
	core.SiteInfos.fromFrame(gridNode.url, function(infos){
		if(infos){
			gridNode.title = infos.title;
			gridNode.image = infos.screenshot;
			delete gridNode.__isLoading;
			core.GridNodes.saveNode(gridNode);
		} else delete gridNode.__isLoading;
		if(callback) callback(infos);
	});
}
core.GridNodes.capturePage = function(gridNode, callback){
	browser.tabs.create({url: gridNode.url, active: false}).then(function(tab){
		browser.tabs.update(tab.id, {muted: true}).then(function(){}, function(){});
		function whaitLoaded(){
			browser.tabs.get(tab.id).then(function(tab){
				if(tab.status == 'loading'){
					setTimeout(whaitLoaded, 300);
				} else{
					browser.tabs.update(tab.id, {active: true}).then(function(){
						setTimeout(function(){
							browser.tabs.captureVisibleTab().then(function(img){
								browser.tabs.remove(tab.id);
								gridNode.title = tab.title
								gridNode.image = img;
								core.GridNodes.saveNode(gridNode);
								if(callback) callback();
							}, function(){
								browser.tabs.remove(tab.id);
								if(callback) callback();
							});
						}, 300);
					}, function(){
						if(callback) callback();
					});
				}
			}, function(){});
			
		}
		setTimeout(whaitLoaded, 1000);
	}, function(){
		if(callback) callback();
	});
}

// Public members
app.GridNodeType = core.GridNodes.GridNodeType;
app.refreshNode = core.GridNodes.refreshNode;
app.getNode = core.GridNodes.getNode;
app.createFolder = core.GridNodes.createFolder;
app.createBookmark = core.GridNodes.createBookmark;
app.deleteNode = core.GridNodes.deleteNode;
app.setNodeIndex = core.GridNodes.setNodeIndex;
app.capturePage = core.GridNodes.capturePage;
app.saveSettings = core.Settings.save;