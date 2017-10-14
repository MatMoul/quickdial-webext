var app = {};

document.addEventListener("DOMContentLoaded", function(event) {
	app.init();
});

app.init = function(){
	app.Messages.getSettings(function(settings){
		app.settings = settings;
		app.Messages.getNodeByID(new URL(window.location).searchParams.get('id'), function(node){
			app.node = node;
			Title.value = node.title;
			ImagePreview.style.backgroundRepeat = 'no-repeat';
			ImagePreview.style.backgroundSize = '100% 100%';
			switch(node.type){
				case app.GridNodes.GridNodeType.folder:
					Url.parentNode.parentNode.style.display = 'none';
					if(node.image) ImagePreview.style.backgroundImage = 'url(' + node.image + ')';
					else ImagePreview.style.backgroundImage = app.settings.grid.folderIcon;
					break;
				case app.GridNodes.GridNodeType.bookmark:
					ImageReset.style.display = 'none';
					Url.value = node.url;
					ImagePreview.style.backgroundImage = 'url(' + node.image + ')';
					break;
			}
		});
	});


	BtnOk.onclick = function(){
		BtnApply.onclick();
		window.frameElement.popup.close();
	}
	BtnApply.onclick = function(){
		switch(app.node.type){
			case app.GridNodes.GridNodeType.folder:
				app.Messages.updateNode(app.node.id, { title: Title.value })
				break;
			case app.GridNodes.GridNodeType.bookmark:
				app.Messages.updateNode(app.node.id, { title: Title.value, url: Url.value })
				break;
		}
	}
	BtnCancel.onclick = function(){
		window.frameElement.popup.close();
	}

	var tabButtons = Tabs.children[0].children[0].children[0];
	for(var i=0; i<tabButtons.children.length-1; i++){
		tabButtons.children[i].index = i;
		tabButtons.children[i].onclick = function(){
			for(var j=0; j<tabButtons.children.length-1; j++){
				if(j==this.index){
					tabButtons.children[j].className = 'TabButtonActive';
					Tabs.children[1].children[j].className = '';
				} else {
					tabButtons.children[j].className = 'TabButton';
					Tabs.children[1].children[j].className = 'hidden';
				}
			}
		}
	}

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
app.Messages.getSettings = function(callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.getSettings }).then(callback);
};
app.Messages.getNodeByID = function(id, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.getNodeByID, id: id }).then(callback);
};
app.Messages.updateNode = function(id, value, callback){
	browser.runtime.sendMessage({ cmd: app.Messages.Commands.updateNode, id: id, value: value }).then(callback);
};

app.GridNodes = {};
app.GridNodes.GridNodeType = { // GridNodeType
	back: -1,
	empty: 0,
	folder: 1,
	bookmark: 2
}
