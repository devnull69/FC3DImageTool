var ImageInfo = {
	"src": document.getElementById('fc_image').src
};

chrome.extension.sendRequest(ImageInfo, function(response) {
	createImage(response.base64src);
});

var ctx = null;
var theImage = null;
var flipped = false;
var theCenter = 0;
var linesshown = false;
var isredcyan = false;
var ismonochrom = false;
var isinterlaced = false;
var sfIsOriginal = 'original';
var sfOffset = 0;
var preselect = '';
var theLinkContainer = null;
var dragStart = false;
var frameStartX = 0;
var frameStartY = 0;

function createImage(base64src) {
	theImage = new Image();
	theImage.src = base64src;
	theImage.addEventListener( 'load', function() {
		startUp();
	}, false );
}

function detectPage() {
	if(preselect != '') return preselect;
	if(location.href.indexOf('/5584/') != -1) return 'kreuz';
	if(location.href.indexOf('/5585/') != -1) return 'parallel';
	if(location.href.indexOf('/2616/') != -1) return 'anaglyph';
	if(location.href.indexOf('/14724/') != -1) return 'kmq';
	return 'sonstige';
}

function startUp() {
	switch(detectPage()) {
		case 'kreuz':
		case 'parallel':
		case 'anaglyph':
		case 'kmq':			createCanvas();
							break;
		case 'sonstige':	createLinks();
							break;
		default:			break;
	}
}

function createCanvas() {
	addGlobalStyle('canvas {position: relative; text-align:center; left: '+window.getComputedStyle(document.getElementById('fc_image'),false).left+';} #showwait {position: fixed; top: 200px; left: 490px; padding: 3px; width: 100px; border: 1px solid black; z-index: 10000; color: black; background-color: white;}');
	if(theLinkContainer == null) {
		var newDiv = document.createElement('div');
		newDiv.id = 'linkcontainer';
		newDiv.style.width = '100%';
		document.getElementById('display_foto').insertBefore(newDiv, document.getElementById('fc_image'));
		theLinkContainer = document.getElementById('linkcontainer');
	}
	if(detectPage() == 'kreuz' || detectPage() == 'parallel') {
		document.getElementById('fc_image').style.display = 'none';
		
		var theButton = document.createElement('input');
		theButton.id = 'fc_image_flip';
		theButton.type = 'button';
		if(detectPage() == 'kreuz') {
			theButton.value = '-> Parallelblick';
		} else {
			theButton.value = '-> Kreuzblick';
		}
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_flip').addEventListener('click', flipImage, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_showline';
		theButton.type = 'button';
		theButton.value = 'Hilfslinien';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_showline').addEventListener('click', showLine, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_redcyan';
		theButton.type = 'button';
		theButton.style.marginLeft = '10px';
		theButton.value = 'Red/Cyan';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_redcyan').addEventListener('click', showWait, false);
		
		var theCheckbox = document.createElement('input');
		theCheckbox.id = 'fc_image_halftone';
		theCheckbox.type = 'checkbox';
		theCheckbox.checked = false;
		theLinkContainer.appendChild(theCheckbox);
		document.getElementById('fc_image_halftone').addEventListener('click', toggleHalftone, false);

		var theLabel = document.createElement('label');
		theLabel.id = 'fc_image_halftonelabel';
		theLabel.setAttribute('for','fc_image_halftone');
		var theText = document.createTextNode('Halbton');
		theLabel.appendChild(theText);
		theLinkContainer.appendChild(theLabel);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_interlaced';
		theButton.type = 'button';
		theButton.style.marginLeft = '10px';
		theButton.value = 'Zalman Interlaced';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_interlaced').addEventListener('click', showWaitInterlaced, false);
		
		theCheckbox = document.createElement('input');
		theCheckbox.id = 'fc_image_interlaceswitch';
		theCheckbox.type = 'checkbox';
		theCheckbox.checked = false;
		theLinkContainer.appendChild(theCheckbox);
		document.getElementById('fc_image_interlaceswitch').addEventListener('click', toggleInterlace, false);

		theLabel = document.createElement('label');
		theLabel.id = 'fc_image_iswitchlabel';
		theLabel.setAttribute('for','fc_image_interlaceswitch');
		theText = document.createTextNode('gerade/ungerade tauschen');
		theLabel.appendChild(theText);
		theLinkContainer.appendChild(theLabel);

		newDiv = document.createElement('div');
		newDiv.id = 'showwait';
		var theText = document.createTextNode('Bitte warten...');
		newDiv.appendChild(theText);
		document.getElementById('display_foto').appendChild(newDiv);
		document.getElementById('showwait').style.display = 'none';
		theCenter = Math.floor(theImage.width / 2);
	} 
	if(detectPage() == 'anaglyph') {
		var theSpan = document.createElement('span');
		theSpan.id = 'fc_image_sfOffsetLabel';
		theSpan.style.paddingRight = '5px';
		var theText = document.createTextNode('Horiz. Verschiebung: ');
		theSpan.appendChild(theText);
		theLinkContainer.appendChild(theSpan);
		
		theSpan = document.createElement('span');
		theSpan.id = 'fc_image_sfOffset';
		theSpan.style.paddingRight = '5px';
		theText = document.createTextNode(sfOffset.toString());
		theSpan.appendChild(theText);
		theLinkContainer.appendChild(theSpan);
		
		var theButton = document.createElement('input');
		theButton.id = 'fc_image_monokreuz';
		theButton.type = 'button';
		theButton.value = 'Monochrom Kreuzblick';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_monokreuz').addEventListener('click', showWaitMono, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_scheinfenster';
		theButton.type = 'button';
		theButton.value = 'Scheinfenster';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_scheinfenster').addEventListener('click', scheinFenster, false);

		newDiv = document.createElement('div');
		newDiv.id = 'showwait';
		var theText = document.createTextNode('Bitte warten...');
		newDiv.appendChild(theText);
		document.getElementById('display_foto').appendChild(newDiv);
		document.getElementById('showwait').style.display = 'none';
		theCenter = Math.floor(theImage.width / 2);
	}
	if(detectPage() == 'kmq') {
		document.getElementById('fc_image').style.display = 'none';
		
		var theButton = document.createElement('input');
		theButton.id = 'fc_image_showline';
		theButton.type = 'button';
		theButton.value = 'Hilfslinien';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_showline').addEventListener('click', showLineKMQ, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_redcyan';
		theButton.type = 'button';
		theButton.style.marginLeft = '10px';
		theButton.value = 'Red/Cyan';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_redcyan').addEventListener('click', showWait, false);
		
		var theCheckbox = document.createElement('input');
		theCheckbox.id = 'fc_image_halftone';
		theCheckbox.type = 'checkbox';
		theCheckbox.checked = false;
		theLinkContainer.appendChild(theCheckbox);
		document.getElementById('fc_image_halftone').addEventListener('click', toggleHalftone, false);

		var theLabel = document.createElement('label');
		theLabel.id = 'fc_image_halftonelabel';
		theLabel.setAttribute('for','fc_image_halftone');
		var theText = document.createTextNode('Halbton');
		theLabel.appendChild(theText);
		theLinkContainer.appendChild(theLabel);

		newDiv = document.createElement('div');
		newDiv.id = 'showwait';
		var theText = document.createTextNode('Bitte warten...');
		newDiv.appendChild(theText);
		document.getElementById('display_foto').appendChild(newDiv);
		document.getElementById('showwait').style.display = 'none';
		theCenter = Math.floor(theImage.height / 2);
	} 
	var newCanvas = document.createElement('canvas');
	newCanvas.id = 'fc_image_canvas';
	newCanvas.width = theImage.width;
	newCanvas.height = theImage.height;
	if(detectPage() == 'anaglyph') newCanvas.style.display = 'none';
	document.getElementById('display_foto').insertBefore(newCanvas, document.getElementById('fc_image'));
	var canvas = document.getElementById('fc_image_canvas');  
	ctx = canvas.getContext('2d');
	ctx.drawImage(theImage, 0, 0 );
	
}

function createLinks() {
	var newDiv = document.createElement('div');
	newDiv.id = 'linkcontainer';
	newDiv.style.width = '100%';
	document.getElementById('display_foto').insertBefore(newDiv, document.getElementById('fc_image'));
	theLinkContainer = document.getElementById('linkcontainer');
	var newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_label';
	var theText = document.createTextNode('Bei diesem Foto handelt es sich um ein: ');
	newSpan.appendChild(theText);
	theLinkContainer.appendChild(newSpan);

	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_kreuz';
	var newAnchor = document.createElement('a');
	newAnchor.href = '#';
	theText = document.createTextNode('Kreuzblickstereo');
	newAnchor.appendChild(theText);
	newSpan.appendChild(newAnchor);
	theLinkContainer.appendChild(newSpan);
	document.getElementById('fc_links_kreuz').addEventListener('click', function() {
		preselect = 'kreuz';
		removeLinks();
		createCanvas();
		return false;
	}, false);
	
	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_sep1';
	theText = document.createTextNode('/');
	newSpan.appendChild(theText);
	theLinkContainer.appendChild(newSpan);

	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_parallel';
	newAnchor = document.createElement('a');
	newAnchor.href = '#';
	theText = document.createTextNode('Parallelblickstereo');
	newAnchor.appendChild(theText);
	newSpan.appendChild(newAnchor);
	theLinkContainer.appendChild(newSpan);
	document.getElementById('fc_links_parallel').addEventListener('click', function() {
		preselect = 'parallel';
		removeLinks();
		createCanvas();
		return false;
	}, false);
	
	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_sep2';
	theText = document.createTextNode('/');
	newSpan.appendChild(theText);
	theLinkContainer.appendChild(newSpan);

	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_anaglyph';
	newAnchor = document.createElement('a');
	newAnchor.href = '#';
	theText = document.createTextNode('Anaglyphenstereo');
	newAnchor.appendChild(theText);
	newSpan.appendChild(newAnchor);
	theLinkContainer.appendChild(newSpan);
	document.getElementById('fc_links_anaglyph').addEventListener('click', function() {
		preselect = 'anaglyph';
		removeLinks();
		createCanvas();
		return false;
	}, false);

	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_sep3';
	theText = document.createTextNode('/');
	newSpan.appendChild(theText);
	theLinkContainer.appendChild(newSpan);

	newSpan = document.createElement('span');
	newSpan.style.paddingRight = '5px';
	newSpan.id = 'fc_links_kmq';
	newAnchor = document.createElement('a');
	newAnchor.href = '#';
	theText = document.createTextNode('KMQ');
	newAnchor.appendChild(theText);
	newSpan.appendChild(newAnchor);
	theLinkContainer.appendChild(newSpan);
	document.getElementById('fc_links_kmq').addEventListener('click', function() {
		preselect = 'kmq';
		removeLinks();
		createCanvas();
		return false;
	}, false);
	
}

function removeLinks() {
	document.getElementById('fc_links_label').parentNode.removeChild(document.getElementById('fc_links_label'));
	document.getElementById('fc_links_kreuz').parentNode.removeChild(document.getElementById('fc_links_kreuz'));
	document.getElementById('fc_links_sep1').parentNode.removeChild(document.getElementById('fc_links_sep1'));
	document.getElementById('fc_links_parallel').parentNode.removeChild(document.getElementById('fc_links_parallel'));
	document.getElementById('fc_links_sep2').parentNode.removeChild(document.getElementById('fc_links_sep2'));
	document.getElementById('fc_links_anaglyph').parentNode.removeChild(document.getElementById('fc_links_anaglyph'));
	document.getElementById('fc_links_sep3').parentNode.removeChild(document.getElementById('fc_links_sep3'));
	document.getElementById('fc_links_kmq').parentNode.removeChild(document.getElementById('fc_links_kmq'));
}

function flipImage() {
	if(!ctx) return;
	if(linesshown) {
		RemoveButtons();
		linesshown = false;
		var canvas = document.getElementById('fc_image_canvas');
		canvas.removeEventListener('mousedown', onMouseDown);
		canvas.removeEventListener('mouseup', onMouseUp);
		canvas.removeEventListener('mousemove', onMouseMove);
	}
	if(!flipped) {
		// Paste image two times
		// First image is moved half way to the left
		// second image is moved half way to the right
		ctx.drawImage(theImage, -theCenter, 0);
		ctx.drawImage(theImage, theCenter, 0);
		flipped = true;
	} else {
		ctx.drawImage(theImage, 0, 0);
		flipped = false;
	}
	ButtonText();
	isredcyan = false;
	isinterlaced = false;
}

function showLine() {
	if(!ctx) return;
	ctx.drawImage(theImage, 0, 0);
	flipped = false;
	ButtonText();
	isredcyan = false;
	isinterlaced = false;
	var canvas = document.getElementById('fc_image_canvas');
	if(!linesshown) {
		// linker Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// rechter Rand
		ctx.beginPath();
		ctx.moveTo(theImage.width, 0);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(theCenter, 0);
		ctx.lineTo(theCenter, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();

		var theButton = document.createElement('input');
		theButton.id = 'fc_image_left';
		theButton.type = 'button';
		theButton.value = '<';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_left').addEventListener('click', moveLineLeft, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_right';
		theButton.type = 'button';
		theButton.value = '>';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_right').addEventListener('click', moveLineRight, false);
		
		theButton = document.createElement('input');
		theButton.id = 'fc_image_center';
		theButton.type = 'button';
		theButton.value = 'Center';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_center').addEventListener('click', moveLineCenter, false);

		document.getElementById('fc_image_showline').value = 'Hilfslinien ausblenden';
		linesshown = true;
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mouseup', onMouseUp, false);
		canvas.addEventListener('mousemove', onMouseMove, false);
	} else {
		RemoveButtons();
		linesshown = false;
		canvas.removeEventListener('mousedown', onMouseDown);
		canvas.removeEventListener('mouseup', onMouseUp);
		canvas.removeEventListener('mousemove', onMouseMove);
	}
}

function onMouseDown(e) {
	if(e.offsetX>theCenter-5 && e.offsetX<theCenter+5) {
		frameStartX = e.offsetX;
		frameStartY = e.offsetY;
		dragStart = true;
	}
}

function onMouseUp(e) {
	dragStart = false;
}

function onMouseMove(e) {
	if(dragStart) {
		theCenter = e.offsetX;
		ctx.drawImage(theImage,0,0);
		// linker Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// rechter Rand
		ctx.beginPath();
		ctx.moveTo(theImage.width, 0);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(theCenter, 0);
		ctx.lineTo(theCenter, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
	} else {
		var canvas = document.getElementById('fc_image_canvas');
		if(e.offsetX>theCenter-5 && e.offsetX<theCenter+5) {
				canvas.style.cursor = 'w-resize';
		} else {
				canvas.style.cursor = 'auto';
		}
	}
}

function showLineKMQ() {
	if(!ctx) return;
	ctx.drawImage(theImage, 0, 0);
	isredcyan = false;
	var canvas = document.getElementById('fc_image_canvas');
	if(!linesshown) {
		// oberer Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(theImage.width, 0);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// unterer Rand
		ctx.beginPath();
		ctx.moveTo(0, theImage.height);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(0, theCenter);
		ctx.lineTo(theImage.width, theCenter);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();

		var theButton = document.createElement('input');
		theButton.id = 'fc_image_up';
		theButton.type = 'button';
		theButton.value = '^';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_up').addEventListener('click', moveLineUp, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_down';
		theButton.type = 'button';
		theButton.value = 'v';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_down').addEventListener('click', moveLineDown, false);
		
		theButton = document.createElement('input');
		theButton.id = 'fc_image_center';
		theButton.type = 'button';
		theButton.value = 'Center';
		theLinkContainer.insertBefore(theButton, document.getElementById('fc_image_redcyan'));
		document.getElementById('fc_image_center').addEventListener('click', moveLineCenterKMQ, false);

		document.getElementById('fc_image_showline').value = 'Hilfslinien ausblenden';
		linesshown = true;
		canvas.addEventListener('mousedown', onMouseDownKMQ, false);
		canvas.addEventListener('mouseup', onMouseUpKMQ, false);
		canvas.addEventListener('mousemove', onMouseMoveKMQ, false);
	} else {
		RemoveButtonsKMQ();
		linesshown = false;
		canvas.removeEventListener('mousedown', onMouseDownKMQ);
		canvas.removeEventListener('mouseup', onMouseUpKMQ);
		canvas.removeEventListener('mousemove', onMouseMoveKMQ);
	}
}

function onMouseDownKMQ(e) {
	if(e.offsetY>theCenter-5 && e.offsetY<theCenter+5) {
		frameStartX = e.offsetX;
		frameStartY = e.offsetY;
		dragStart = true;
	}
}

function onMouseUpKMQ(e) {
	dragStart = false;
}

function onMouseMoveKMQ(e) {
	if(dragStart) {
		theCenter = e.offsetY;
		ctx.drawImage(theImage,0,0);
		// oberer Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(theImage.width, 0);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// unterer Rand
		ctx.beginPath();
		ctx.moveTo(0, theImage.height);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(0, theCenter);
		ctx.lineTo(theImage.width, theCenter);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
	} else {
		var canvas = document.getElementById('fc_image_canvas');
		if(e.offsetY>theCenter-5 && e.offsetY<theCenter+5) {
				canvas.style.cursor = 's-resize';
		} else {
				canvas.style.cursor = 'auto';
		}
	}
}

function showWait() {
	if(!ctx) return;
	if(isredcyan) return;
	document.getElementById('showwait').style.display = 'block';
	var isHalftone = document.getElementById('fc_image_halftone').checked;
	if(!isHalftone) {
		window.setTimeout(makeAnaglyph, 300);
	} else {
		window.setTimeout(HalftoneAnaglyph, 300);
	}
}

function toggleHalftone() {
	isredcyan = false;
}

function ButtonText() {
	var theButton = document.getElementById('fc_image_flip');
	if(detectPage() == 'kreuz') {
		if(flipped) {
			theButton.value = '-> Kreuzblick';
		} else {
			theButton.value = '-> Parallelblick';
		}
	} else {
		if(flipped) {
			theButton.value = '-> Parallelblick';
		} else {
			theButton.value = '-> Kreuzblick';
		}
	}
}

function moveLineLeft() {
	ctx.drawImage(theImage, 0, 0);
	theCenter--;
	if(theCenter<0) theCenter = 0;
	// linker Rand
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// rechter Rand
	ctx.beginPath();
	ctx.moveTo(theImage.width, 0);
	ctx.lineTo(theImage.width, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// Mitte
	ctx.beginPath();
	ctx.moveTo(theCenter, 0);
	ctx.lineTo(theCenter, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
	ctx.stroke();
}

function moveLineRight() {
	ctx.drawImage(theImage, 0, 0);
	theCenter++;
	if(theCenter>(theImage.width-1)) theCenter = theImage.width-1;
	// linker Rand
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// rechter Rand
	ctx.beginPath();
	ctx.moveTo(theImage.width, 0);
	ctx.lineTo(theImage.width, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// Mitte
	ctx.beginPath();
	ctx.moveTo(theCenter, 0);
	ctx.lineTo(theCenter, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
	ctx.stroke();
}

function moveLineCenter() {
	ctx.drawImage(theImage, 0, 0);
	theCenter = Math.floor(theImage.width / 2);
	// linker Rand
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// rechter Rand
	ctx.beginPath();
	ctx.moveTo(theImage.width, 0);
	ctx.lineTo(theImage.width, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
	ctx.stroke();
	// Mitte
	ctx.beginPath();
	ctx.moveTo(theCenter, 0);
	ctx.lineTo(theCenter, theImage.height);
	ctx.closePath();
	ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
	ctx.stroke();
}

function RemoveButtons() {
	document.getElementById('fc_image_showline').value = 'Hilfslinien';
	var theButton = document.getElementById('fc_image_left');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_right');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_center');
	theLinkContainer.removeChild(theButton);
}

function moveLineUp() {
	ctx.drawImage(theImage, 0, 0);
	theCenter--;
	if(theCenter<0) theCenter = 0;
		// oberer Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(theImage.width, 0);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// unterer Rand
		ctx.beginPath();
		ctx.moveTo(0, theImage.height);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(0, theCenter);
		ctx.lineTo(theImage.width, theCenter);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
}

function moveLineDown() {
	ctx.drawImage(theImage, 0, 0);
	theCenter++;
	if(theCenter>(theImage.height-1)) theCenter = theImage.height-1;
		// oberer Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(theImage.width, 0);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// unterer Rand
		ctx.beginPath();
		ctx.moveTo(0, theImage.height);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(0, theCenter);
		ctx.lineTo(theImage.width, theCenter);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
}

function moveLineCenterKMQ() {
	ctx.drawImage(theImage, 0, 0);
	theCenter = Math.floor(theImage.height / 2);
		// oberer Rand
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(theImage.width, 0);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// unterer Rand
		ctx.beginPath();
		ctx.moveTo(0, theImage.height);
		ctx.lineTo(theImage.width, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
		ctx.stroke();
		// Mitte
		ctx.beginPath();
		ctx.moveTo(0, theCenter);
		ctx.lineTo(theImage.width, theCenter);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
}

function RemoveButtonsKMQ() {
	document.getElementById('fc_image_showline').value = 'Hilfslinien';
	var theButton = document.getElementById('fc_image_up');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_down');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_center');
	theLinkContainer.removeChild(theButton);
}

function makeAnaglyph() {
	ctx.drawImage(theImage, 0, 0);
	flipped = false;
	if(detectPage() != 'kmq') ButtonText();
	isredcyan = true;
	isinterlaced = false;
	if(detectPage() != 'kmq') { 
		ButtonText();
		isredcyan = true;
		isinterlaced = false;
		if(linesshown) {
			RemoveButtons();
			linesshown = false;
			var canvas = document.getElementById('fc_image_canvas');
			canvas.removeEventListener('mousedown', onMouseDown);
			canvas.removeEventListener('mouseup', onMouseUp);
			canvas.removeEventListener('mousemove', onMouseMove);
		}
		var centerDiff = theCenter - Math.floor(theImage.width / 2);
	} else {
		isredcyan = true;
		if(linesshown) {
			RemoveButtonsKMQ();
			linesshown = false;
			var canvas = document.getElementById('fc_image_canvas');
			canvas.removeEventListener('mousedown', onMouseDownKMQ);
			canvas.removeEventListener('mouseup', onMouseUpKMQ);
			canvas.removeEventListener('mousemove', onMouseMoveKMQ);
		}
		var centerDiff = theCenter - Math.floor(theImage.height / 2);
	}
	
	if(detectPage() == 'kreuz') {
		// Kreuzblick
		// links muss rot weg, rechts muss gruen/blau weg
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
		}
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			pixels_links[i] = pixels_rechts[i]; // rot vom rechten Bild blau und gruen vom linken

			// Rechtes Teilbild in FC Farben
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	} 
	if(detectPage() == 'parallel') {
		// Parallelblick
		// links muss gruen/blau weg, rechts muss rot weg
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
		}
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			pixels_links[i] = pixels_links[i]; // rot vom linken Bild, blau und gruen vom rechten
			pixels_links[i+1] = pixels_rechts[i+1];
			pixels_links[i+2] = pixels_rechts[i+2];

			// Rechtes Teilbild in FC Farben
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	}
	if(detectPage() == 'kmq') {
		// KMQ
		// unten muss gruen/blau weg, oben muss rot weg
		if(centerDiff<=0) {
			var theImageData_oben = ctx.getImageData(0, 0, theImage.width, theCenter);
			var theImageData_unten = ctx.getImageData(0, theCenter, theImage.width, theCenter);
		} else {
			var theImageData_oben = ctx.getImageData(0, 0, theImage.width, theCenter-(centerDiff*2));
			var theImageData_unten = ctx.getImageData(0, theCenter, theImage.width, theCenter-(centerDiff*2));
		}
		var pixels_oben = theImageData_oben.data;
		var pixels_unten = theImageData_unten.data;
		
		for (var i = 0, n = pixels_oben.length; i < n; i += 4) {
			pixels_oben[i] = pixels_unten[i]; // rot vom unteren Bild, blau und gruen vom oberen

			// Unteres Teilbild in FC Farben
			pixels_unten[i] = 34;
			pixels_unten[i+1] = 34;
			pixels_unten[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_oben, 0, 0);
		ctx.putImageData(theImageData_unten, 0, Math.floor(theImage.height/2));
		delete theImageData_oben;
		theImageData_oben = null;
		delete theImageData_unten;
		theImageData_unten = null;
	}
	document.getElementById('showwait').style.display = 'none';
}

function HalftoneAnaglyph() {
	// A halftone algorithm from http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx
	ctx.drawImage(theImage, 0, 0);
	flipped = false;
	if(detectPage() != 'kmq') { 
		ButtonText();
		isredcyan = true;
		isinterlaced = false;
		if(linesshown) {
			RemoveButtons();
			linesshown = false;
			var canvas = document.getElementById('fc_image_canvas');
			canvas.removeEventListener('mousedown', onMouseDown);
			canvas.removeEventListener('mouseup', onMouseUp);
			canvas.removeEventListener('mousemove', onMouseMove);
		}
		var centerDiff = theCenter - Math.floor(theImage.width / 2);
	} else {
		isredcyan = true;
		if(linesshown) {
			RemoveButtonsKMQ();
			linesshown = false;
			var canvas = document.getElementById('fc_image_canvas');
			canvas.removeEventListener('mousedown', onMouseDownKMQ);
			canvas.removeEventListener('mouseup', onMouseUpKMQ);
			canvas.removeEventListener('mousemove', onMouseMoveKMQ);
		}
		var centerDiff = theCenter - Math.floor(theImage.height / 2);
	}
	
	
	if(detectPage() == 'kreuz') {
		// Kreuzblick
		// links muss rot weg, rechts muss gruen/blau weg
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
		}
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			// pixels_links[i] = 0.7*pixels_rechts[i+1] + 0.3*pixels_rechts[i+2]; // rot halftone Wimmer
			pixels_links[i] = 0.299*pixels_rechts[i] + 0.587*pixels_rechts[i+1] + 0.114*pixels_rechts[i+2]; // rot halftone common

			// Rechtes Teilbild in FC Farben
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	} 
	if(detectPage() == 'parallel') {
		// Parallelblick
		// links muss gruen/blau weg, rechts muss rot weg
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
		}
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			// pixels_links[i] = 0.7*pixels_rechts[i+1] + 0.3*pixels_rechts[i+2]; // rot halftone Wimmer
			pixels_links[i] = 0.299*pixels_links[i] + 0.587*pixels_links[i+1] + 0.114*pixels_links[i+2]; // rot halftone common
			pixels_links[i+1] = pixels_rechts[i+1];
			pixels_links[i+2] = pixels_rechts[i+2];

			// Rechtes Teilbild in FC Farben
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	}
	if(detectPage() == 'kmq') {
		// KMQ
		// unten muss gruen/blau weg, oben muss rot weg
		if(centerDiff<=0) {
			var theImageData_oben = ctx.getImageData(0, 0, theImage.width, theCenter);
			var theImageData_unten = ctx.getImageData(0, theCenter, theImage.width, theCenter);
		} else {
			var theImageData_oben = ctx.getImageData(0, 0, theImage.width, theCenter-(centerDiff*2));
			var theImageData_unten = ctx.getImageData(0, theCenter, theImage.width, theCenter-(centerDiff*2));
		}
		var pixels_oben = theImageData_oben.data;
		var pixels_unten = theImageData_unten.data;
		
		for (var i = 0, n = pixels_oben.length; i < n; i += 4) {
			// pixels_links[i] = 0.7*pixels_rechts[i+1] + 0.3*pixels_rechts[i+2]; // rot halftone Wimmer
			pixels_oben[i] = 0.299*pixels_unten[i] + 0.587*pixels_unten[i+1] + 0.114*pixels_unten[i+2]; // rot halftone common

			// Unteres Teilbild in FC Farben
			pixels_unten[i] = 34;
			pixels_unten[i+1] = 34;
			pixels_unten[i+2] = 34;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_oben, 0, 0);
		ctx.putImageData(theImageData_unten, 0, Math.floor(theImage.height/2));
		delete theImageData_oben;
		theImageData_oben = null;
		delete theImageData_unten;
		theImageData_unten = null;
	}
	document.getElementById('showwait').style.display = 'none';
}

function toggleInterlace() {
	isinterlaced = false;
}

function showWaitInterlaced() {
	if(!ctx) return;
	if(isinterlaced) return;
	document.getElementById('showwait').style.display = 'block';
	window.setTimeout(makeInterlace, 300);
}

function makeInterlace() {
	var isSwitched = document.getElementById('fc_image_interlaceswitch').checked;
	ctx.drawImage(theImage, 0, 0);
	flipped = false;
	ButtonText();
	isinterlaced = true;
	isredcyan = false;
	if(linesshown) {
		RemoveButtons();
		linesshown = false;
		var canvas = document.getElementById('fc_image_canvas');
		canvas.removeEventListener('mousedown', onMouseDown);
		canvas.removeEventListener('mouseup', onMouseUp);
		canvas.removeEventListener('mousemove', onMouseMove);
	}
	
	var centerDiff = theCenter - Math.floor(theImage.width / 2);
	
	if(detectPage() == 'kreuz') {
		// Kreuzblick
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
			var theWidth = theCenter;
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
			var theWidth = theCenter-(centerDiff*2);
		}
		
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		var zeile = 1;
		var spalte = 0;
		if(isSwitched) zeile = 0;

		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			if(spalte == theWidth) {
				zeile++;
				spalte = 0;
			}
			if(zeile % 2 == 0) {
				// gerade Zeilen von rechts die ungeraden sind automatisch von links
				pixels_links[i] = pixels_rechts[i];
				pixels_links[i+1] = pixels_rechts[i+1];
				pixels_links[i+2] = pixels_rechts[i+2];
			}
				
			// rechte Pixel zuruecksetzen
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;

			spalte++;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	} else {
		// Parallelblick
		if(centerDiff<=0) {
			var theImageData_links = ctx.getImageData(0, 0, theCenter, theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter, theImage.height);
			var theWidth = theCenter;
		} else {
			var theImageData_links = ctx.getImageData(0, 0, theCenter-(centerDiff*2), theImage.height);
			var theImageData_rechts = ctx.getImageData(theCenter, 0, theCenter-(centerDiff*2), theImage.height);
			var theWidth = theCenter-(centerDiff*2);
		}
		
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		var zeile = 1;
		var spalte = 0;
		if(isSwitched) zeile = 0;

		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			if(spalte == theWidth) {
				zeile++;
				spalte = 0;
			}
			if(zeile % 2 != 0) {
				// ungerade Zeilen von rechts die geraden sind automatisch von links
				pixels_links[i] = pixels_rechts[i];
				pixels_links[i+1] = pixels_rechts[i+1];
				pixels_links[i+2] = pixels_rechts[i+2];
			}
				
			// rechte Pixel zuruecksetzen
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;

			spalte++;
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx.putImageData(theImageData_links, 0, 0);
		ctx.putImageData(theImageData_rechts, theCenter, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;
	}
	
	document.getElementById('showwait').style.display = 'none';
}

function showWaitMono() {
	if(!ctx) return;
	document.getElementById('showwait').style.display = 'block';
	window.setTimeout(monoKreuz, 300);
}

function monoKreuz() {
	if(!ismonochrom) {
		document.getElementById('fc_image').style.display = 'none';
		document.getElementById('fc_image_scheinfenster').style.display = 'none';
		var newCanvas = document.createElement('canvas');
		newCanvas.id = 'fc_image_canvas2';
		newCanvas.width = theImage.width+20;
		newCanvas.height = Math.floor(theImage.height/2)+1;
		document.getElementById('display_foto').insertBefore(newCanvas, document.getElementById('fc_image_canvas'));
		var canvas = document.getElementById('fc_image_canvas2');  
		ctx2 = canvas.getContext('2d');
		ctx2.drawImage(document.getElementById('fc_image_canvas'), 0, 0, Math.floor(theImage.width/2), Math.floor(theImage.height/2) );
		ctx2.drawImage(document.getElementById('fc_image_canvas'), Math.floor(theImage.width/2)+20, 0, Math.floor(theImage.width/2), Math.floor(theImage.height/2));
		var theImageData = ctx2.getImageData(0, 0, Math.floor(theImage.width/2), Math.floor(theImage.height/2));
		var pixels = theImageData.data;
		
		for (var i = 0, n = pixels.length; i < n; i += 4) {
			var theGray = Math.floor((pixels[i+1]+pixels[i+2])/2);
			pixels[i] = theGray;
			pixels[i+1] = theGray;
			pixels[i+2] = theGray;
		}
		ctx2.putImageData(theImageData, 0, 0);
		delete theImageData;
		theImageData = null;

		theImageData = ctx2.getImageData(Math.floor(theImage.width/2)+20, 0, Math.floor(theImage.width/2), Math.floor(theImage.height/2));
		pixels = theImageData.data;
		
		for (var i = 0, n = pixels.length; i < n; i += 4) {
			pixels[i+1] = pixels[i];
			pixels[i+2] = pixels[i];
		}
		ctx2.putImageData(theImageData, Math.floor(theImage.width/2)+20, 0);
		delete theImageData;
		theImageData = null;
		ismonochrom = true;
		document.getElementById('fc_image_monokreuz').value = 'Original';
	} else {
		var CanvasToDelete = document.getElementById('fc_image_canvas2');
		CanvasToDelete.parentNode.removeChild(CanvasToDelete);
		document.getElementById('fc_image').style.display = '';
		document.getElementById('fc_image_scheinfenster').style.display = '';
		ismonochrom = false;
		document.getElementById('fc_image_monokreuz').value = 'Monochrom Kreuzblick';
	}
	document.getElementById('showwait').style.display = 'none';
}

function scheinFenster() {
	if(!ctx) return;
	if(sfIsOriginal=='original') {
		document.getElementById('fc_image').style.display = 'none';
		document.getElementById('fc_image_monokreuz').style.display = 'none';
		document.getElementById('fc_image_canvas').style.display = '';
		var theButton = document.createElement('input');
		theButton.id = 'fc_image_ziehen';
		theButton.type = 'button';
		theButton.value = 'Scheinfenster ziehen';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_ziehen').addEventListener('click', sfZiehen, false);

		theButton = document.createElement('input');
		theButton.id = 'fc_image_druecken';
		theButton.type = 'button';
		theButton.value = 'Scheinfenster druecken';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_druecken').addEventListener('click', sfDruecken, false);
		
		theButton = document.createElement('input');
		theButton.id = 'fc_image_reset';
		theButton.type = 'button';
		theButton.value = 'Reset';
		theLinkContainer.appendChild(theButton);
		document.getElementById('fc_image_reset').addEventListener('click', sfReset, false);

		sfDrawLines();
		
		document.getElementById('fc_image_scheinfenster').value = 'Anwenden';
		sfIsOriginal = 'verschoben';
	} else {
		if(sfIsOriginal == 'verschoben') {
			ctx.drawImage(theImage, 0, 0);
			document.getElementById('showwait').style.display = '';
			window.setTimeout(redrawAnaglyph, 300);
		} else {
			// neuanaglyph (Button Original gedrueckt)
			document.getElementById('fc_image_scheinfenster').value = 'Scheinfenster';
			document.getElementById('fc_image').style.display = '';
			document.getElementById('fc_image_monokreuz').style.display = '';
			document.getElementById('fc_image_canvas').style.display = 'none';
			document.getElementById('fc_image_canvas2').parentNode.removeChild(document.getElementById('fc_image_canvas2'));
			sfIsOriginal = 'original';
		}
	}
}

function sfZiehen() {
	sfOffset--;
	ctx.drawImage(theImage, 0, 0);
	sfDrawLines();
}

function sfDruecken() {
	sfOffset++;
	ctx.drawImage(theImage, 0, 0);
	sfDrawLines();
}

function sfReset() {
	sfOffset = 0;
	ctx.drawImage(theImage, 0, 0);
	sfDrawLines();
}

function sfDrawLines() {
	if(sfOffset>=0) {
		// linker Rand
		ctx.beginPath();
		ctx.moveTo(sfOffset, 0);
		ctx.lineTo(sfOffset, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
	}
	if(sfOffset<=0) {
		// rechter Rand
		ctx.beginPath();
		ctx.moveTo(theImage.width+sfOffset, 0);
		ctx.lineTo(theImage.width+sfOffset, theImage.height);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
		ctx.stroke();
	}
	document.getElementById('fc_image_sfOffset').textContent = sfOffset.toString();
}

function redrawAnaglyph() {
	// Scheinfensterverschiebung anwenden
	if(sfOffset!=0) {
		var newCanvas = document.createElement('canvas');
		newCanvas.id = 'fc_image_canvas2';
		newCanvas.width = theImage.width*2;
		newCanvas.height = theImage.height;
		document.getElementById('display_foto').insertBefore(newCanvas, document.getElementById('fc_image_canvas'));
		var canvas = document.getElementById('fc_image_canvas2');  
		ctx2 = canvas.getContext('2d');
		if(sfOffset<0) {
			ctx2.drawImage(document.getElementById('fc_image_canvas'), theImage.width, 0); // rechts
			ctx2.drawImage(document.getElementById('fc_image_canvas'), sfOffset, 0); // links
			var theImageData_links = ctx2.getImageData(0, 0, theImage.width+sfOffset, theImage.height);
			var theImageData_rechts = ctx2.getImageData(theImage.width, 0, theImage.width+sfOffset, theImage.height);
		} else {
			ctx2.drawImage(document.getElementById('fc_image_canvas'), theImage.width+sfOffset, 0); // rechts
			ctx2.drawImage(document.getElementById('fc_image_canvas'), sfOffset, 0); // links
			var theImageData_links = ctx2.getImageData(sfOffset, 0, theImage.width-2*sfOffset, theImage.height);
			var theImageData_rechts = ctx2.getImageData(theImage.width+2*sfOffset, 0, theImage.width-2*sfOffset, theImage.height);
		}
		var pixels_links = theImageData_links.data;
		var pixels_rechts = theImageData_rechts.data;
		
		for (var i = 0, n = pixels_links.length; i < n; i += 4) {
			pixels_links[i] = pixels_links[i]; // rot vom linken Bild, blau und gruen vom rechten
			pixels_links[i+1] = pixels_rechts[i+1];
			pixels_links[i+2] = pixels_rechts[i+2];
		}
		// Draw the ImageData at the given (x,y) coordinates.
		ctx2.putImageData(theImageData_links, 0, 0);
		ctx2.putImageData(theImageData_rechts, theImage.width, 0);
		delete theImageData_links;
		theImageData_links = null;
		delete theImageData_rechts;
		theImageData_rechts = null;

		// Rechtes Teilbild komplett zuruecksetzen
		if(sfOffset<0) {
			theImageData_rechts = ctx2.getImageData(theImage.width+sfOffset, 0, theImage.width-sfOffset, theImage.height);
		} else {
			theImageData_rechts = ctx2.getImageData(theImage.width-2*sfOffset, 0, theImage.width+2*sfOffset, theImage.height);
		}
		pixels_rechts = theImageData_rechts.data;
		for (var i = 0, n = pixels_rechts.length; i < n; i += 4) {
			pixels_rechts[i] = 34;
			pixels_rechts[i+1] = 34;
			pixels_rechts[i+2] = 34;
		}
		ctx2.putImageData(theImageData_rechts, theImage.width+(sfOffset<0?sfOffset:-2*sfOffset), 0);
		delete theImageData_rechts;
		theImageData_rechts = null;

		document.getElementById('showwait').style.display = 'none';
		sfIsOriginal = 'neuanaglyph';
		sfRemoveButtons();
		document.getElementById('fc_image_scheinfenster').value = 'Original';
		document.getElementById('fc_image').style.display = 'none';
		document.getElementById('fc_image_monokreuz').style.display = 'none';
		document.getElementById('fc_image_canvas').style.display = 'none';
	} else {
		document.getElementById('showwait').style.display = 'none';
		sfIsOriginal = 'original';
		sfRemoveButtons();
		document.getElementById('fc_image_scheinfenster').value = 'Scheinfenster';
		document.getElementById('fc_image').style.display = '';
		document.getElementById('fc_image_monokreuz').style.display = '';
		document.getElementById('fc_image_canvas').style.display = 'none';
	}
}

function sfRemoveButtons() {
	document.getElementById('fc_image_scheinfenster').value = 'Scheinfenster';
	var theButton = document.getElementById('fc_image_ziehen');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_druecken');
	theLinkContainer.removeChild(theButton);
	theButton = document.getElementById('fc_image_reset');
	theLinkContainer.removeChild(theButton);
	document.getElementById('fc_image').style.display = '';
	document.getElementById('fc_image_monokreuz').style.display = '';
	document.getElementById('fc_image_canvas').style.display = 'none';
}

function addGlobalStyle(css) {
	if(typeof GM_addStyle=='function') {GM_addStyle(css);return}
    var theStyle = document.createElement('style');
	theStyle.setAttribute('type', 'text/css');
	theStyle.innerText=css;
    var theHead = document.getElementsByTagName('head')[0];
	theHead.appendChild(theStyle);
}