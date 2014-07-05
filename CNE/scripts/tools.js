/**
* Moduled namespace wrapper for all of the general use tools like random number generators,
* basic DOM manipulation etc.
* @namespace Tools
*/
var Tools = (function(){
	var toolbox = {
		/**
		* Given a container element, will unhook all of the child elements (Chrome should 
		* then remove the orphaned click listeners during garbage collection), thus 
		* "flushing" the container
		* @memberOf Tools
		* @param {HTMLElement} elem Element to flush out
		* @todo Confirm that Chrome removes orphaned click listeners
		*/
		flush: function(elem){
		    //afaik, chrome will remove orphaned event listeners
		    while (elem.lastChild) {
		        elem.removeChild(elem.firstChild);
		    }
		},

		/**
		 * Generates a random number from minimum to minimum + range-1
		 * @memberOf Tools
		 * @param  {int} range The range of values to generate (i.e. '6' gives values from 0 to 5)
		 * @param  {int} [base] A base modifier (i.e. '(6,2)' gives values from 2 to 7)
		 * @param {bool} [seeded] Whether the generated number should use the game's seed or not
		 * @return {int} The generated random number
		 */
		randomGenerator: function(range, base, seeded) {
			var min = base || 0;
			var randomNumber;
			seeded ? randomNumber = Conf.rng.random() : randomNumber = Math.random();
		    return Math.floor(randomNumber * range) + min;
		},

		/**
		 * Returns the distance between two points
		 * @memberOf Tools
		 * @param  {int} x1 First point's X coordinate
		 * @param  {int} y1 First point's Y coordinate 
		 * @param  {int} x2 Second point's X coordinate
		 * @param  {int} y2 Second point's Y coordinate
		 * @return {float} The distance (in same units as provided)
		 */
		distance: function(x1, y1, x2, y2) {
		    return Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
		},

		/**
		 * Random walk function for "clumpy" randomness. Will generate a number that 
		 * oscillates around 0. for 'turn left, turn right, go straight'
		 * @memberOf Tools
		 * @return {int}
		 * @todo This is actually never used, but may come in handy. Candidate for removal?
		 */
		randomWalk: function() {
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
		},

		/**
		* Inserts the provided string into the provided index. This protoypes 
		* <tt>String</tt>, so prefixing with <tt>Tools.</tt> is unnessecary?
		* @memberOf Tools
		* @method
		* @param {int} index Index at which to insert the string
		* @param {string} string The string to insert
		* @returns {string} Modified string
		* @todo Figure out how to protoype properly in a module, this works, but
		* I don't know how...
		*/
		insert : String.prototype.insert = function(index, string) {
			console.log();
	    	if(index > 0) {
	    		return this.slice(0, index) + string + this.slice(index);
	    	} else{
	    		return string + this;
	    	}
		}
	}

	return toolbox;
})();