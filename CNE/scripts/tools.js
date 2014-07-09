"use strict";
/**
* Moduled namespace wrapper for all of the general use tools like random number generators,
* basic DOM manipulation etc.
* @namespace Tools
*/
var Tools = (function(){
	/**
	* For a provided array, will return an array fo the max and min values
	* @param {array} arrayIn Array to find the max/min values of
	* @returns {array} The max/min values <tt>[max,min]</tt> 
	*/
	function getMaxMin(arrayIn){
	    var max = 0;
	    var min = 1000000;
	    var maxTest, minTest;
	    for(var i = 0; i < arrayIn.length; i++){
	        maxTest = Math.max.apply(null,arrayIn[i]);
	        minTest = Math.min.apply(null,arrayIn[i]);
	        if(maxTest > max){max = maxTest;}
	        if(minTest < min){min = minTest;}
	        if(min < 0){min = 0;}
	    }
	    max = Math.ceil(1 + max/50) * 50;
	    min = Math.floor(min/50) * 50;
	    return [max, min];
	}
	
	/**
	* Given a container element, will unhook all of the child elements (Chrome should 
	* then remove the orphaned click listeners during garbage collection), thus 
	* "flushing" the container
	* @memberOf Tools
	* @param {HTMLElement} elem Element to flush out
	* @todo Confirm that Chrome removes orphaned click listeners
	*/
	function flush(elem){
	    //afaik, chrome will remove orphaned event listeners
	    while (elem.lastChild) {
	        elem.removeChild(elem.firstChild);
	    }
	}

	/**
	 * Generates a random number from minimum to minimum + range-1
	 * @memberOf Tools
	 * @param  {int} range The range of values to generate (i.e. '6' gives values from 0 to 5)
	 * @param  {int} [base] A base modifier (i.e. '(6,2)' gives values from 2 to 7)
	 * @param {bool} [seeded] Whether the generated number should use the game's seed or not
	 * @return {int} The generated random number
	 */
	function randomGenerator(range, base, seeded) {
		var min = base || 0;
		var randomNumber;
		seeded ? randomNumber = Conf.rng.random() : randomNumber = Math.random();
	    return Math.floor(randomNumber * range) + min;
	}

	/**
	 * Returns the distance between two points
	 * @memberOf Tools
	 * @param  {int} x1 First point's X coordinate
	 * @param  {int} y1 First point's Y coordinate 
	 * @param  {int} x2 Second point's X coordinate
	 * @param  {int} y2 Second point's Y coordinate
	 * @return {float} The distance (in same units as provided)
	 */
	function distance(x1, y1, x2, y2) {
	    return Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
	}

	/**
	 * Random walk function for "clumpy" randomness. Will generate a number that 
	 * oscillates around 0. for 'turn left, turn right, go straight'
	 * @memberOf Tools
	 * @return {int}
	 * @todo This is actually never used, but may come in handy. Candidate for removal?
	 */
	function randomWalk() {
	    var walk = Math.floor(Math.random() * 3);
	    switch(walk) {
	    case 0:
	        return -1;
	    case 1:
	        return 0;
	    case 2:
	        return 1;
	    default:
	        break;
	    }
	}

	/**
	* Inserts the provided string into the provided index.
	* @memberOf Tools
	* @param {int} index Index at which to insert the string
	* @param {string} string The string to insert
	* @returns {string} Modified string
	*/
	String.prototype.insert = function(index, string) {
    	if(index > 0) {
    		return this.slice(0, index) + string + this.slice(index);
    	} else{
    		return string + this;
    	}
	}

	return {
		getMaxMin: getMaxMin,
		flush: flush,
		randomGenerator: randomGenerator,
		distance: distance,
		randomWalk: randomWalk
	}
})();