window.addEventListener("message", function(event) {
	TestResults.addToList(event.data);
});

/**
* Wrapper for any functions pertaining to the test results pane
* @namespace
*/
var TestResults = (function(){
	/**
	* Parses the type of message from the text preceding $, 
	* then logs appropriate html to the window
	* @public
	* @memberOf TestResults
	* @param {string} message The raw message from the event listener of the form type$description$value e.g. test$fail$function
	*/
	function addToList(message){
		var input = message.split('$');
		var output = "";
		switch(input[0]){
			case 'clear':
				document.body.innerHTML = "";
				break;
			case 'title':
				output = "<h2>" + input[1] + "</h2>";
				break;
			case 'time':
				output = "<h4>" + input[1] + "</h4><hr>";
				break;
			case 'group':
				output = "<h3>" + input[1] + "</h3>";
				break;
			case 'test':
				output = "<span class='" + input[2] + "'>" + input[1] + "</span><br>";
				break;
			case 'lastTest':
				output = "<span class='" + input[2] + "'>" + input[1] + "</span><hr>";
				break;
			default:
				output = "<br>";
		}
			document.body.innerHTML += output;
	}

	return {
		addToList: addToList
	}
})();