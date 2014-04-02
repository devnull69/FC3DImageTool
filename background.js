	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		var url = request.src;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET",url,false);
		xmlhttp.overrideMimeType('text/plain; charset=x-user-defined');
		xmlhttp.send();
		var data = '';
		for ( var i = 0; i < xmlhttp.responseText.length; i++ ) data += String.fromCharCode( ( xmlhttp.responseText[ i ].charCodeAt(0) & 0xff ) );
		// Convert raw data to base64
		data = btoa( data );
		sendResponse({base64src: 'data:image/jpg;base64,'+data});
	});
