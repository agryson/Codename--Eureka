"use strict";
/**
* @public
* @memberOf CneTools
* Namespace wrapper for all CNE specific tools
* @namespace
*/
var CneTools = (function(){

	/**
	* @public
	* @memberOf CneTools
	 * Checks which buildings are available to the player and
	 * populates the sidebar with those buildings
	 */
	function checkBuildings() {
	    for(var thing = 0; thing < Conf.buildings.length; thing++) {
	        var idString = Conf.buildings[thing][0];
	        var elem = document.getElementById(idString);
	        elem.classList.remove('menu_selected');
	        if(Conf.buildings[thing][1]) {
	            elem.classList.add('menu_show');
	            elem.classList.remove('menu_hide');
	            switch(Conf.buildings[thing][2]) {
	            case 0:
	                if(Conf.level === 0) {
	                    elem.classList.add('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = Build.plan;
	                } else {
	                    elem.classList.remove('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
	                }
	                break;
	            case 1:
	                if(Conf.level > 0) {
	                    elem.classList.add('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = Build.plan;
	                } else {
	                    elem.classList.remove('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
	                }
	                break;
	            default:
	                elem.classList.add('active');
	                document.getElementById(Conf.buildings[thing][0]).onclick = Build.plan;
	            }
	        } else {
	            elem.classList.remove('menu_show');
	            elem.classList.add('menu_hide');
	            if(Conf.clickedOn === idString) {
	                Conf.clickedOn = 'none';
	                document.body.style.cursor = "url('images/pointers/pointer.png'), default";
	            }
	        }
	    }
	    CneTools.checkRobots();
	}



	/**
	* @public
	* @memberOf CneTools
	* Manages what robots are available for the given context in the menu
	*/
	function checkRobots() {
	    //TODO: clean all this shit up
	    for(var r2d2 in Conf.robotsList) {
	        var wallE = Conf.robotsList[r2d2];
	        var idString = wallE[2];
	        var c3po = document.getElementById(idString);
	        c3po.classList.remove('menu_selected');
	        if(wallE[3]) {
	            c3po.classList.add('menu_show');
	            c3po.classList.remove('menu_hide');
	            switch(wallE[4]) {
	            case 0:
	                if(Conf.level === 0) {
	                    c3po.classList.add('active');
	                    c3po.onclick = Build.plan;
	                } else {
	                    c3po.classList.remove('active');
	                    c3po.onclick = null;
	                }
	                break;
	            case 1:
	                if(Conf.level > 0) {
	                    c3po.classList.add('active');
	                    c3po.onclick = Build.plan;
	                } else {
	                    c3po.classList.remove('active');
	                    c3po.onclick = null;
	                }
	                break;
	            default:
	                c3po.classList.add('active');
	                c3po.onclick = Build.plan;
	            }
	            if(wallE[1] - wallE[0] === 0) {
	                c3po.classList.remove('active');
	                c3po.onclick = null;
	                //document.getElementById(wallE[2]).classList.add('menu_available');
	                if(Conf.clickedOn === idString) {
	                    Conf.clickedOn = 'none';
	                    //document.getElementById(wallE[2]).classList.remove('menu_available');
	                    document.body.style.cursor = "url('images/pointers/pointer.png'), default";
	                }
	            }
	        } else {
	            c3po.classList.remove('menu_show');
	            c3po.classList.add('menu_hide');
	        }
	    }
	    //special case for digger
	    if(Conf.robotsList[1][1] - Conf.robotsList[1][0] <= 1) {
	        var rob = document.getElementById(Conf.robotsList[1][2]);
	        rob.classList.remove('active');
	        rob.onclick = null;
	        //rob.style.background = '#000';
	        if(Conf.clickedOn === 'digger' || (Conf.clickedOn === 'cavernDigger' && Conf.robotsList[1][1] - Conf.robotsList[1][0] === 0)) {
	            Conf.clickedOn = 'none';
	            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
	        }
	        if(Conf.robotsList[1][1] - Conf.robotsList[1][0] === 0) {
	            var cavDig = document.getElementById('cavernDigger');
	            cavDig.classList.remove('active');
	            cavDig.onclick = null;
	            //cavDig.style.background = '#000';
	        }
	    }
	}

	/**
	* @public
	* @memberOf CneTools
	 * Changes level from an input (slider etc.)
	 * @param  {int} newLevel the level we would change to
	 * @todo Maybe make a "navigate" namespace for radar and movement?
	 */
	function changeLevel(newLevel) {
	    Conf.level = parseInt(newLevel, 10);
	    CneTools.checkBuildings();
	    Display.drawRadar();
	}

	/**
	* @public
	* @memberOf CneTools
	* Determines if a point is within communications range of the colony or not
	* @param {int} x X coordinate of point to test
	* @param {int} y Y coordinate of point to test
	* @returns {bool} Whether the point is in communications range or not
	*/
	function inRange(x, y){
	    for(var tower = 0; tower < Conf.commTowers.length; tower++){
	        var radius = 75 - Conf.level*10;
	        var thisTower = Conf.mapTiles[0][Conf.commTowers[tower][1]][Conf.commTowers[tower][0]].kind;
	        if(thisTower === 210 || thisTower === 237){
	            radius -= 25;
	        }
	        if(Tools.distance(Conf.commTowers[tower][0], Conf.commTowers[tower][1], x, y) <= radius){
	            return true;
	        }
	    }
	    return false;
	}
	
	/**
	* @public
	* @memberOf CneTools
     * Moves the map to the provided location. Defaults to the mapped 
     * coordinates of the mouse pointer
     * @param {bool} [bool] Force a jump to a particular spot (see other parameters)
     * @param {int} [x] X coordinate for where the map was clicked
     * @param {int} [y] Y coordinate for where the map was clicked
     * @param {int} [level] The level the player is on
     */
    function moveTo(bool, x, y, level) {
        if(bool){
            Conf.retX = x + 1;
            Conf.retY = y + 2;
            Conf.level = level;
        } else {
            Conf.retX = Math.floor(Conf.mouseX - Conf.destinationWidth / 2);
            Conf.retY = Conf.mouseY - 20;
        }
        Display.resizeMap();
        Display.drawReticule();
    }

	/**
	* @public
	* @memberOf CneTools
	* Given two strings, will return a modified version (for tile references)
	* @param {string} string String to be placed at begginning of modified string
	* @param {string} orig Original string
	* @returns {string} Returns <tt>string</tt> + " #" + the first word after # in <tt>orig</tt>
	*/
	function changeName(string, orig) {
	    return string + ' #' + orig.split('#')[1];
	}

	/**
	* @public
	* @memberOf CneTools
	* Checks connectivity of the provided tile with the colony (on the current level)
	* @param {int} y Y coordinate to check
	* @param {int} x X coordinate to check
	* @returns {bool} Connected or not
	*/
	function checkConnection(y, x) {
	    var connected = false;
	    for(var j = 0; j < 6; j++) {
	        if(Conf.mapTiles[Conf.level][CneTools.adjacent(x, y, j)[0]][CneTools.adjacent(x, y, j)[1]] && 
	           (Conf.mapTiles[Conf.level][CneTools.adjacent(x, y, j)[0]][CneTools.adjacent(x, y, j)[1]].kind === 211 || 
	           Conf.mapTiles[Conf.level][CneTools.adjacent(x, y, j)[0]][CneTools.adjacent(x, y, j)[1]].kind === 204)) {
	            connected = true;
	        }
	    }
	    return connected;
	}

	/**
	* @public
	* @memberOf CneTools
	 * Returns the adjacent tile reference in y and x (inverted for historical reasons)
	 * @param  {int} x X coordiante for tile we want to get the adjacent tiles for
	 * @param  {int} y Y coordiante for tile we want to get the adjacent tiles for
	 * @param  {int} index Which tile are we checking? 0 for top left then count up
	 * clockwise
	 * @return {array} The coordinates for the tile at the provided index
	 */
	function adjacent(x, y, index) {
	    if(y % 2 === 0) {
	        index += 6;
	    }
	    switch(index) {
	    case 0:
	        return [y + 1, x - 1];
	    case 1:
	    case 6:
	        return [y + 1, x];
	    case 2:
	    case 8:
	        return [y, x + 1];
	    case 3:
	    case 10:
	        return [y - 1, x];
	    case 4:
	        return [y - 1, x - 1];
	    case 5:
	    case 11:
	        return [y, x - 1];
	    case 7:
	        return [y + 1, x + 1];
	    case 9:
	        return [y - 1, x + 1];
	    default:
	        console.log('There was a problem jim, x:' + x + ' y:' + y + ' index:' + index);
	    }
	}

	/**
	* @public
	* @memberOf CneTools
	 * Checks if any adjacent tiles are wet
	 * @param  {array} yxArrayIn is an array of the y & x coordinates of the tile to test
	 * @param  {int} level provides the level to test on
	 * @return {boolean} Wet or not
	 */
	function isWet(yxArrayIn, level) {
	    var yxArray = yxArrayIn.slice(0);
	    for(var i = 0; i < 6; i++) {
	        if(Conf.map[level][CneTools.adjacent(yxArray[1], yxArray[0], i)[0]][CneTools.adjacent(yxArray[1], yxArray[0], i)[1]].kind === 4) {
	            return true;
	        }
	    }
	    return false;
	}

	/**
	* @public
	* @memberOf CneTools
	 * Gets the x or y value for the currently moused over tile
	 * @param  {string} The axis we want the coordinate of
	 * @return {int} The coordinate for desired axis
	 */
	function getTile(axis) {
	    var x, y, yDiff, xDiff, left, right;

	    //set the general cases
	    y = Math.floor(Conf.mouseY / (Conf.destinationHeight * 0.75));

	    y % 2 !== 0 ? x = Math.floor((Conf.mouseX - Conf.destinationWidth / 2) / Conf.destinationWidth) : x = Math.floor(Conf.mouseX / Conf.destinationWidth);

	    //corner case code
	    yDiff = (Conf.mouseY / (Conf.destinationHeight * 0.75)) - y;
	    if(yDiff < 0.33) { //If we're in the top third of the reference rectangle
	        //tells which intermediate block we're in...
	        if(y % 2 !== 0) {
	            xDiff = ((Conf.mouseX - Conf.destinationWidth / 2) / Conf.destinationWidth - x);
	            //I now do some basic Pythagoras theorem to figure out which hexagon I'm in
	            //Are we on the left or right hand side of the top third?
	            if(xDiff < 0.5) {
	                left = 0.5 - xDiff; //Adjust to get the opposite length of the 60° internal angle
	                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) { //I multiply by 10 so that I'm not dealing with numbers less than 1
	                    y -= 1; //change the reference appropriately
	                }
	            } else { //rinse repeat for all cases
	                right = xDiff - 0.5;
	                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
	                    y -= 1;
	                    x += 1;
	                }
	            }

	        } else {
	            xDiff = (Conf.mouseX / Conf.destinationWidth - x);
	            if(xDiff < 0.5) {
	                left = 0.5 - xDiff;
	                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
	                    y -= 1;
	                    x -= 1;
	                }
	            } else {
	                right = xDiff - 0.5;
	                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
	                    y -= 1;
	                }
	            }
	        }

	    }
	    if(axis === 'x') { //return the appropriate tile axis reference
	        return x;
	    } else {
	        return y;
	    }
	}

	/**
	* @public
	* @memberOf CneTools
	 * Gets the mouse position on the main canvas
	 * @param  {Object} canvas
	 * @param  {Event} evt
	 */
	function mouse(canvas, evt) {
	    // get canvas position
	    var obj = canvas;
	    var top = 0;
	    var left = 0;
	    while(obj && obj.tagName != 'BODY') {
	        top += obj.offsetTop - 10;
	        left += obj.offsetLeft;
	        obj = obj.offsetParent;
	    }

	    // return relative mouse position
	    Conf.mouseX = evt.clientX - left + window.pageXOffset + Conf.destinationWidth / 2;
	    Conf.mouseY = evt.clientY - top + window.pageYOffset;
	}

	/**
	* @public
	* @memberOf CneTools
	* Advances the game by a given number of turns
	* @param {int} turns Number of turns to advance by
	*/
	function advanceTurns(turns){
	    while(turns > 0){
	        if(!Conf.buildings[37][1]) {
	            var x;
	            var y;
	            Stats.setAll();
	            for(y = 0; y < Conf.radarRad * 2; y++) {
	                for(x = 0; x < Conf.radarRad * 2; x++) {
	                    for(var l = 0; l < 5; l++) {
	                        Logic.nextTurn(x, y, l);
	                    }
	                }
	            }
	            if(Conf.energy[Conf.energy.length - 1] <= 10) {
	                Terminal.print(TRANS.noPower);
	                Conf.blackout = 30;
	            }
	            Stats.sanityCheck();
	            if(turns === 1){
	                Menu.recount('all');
	                FileIO.saveGame(Conf);
	                Stats.executiveReview();
	                Research.fillPanel('overview');
	                //setResearchClickers(researchPanel);
	                Research.refreshMenu();
	                Display.drawRadar();
	                Conf.turnNum.innerHTML = TRANS.weekCounter + Conf.turn;
	                document.getElementById('consoleContent').innerHTML = '';
	                Terminal.print(TRANS.itIsNow + ' ' + TRANS.week + ' ' + Conf.turn);
	            }
	        } else {
	            Terminal.print(TRANS.setDown);
	        }
	        turns -=1;
	    }
	}

	/**
	* @public
	* @memberOf CneTools
	* Handles what needs to be done if the page is visible or not (pause music etc.)
	*/
	function pageVisHandler() {
	  if (document.webkitHidden) {
	    Music.pause();
	  } else {
	    Music.play();
	  }
	}

	return {
		checkBuildings : checkBuildings,
		checkRobots : checkRobots,
		changeLevel : changeLevel,
		inRange : inRange,
		moveTo : moveTo,
		changeName : changeName,
		checkConnection : checkConnection,
		adjacent : adjacent,
		isWet : isWet,
		getTile : getTile,
		mouse : mouse,
		advanceTurns : advanceTurns,
		pageVisHandler : pageVisHandler
	}
})();
