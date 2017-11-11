var app = {};

var BackgroundImage = null;
var GridBackImage = null;
var GridFolderImage = null;

document.addEventListener("DOMContentLoaded", function(event) {
	app.init();
});


app.init = function(){
	document.addEventListener('keyup', function(e){
		switch(e.key){
			case 'Escape':
				window.frameElement.popup.close();
				break;
		}
	});
	app.Messages.getSettings(function(settings){
		app.settings = settings;
		BackgroundColor.value = app.settings.backgroundColor;
		BackgroundImage = app.settings.backgroundImage;
		BackgroundMode.value = app.settings.backgroundMode;
		BackgroundPreview.style.backgroundColor = app.settings.backgroundColor;
		BackgroundPreview.style.backgroundImage = app.settings.backgroundImage;
		BackgroundPreview.style.backgroundRepeat = 'no-repeat';
		BackgroundPreview.style.backgroundSize = '100% 100%';
		GridRoot.value = app.settings.grid.root;
		GridRows.value = app.settings.grid.rows;
		GridMargins.value = app.settings.grid.margin;
		GridColumns.value = app.settings.grid.columns;
		GridBackNode.checked = app.settings.grid.backNode;
		GridBackMode.value = app.settings.grid.backIconMode;
		GridBackImage = app.settings.grid.backIcon;
		GridBackPreview.style.backgroundImage = app.settings.grid.backIcon;
		GridBackPreview.style.backgroundRepeat = 'no-repeat';
		GridBackPreview.style.backgroundPosition = '50% 50%';
		GridFolderMode.value = app.settings.grid.folderIconMode;
		GridFolderImage = app.settings.grid.folderIcon;
		GridFolderPreview.style.backgroundImage = app.settings.grid.folderIcon;
		GridFolderPreview.style.backgroundRepeat = 'no-repeat';
		GridFolderPreview.style.backgroundSize = '100% 100%';
		GridCellsMargins.value = app.settings.grid.cells.margin;
		GridCellsMarginsHover.value = app.settings.grid.cells.marginHover;
		GridCellsOpacity.value = app.settings.grid.cells.opacity * 100;
		GridCellsOpacityHover.value = app.settings.grid.cells.opacityHover * 100;
		GridCellsBorderSize.value = app.settings.grid.cells.borderSize;
		GridCellsBorderSizeHover.value = app.settings.grid.cells.borderSizeHover;
		GridCellsBackgroundTransparent.checked = (app.settings.grid.cells.backgroundColor == null);
		GridCellsBackgroundColor.value = app.settings.grid.cells.backgroundColor;
		GridCellsBackgroundTransparentHover.checked = (app.settings.grid.cells.backgroundColorHover == null);
		GridCellsBackgroundColorHover.value = app.settings.grid.cells.backgroundColorHover;
		GridCellsBorderRadius.value = app.settings.grid.cells.borderRadius;
		GridCellsBorderRadiusHover.value = app.settings.grid.cells.borderRadiusHover;
		GridCellsBorderColor.value = app.settings.grid.cells.borderColor;
		GridCellsBorderColorHover.value = app.settings.grid.cells.borderColorHover;
		GridCellsTitle.checked = app.settings.grid.cells.title;
		GridCellsTitleHover.checked = app.settings.grid.cells.titleHover;
		GridCellsTitleHeight.value = app.settings.grid.cells.titleHeight;
		GridCellsTitleHeightHover.value = app.settings.grid.cells.titleHeightHover;
		GridCellsTitleFontSize.value = app.settings.grid.cells.titleFontSize;
		GridCellsTitleFontSizeHover.value = app.settings.grid.cells.titleFontSizeHover;
		GridCellsTitleBorderSize.value = app.settings.grid.cells.titleBorderSize;
		GridCellsTitleBorderSizeHover.value = app.settings.grid.cells.titleBorderSizeHover;
		GridCellsTitleColor.value = app.settings.grid.cells.titleColor;
		GridCellsTitleColorHover.value = app.settings.grid.cells.titleColorHover;
		GridCellsTitleBackgroundTransparent.checked = (app.settings.grid.cells.titleBackgroundColor == null);
		GridCellsTitleBackgroundColor.value = app.settings.grid.cells.titleBackgroundColor;
		GridCellsTitleBackgroundColorHover.value = app.settings.grid.cells.titleBackgroundColorHover;
		GridCellsTitleBackgroundTransparentHover.checked = (app.settings.grid.cells.titleBackgroundColorHover == null);
	});

	BtnOk.onclick = function(){
		BtnApply.onclick();
		window.frameElement.popup.close();
	}
	BtnApply.onclick = function(){
		app.settings.backgroundColor = BackgroundColor.value;
		app.settings.backgroundImage = BackgroundImage;
		app.settings.backgroundMode = +(BackgroundMode.value);
		app.settings.grid.rows = +(GridRows.value);
		app.settings.grid.margin = +(GridMargins.value);
		app.settings.grid.columns = +(GridColumns.value);
		app.settings.grid.backNode = GridBackNode.checked;
		app.settings.grid.backIconMode = +(GridBackMode.value);
		app.settings.grid.backIcon = GridBackImage;
		app.settings.grid.folderIconMode = +(GridFolderMode.value);
		app.settings.grid.folderIcon = GridFolderImage;
		app.settings.grid.cells.margin = +(GridCellsMargins.value);
		app.settings.grid.cells.marginHover = +(GridCellsMarginsHover.value);
		app.settings.grid.cells.opacity = +(GridCellsOpacity.value) / 100;
		app.settings.grid.cells.opacityHover = +(GridCellsOpacityHover.value) / 100;
		app.settings.grid.cells.borderSize = +(GridCellsBorderSize.value);
		app.settings.grid.cells.borderSizeHover = +(GridCellsBorderSizeHover.value);
		if(GridCellsBackgroundTransparent.checked == true) app.settings.grid.cells.backgroundColor = null;
		else app.settings.grid.cells.backgroundColor = GridCellsBackgroundColor.value;
		if(GridCellsBackgroundTransparentHover.checked == true) app.settings.grid.cells.backgroundColorHover = null;
		else app.settings.grid.cells.backgroundColorHover = GridCellsBackgroundColorHover.value;
		app.settings.grid.cells.borderRadius = +(GridCellsBorderRadius.value);
		app.settings.grid.cells.borderRadiusHover = +(GridCellsBorderRadiusHover.value);
		app.settings.grid.cells.borderColor = GridCellsBorderColor.value;
		app.settings.grid.cells.borderColorHover = GridCellsBorderColorHover.value;
		app.settings.grid.cells.title = GridCellsTitle.checked;
		app.settings.grid.cells.titleHover = GridCellsTitleHover.checked;
		app.settings.grid.cells.titleHeight = GridCellsTitleHeight.value;
		app.settings.grid.cells.titleHeightHover = GridCellsTitleHeightHover.value;
		app.settings.grid.cells.titleFontSize = GridCellsTitleFontSize.value;
		app.settings.grid.cells.titleFontSizeHover = GridCellsTitleFontSizeHover.value;
		app.settings.grid.cells.titleBorderSize = GridCellsTitleBorderSize.value;
		app.settings.grid.cells.titleBorderSizeHover = GridCellsTitleBorderSizeHover.value;
		app.settings.grid.cells.titleColor = GridCellsTitleColor.value;
		app.settings.grid.cells.titleColorHover = GridCellsTitleColorHover.value;
		if(GridCellsTitleBackgroundTransparent.checked == true) app.settings.grid.cells.titleBackgroundColor = null;
		else app.settings.grid.cells.titleBackgroundColor = GridCellsTitleBackgroundColor.value;
		if(GridCellsTitleBackgroundTransparentHover.checked == true) app.settings.grid.cells.titleBackgroundColorHover = null;
		else app.settings.grid.cells.titleBackgroundColorHover = GridCellsTitleBackgroundColorHover.value;
		app.settings.grid.root = GridRoot.value;
		browser.runtime.sendMessage( { cmd: app.Messages.Commands.setSettings, settings: app.settings } );
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

	BackgroundColor.onchange = function(){
		BackgroundPreview.style.backgroundColor = BackgroundColor.value;
	}
	BackgroundImageClear.onclick = function(){
		BackgroundImage = null;
		BackgroundPreview.style.backgroundImage = BackgroundImage;
	}
	BackgroundImageFile.onclick = function(){
		this.value = null;
	}
	BackgroundImageFile.onchange = function(){
		var fileReader = new FileReader();
		fileReader.onload = function(e){
			BackgroundImage = 'url(' + e.target.result + ')';
			BackgroundImageFile.value = null;
			BackgroundPreview.style.backgroundImage = BackgroundImage;
		}
		fileReader.readAsDataURL(BackgroundImageFile.files[0]);
	}

	GridBackImageReset.onclick = function(){
		GridBackImage = 'url(/img/back.png)';
		GridBackPreview.style.backgroundImage = GridBackImage;
	}
	GridBackImageFile.onclick = function(){
		this.value = null;
	}
	GridBackImageFile.onchange = function(){
		var fileReader = new FileReader();
		fileReader.onload = function(e){
			GridBackImage = 'url(' + e.target.result + ')';
			GridBackImageFile.value = null;
			GridBackPreview.style.backgroundImage = GridBackImage;
		}
		fileReader.readAsDataURL(GridBackImageFile.files[0]);
	}

	GridFolderImageReset.onclick = function(){
		GridFolderImage = 'url(/img/folder.png)';
		GridFolderPreview.style.backgroundImage = GridFolderImage;
	}
	GridFolderImageFile.onclick = function(){
		this.value = null;
	}
	GridFolderImageFile.onchange = function(){
		var fileReader = new FileReader();
		fileReader.onload = function(e){
			GridFolderImage = 'url(' + e.target.result + ')';
			GridFolderImageFile.value = null;
			GridFolderPreview.style.backgroundImage = GridFolderImage;
		}
		fileReader.readAsDataURL(GridFolderImageFile.files[0]);
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




