var core = {}; // Main app object in background.js
var app = {};  // Shared app object with pages

core.init = function(){ // Init module
	core.Settings.init(function(){
		core.Messages.init();
		browser.runtime.sendMessage({ cmd: core.Messages.Commands.settingsChanged });
		browser.browserAction.onClicked.addListener(function(){
			browser.tabs.create({});
		});
		core.GridNodes.sync(core.node, core.settings.grid.root, function(){
			browser.runtime.sendMessage({ cmd: core.Messages.Commands.gridNodesLoaded });
			core.Bookmarks.initListener();
		});
	});
};

core.Messages = {}; // Messages helper object
core.Messages.Commands = {
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
core.Messages.init = function(){ // Init Messages Listeners
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.cmd){
			case core.Messages.Commands.getSettings:
				sendResponse(core.settings);
				break;
			case core.Messages.Commands.setSettings:
				core.settings = request.settings;
				core.Settings.save();
				sendResponse(core.settings);
				browser.runtime.sendMessage( { cmd: core.Messages.Commands.settingsChanged } );
				browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				break;
			case core.Messages.Commands.getNodeByID:
				var nodes = core.GridNodes.getNodeWithParents(request.id);
				if(nodes) sendResponse(nodes[nodes.length-1]);
				else sendResponse(null);
				break;
			case core.Messages.Commands.updateNode:
				core.GridNodes.updateNode(core.GridNodes.getNodeById(request.id), request.value, function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.getNode:
				sendResponse(core.GridNodes.getNode(core.node, request.path.substr(1)));
				break;
			case core.Messages.Commands.setNodeIndex:
				core.GridNodes.setNodeIndex(core.GridNodes.getNode(core.node, request.path.substr(1)), request.index, request.newIndex, function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.createBookmark:
				core.GridNodes.createBookmark(core.GridNodes.getNode(core.node, request.path.substr(1)), request.url, request.title, function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.createFolder:
				core.GridNodes.createFolder(core.GridNodes.getNode(core.node, request.path.substr(1)), request.name, function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.deleteNode:
				core.GridNodes.deleteNode(core.GridNodes.getNode(core.node, request.path.substr(1)), request.id, function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.refreshNode:
				core.GridNodes.refreshNode(core.GridNodes.getChildNode(core.GridNodes.getNode(core.node, request.path.substr(1)), request.id), function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
			case core.Messages.Commands.capturePage:
				core.GridNodes.capturePage(core.GridNodes.getChildNode(core.GridNodes.getNode(core.node, request.path.substr(1)), request.id), function(){
					browser.runtime.sendMessage( { cmd: core.Messages.Commands.gridNodesLoaded } );
				});
				break;
		}
	});
};

core.Settings = {}; // Settings helper object
core.Settings.init = function(callback){ // Load settings and nodes
	browser.storage.local.get().then(function(data){
		if(Object.keys(data).length == 0) {
			data = {
				version: 3,
				settings: {
					backgroundColor: '#3c4048',
					backgroundImage: null,
					grid: {
						margin: 10,
						rows: 4,
						columns: 5,
						backNode: true,
						backIcon: 'url(/img/back.png)',
						folderIcon: 'url(/img/folder.png)',
						loadingIcon: 'url(/img/throbber.gif)',
						cells: {
							margin: 4,
							marginHover: 4,
							backgroundColor: null,
							backgroundColorHover: null,
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
							titleBackgroundColor: null,
							titleBackgroundColorHover: null,
							previewWidth: 1200,
							previewHeight: 710
						},
						root: 'Quick Dial',
					}
				},
				node: { children: [] }
			}
		}
		if(!data.version){ // Upgrade Data Version
			data.version = 2;
			data.grid.backNode = true;
			data.grid.backIcon = 'url(/img/back.png)';
			data.grid.folderIcon = 'url(/img/folder.png)';
			data.grid.loadingIcon = 'url(/img/throbber.gif)';
			data.grid.cells.backgroundColor = null;
			data.grid.cells.backgroundColorHover = null;
			data.grid.cells.titleBackgroundColor = null;
			data.grid.cells.titleBackgroundColorHover = null;
			delete data.grid.cells.backIcon;
			delete data.grid.cells.folderIcon;
			delete data.grid.cells.loadingIcon;
			delete data.grid.cells.backPanel;
		}
		if(data.version == 2){ // Upgrade Data Version
			var oldData = data;
			data = {};
			data.version = 3;
			data.settings = oldData;
			data.node = oldData.grid.node;
			delete data.settings.version;
			delete data.settings.grid.node;
			core.settings = data.settings;
			core.node = data.node;
			browser.storage.local.clear().then(function(){
				core.Settings.save();
			});
		}
		core.settings = data.settings;
		core.node = data.node;
		if(callback) callback();
	}, function(){ console.log('Error loading data'); });
};
core.Settings.update = function(settings, callback){ // Save new settings
	core.settings = settings;
	core.Settings.save(callback);
};
core.Settings.save = function(callback){ // Save settings
	var data = { version: 3 };
	data.settings = core.settings;
	data.node = core.node;
	browser.storage.local.set(data).then(function(){
		if(callback) callback();
	}, function(){ console.log('Error saving settings'); });
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
		//if (info.menuItemId == "AddToQuickDial")
			//core.GridNodes.createBookmark(app.settings.grid.node, info.pageUrl, tab.title, function(){});
	});
}

core.Bookmarks = {} // Bookmarks helper object
core.Bookmarks._onCreated = function(){ core.GridNodes.sync(core.node, core.settings.grid.root, function(){ browser.runtime.sendMessage({ cmd: core.Messages.Commands.gridNodesLoaded }); }); }
core.Bookmarks._onChanged = function(){ core.GridNodes.sync(core.node, core.settings.grid.root, function(){ browser.runtime.sendMessage({ cmd: core.Messages.Commands.gridNodesLoaded }); }); }
core.Bookmarks._onMoved = function(){ core.GridNodes.sync(core.node, core.settings.grid.root, function(){ browser.runtime.sendMessage({ cmd: core.Messages.Commands.gridNodesLoaded }); }); }
core.Bookmarks._onRemoved = function(){ core.GridNodes.sync(core.node, core.settings.grid.root, function(){ browser.runtime.sendMessage({ cmd: core.Messages.Commands.gridNodesLoaded }); }); }
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
core.SiteInfos.fromNewTab = function(url, callback){  // Retrieve infos from a new tab. callback( { url, title, icon, screenshot } || error: callback() )
	browser.tabs.create({url: url, active: false}).then(function(tab){
		browser.tabs.update(tab.id, {muted: true}).then();
		function whaitLoaded(){
			browser.tabs.get(tab.id).then(function(tab){
				if(tab.status == 'loading') setTimeout(whaitLoaded, 300);
				else {
					browser.tabs.update(tab.id, {active: true}).then(function(){
						setTimeout(function(){
							browser.tabs.captureVisibleTab().then(function(img){
								browser.tabs.remove(tab.id);
								
								var imgObj = new Image;
								imgObj.src = img;

								var previewWidth = 1200; // Need to be linked to settings
								var previewHeight = 710; // Need to be linked to settings

								var canvas = document.createElement('canvas');
								canvas.style.width = previewWidth.toString() + 'px';
								canvas.style.height = previewHeight.toString() + 'px';
								canvas.width = previewWidth / 2;
								canvas.height = previewHeight / 2;

								var ctx = canvas.getContext('2d');
								ctx.clearRect(0, 0, previewWidth, previewHeight);
								ctx.save();
								ctx.scale(0.5, 0.5);
								setTimeout(function(){
									if(tab.height * previewWidth / previewHeight >= tab.width){
										// Cut the bottom of the page
										ctx.drawImage(imgObj, 0, 0, tab.width, tab.width / previewWidth * previewHeight, 0, 0, previewWidth, previewHeight);
									} else {
										// Stretch or cutting right part of the page ? actualy Stretch
										ctx.drawImage(imgObj, 0, 0, tab.width, tab.height, 0, 0, previewWidth, previewHeight);
										//ctx.drawImage(imgObj, 0, 0, tab.height / previewHeight * previewWidth, tab.height, 0, 0, previewWidth, previewHeight);
									}
									ctx.restore();
									img = canvas.toDataURL();
									if(callback) callback( { url: tab.url, title: tab.title, icon: tab.favIconUrl, screenshot: img } );
								}, 100);
							}, function(){
								browser.tabs.remove(tab.id);
								if(callback) callback();
							});
						}, 500);
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
core.GridNodes.save = function(callback){ // Save GridNodes
	core.Settings.save(callback);
}
core.GridNodes.getNode = function(gridNode, path){ // Return GridNode from RootGridNode path
	if(path.length == 0 || path == '/') return gridNode;
	for(var child of gridNode.children)
		if(path.startsWith(child.title + '/'))
			return core.GridNodes.getNode(child, path.substr(child.title.length + 1));
	return null;
}
core.GridNodes.getNodeById = function(id){
	var nodes = core.GridNodes.getNodeWithParents(id);
	if(nodes) return nodes[nodes.length-1];
	return null;
}
core.GridNodes.getNodeWithParents = function(id){
	
	var parents = [];

	function findNode(gridNode){
		if(gridNode.id == id){
			parents.unshift(gridNode);
			return gridNode;
		}
		if(gridNode.children){
			for(var i=0; i<gridNode.children.length; i++){
				var result = findNode(gridNode.children[i]);
				if(result){
					parents.unshift(gridNode);
					return result;
				}
			}
		}
		return null;
	}

	findNode(core.node, id);
	if(parents.length>0) return parents;
	return null;
}
core.GridNodes.updateNode = function(gridNode, value, callback){
	if(value){
		if(value.title) gridNode.title = value.title;
		if(gridNode.type == core.GridNodes.GridNodeType.bookmark && value.url && gridNode.url != value.url){
			gridNode.url = value.url;
			delete gridNode.image;
		}
		//gridNode.image = infos.screenshot;
		core.GridNodes.saveNode(gridNode);
	}
	if(callback) callback(gridNode);
}
core.GridNodes.getChildNode = function(gridNode, id){ // Return child node by ID
	for(var child of gridNode.children) if(child.id == id) return child;
	return null;
}
core.GridNodes.saveNode = function(gridNode, callback){ // Save GridNode
	core.Settings.save(callback);
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
	switch(gridNode.type){
		case core.GridNodes.GridNodeType.folder:
			delete gridNode.image;
			delete gridNode.__isLoading;
			core.GridNodes.saveNode(gridNode);
			if(callback) callback({ title: gridNode.title, screenshot: gridNode.image });
			break;
		case core.GridNodes.GridNodeType.bookmark:
			core.SiteInfos.fromFrame(gridNode.url, function(infos){
				if(infos){
					gridNode.title = infos.title;
					gridNode.image = infos.screenshot;
				} else {
					gridNode.image = '0';
				}
				delete gridNode.__isLoading;
				core.GridNodes.saveNode(gridNode);
				if(callback) callback(infos);
			});
			break;
	}
}
core.GridNodes.capturePage = function(gridNode, callback){
	if(gridNode.__isLoading == true) return;
	gridNode.__isLoading = true;
	switch(gridNode.type){
		case core.GridNodes.GridNodeType.folder:
			var nodes = core.GridNodes.getNodeWithParents(gridNode.id);
			if(nodes){
				var path = '';
				for(var i=1; i<nodes.length; i++) path = path + '/' + nodes[i].title;
				core.SiteInfos.fromNewTab('/dial?path=' + path, function(infos){
					if(infos){
						gridNode.image = infos.screenshot;
					} else {
						delete gridNode.image;
					}
					delete gridNode.__isLoading;
					core.GridNodes.saveNode(gridNode);
					if(callback) callback({ title: gridNode.title, screenshot: gridNode.image });
				});
			}
			break;
		case core.GridNodes.GridNodeType.bookmark:
			core.SiteInfos.fromNewTab(gridNode.url, function(infos){
				if(infos){
					gridNode.title = infos.title;
					gridNode.image = infos.screenshot;
				} else {
					gridNode.image = '0';
				}
				delete gridNode.__isLoading;
				core.GridNodes.saveNode(gridNode);
				if(callback) callback(infos);
			});
			break;
	}
}
