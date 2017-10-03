var BackgroundImage = null;

window.onload = function(){
	browser.runtime.getBackgroundPage().then(function(page){
		app = page.app;
		BackgroundColor.value = app.settings.backgroundColor;
		BackgroundImage = app.settings.backgroundImage;
		BackgroundPreview.style.backgroundColor = app.settings.backgroundColor;
		BackgroundPreview.style.backgroundImage = app.settings.backgroundImage;
		BackgroundPreview.style.backgroundRepeat = 'no-repeat';
		BackgroundPreview.style.backgroundSize = '100% 100%';
		GridRows.value = app.settings.grid.rows;
		GridMargins.value = app.settings.grid.margin;
		GridColumns.value = app.settings.grid.columns;
		GridCellsMargins.value = app.settings.grid.cells.margin;
		GridCellsMarginsHover.value = app.settings.grid.cells.marginHover;
		GridCellsBorderRadius.value = app.settings.grid.cells.borderRadius;
		GridCellsBorderRadiusHover.value = app.settings.grid.cells.borderRadiusHover;
		GridCellsBorderColor.value = app.settings.grid.cells.borderColor;
		GridCellsBorderColorHover.value = app.settings.grid.cells.borderColorHover;
		GridCellsTitle.checked = app.settings.grid.cells.title;
		GridCellsTitleHeight.value = app.settings.grid.cells.titleHeight;
		GridCellsTitleFontSize.value = app.settings.grid.cells.titleFontSize;
		GridCellsTitleColor.value = app.settings.grid.cells.titleColor;
		GridCellsTitleColorHover.value = app.settings.grid.cells.titleColorHover;
	});

	BtnOk.onclick = function(){
		BtnApply.onclick();
		window.frameElement.popup.close();
	}
	BtnApply.onclick = function(){
		app.settings.backgroundColor = BackgroundColor.value;
		app.settings.backgroundImage = BackgroundImage;
		app.settings.grid.rows = +(GridRows.value);
		app.settings.grid.margin = +(GridMargins.value);
		app.settings.grid.columns = +(GridColumns.value);
		app.settings.grid.cells.margin = +(GridCellsMargins.value);
		//app.settings.grid.cells.marginHover = +(GridCellsMarginsHover.value);
		app.settings.grid.cells.marginHover = +(GridCellsMargins.value);
		app.settings.grid.cells.borderRadius = +(GridCellsBorderRadius.value);
		app.settings.grid.cells.borderRadiusHover = +(GridCellsBorderRadiusHover.value);
		app.settings.grid.cells.borderColor = GridCellsBorderColor.value;
		app.settings.grid.cells.borderColorHover = GridCellsBorderColorHover.value;
		app.settings.grid.cells.title = GridCellsTitle.checked;
		app.settings.grid.cells.titleHeight = GridCellsTitleHeight.value;
		app.settings.grid.cells.titleFontSize = GridCellsTitleFontSize.value;
		app.settings.grid.cells.titleColor = GridCellsTitleColor.value;
		app.settings.grid.cells.titleColorHover = GridCellsTitleColorHover.value;
		app.saveSettings();
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

}