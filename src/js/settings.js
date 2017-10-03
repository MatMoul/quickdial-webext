var BackgroundImage = null;

window.onload = function(){
	browser.runtime.getBackgroundPage().then(function(page){
		app = page.app;
		BackgroundColor.value = app.settings.backgroundColor;
		BackgroundImage = app.settings.backgroundImage;
		GridRows.value = app.settings.grid.rows;
		GridMargins.value = app.settings.grid.margin;
		GridColumns.value = app.settings.grid.columns;
		GridCellsMargins.value = app.settings.grid.cells.margin;
		GridCellsBorderRadius.value = app.settings.grid.cells.borderRadius;
		GridCellsBorderColor.value = app.settings.grid.cells.borderColor;
		GridCellsBorderColorHover.value = app.settings.grid.cells.borderColorHover;
		GridCellsTitleColor.value = app.settings.grid.cells.titleColor;
		GridCellsTitleColorHover.value = app.settings.grid.cells.titleColorHover;
	});

	BackgroundImageClear.onclick = function(){
		BackgroundImage = null;
	}
	BackgroundImageFile.onclick = function(){
		this.value = null;
	}
	BackgroundImageFile.onchange = function(){
		var fileReader = new FileReader();
		fileReader.onload = function(e){
			BackgroundImage = 'url(' + e.target.result + ')';
		}
		fileReader.readAsDataURL(BackgroundImageFile.files[0]);
	}

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
		app.settings.grid.cells.borderRadius = +(GridCellsBorderRadius.value);
		app.settings.grid.cells.borderColor = GridCellsBorderColor.value;
		app.settings.grid.cells.borderColorHover = GridCellsBorderColorHover.value;
		app.settings.grid.cells.titleColor = GridCellsTitleColor.value;
		app.settings.grid.cells.titleColorHover = GridCellsTitleColorHover.value;
		app.saveSettings();
	}
	BtnCancel.onclick = function(){
		window.frameElement.popup.close();
	}
}