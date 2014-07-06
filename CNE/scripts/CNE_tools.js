/**
* Namespace wrapper for all CNE specific tools
* @namespace
*/
var CneTools = {

	/**
	* Sets the map's zoom to provided zoom level
	* @param {int} zoomLevel The level of zoom that's needed
	*/
	zoom: function(zoomLevel) {
	    Conf.destinationWidth = zoomLevel * 6 * 6;
	    Conf.destinationHeight = zoomLevel * 7 * 6;
	    CneTools.mapFit();
	},

	/**
	* Draws all graphs and charts for the statistics panel
	* @param {string} type The type of chart. Valid values are <tt>line</tt>, <tt>pie</tt> & <tt>bar</tt>
	* @param {string} outputId The id of the canvas to draw to
	* @param {array} sourceData The array of data to plot
	* @param {bool} [from0] If true, forces y-axis to start from 0 rather than adapting to the data given
	* @todo This should be generalized and then moved into tools.js
	*/
	drawGraph: function(type, outputId, sourceData, from0) {
	    var can = document.getElementById(outputId);
	    var con = document.getElementById(outputId).getContext('2d');
	    var canW = parseInt(can.width, 10);
	    var canH = parseInt(can.height, 10);
	    con.clearRect(0, 0, canW, canH);
	    //Get our max and min values from the input data
	    var sourceClean = [];
	    for(var m = 0; m < sourceData.length; m++){
	        if(document.getElementById("10Week").checked && Conf.turn >= 10){
	            sourceClean.push(sourceData[m][0].slice(-11));
	        } else {
	            sourceClean.push(sourceData[m][0]);
	        }
	    }
	    var maxMin = Tools.getMaxMin(sourceClean);
	    var maxi = maxMin[0];
	    var mini = maxMin[1];
	    if(from0){
	        mini = 0;
	    }

	    /**
	    * Returns our highest data point so we can scale the axes
	    * @param {array} arr Data to be processed
	    * @returns {int} Index of the max data point
	    */
	    var max = function(arr) {
	            var mem = 0;
	            for(var i = 0; i < arr.length; i++) {
	                if(arr[i] > arr[mem]) {
	                    mem = i;
	                }
	            }
	            return mem;
	        };

	    /**
	    * Returns our lowest data point so we can scale the axes
	    * @param {array} arr Data to be processed
	    * @returns {int} Index of the min data point
	    */
	    var min = function(arr) {
	            var mem = 0;
	            for(var i = 0; i < arr.length; i++) {
	                if(arr[i] < arr[mem]) {
	                    mem = i;
	                }
	            }
	            return mem;
	        };



	    /**
	    * Returns data normalized to the given axis
	    * @param {int} val The index of the datapoint to normalize
	    * @param {array} arr The dataset to look in
	    * @param {int} axis The length of the axis in pixels to normalise to
	    * @returns {int} The normalized data
	    */
	    var normal = function(val, arr, axis) {
	            var out = (arr[val] - mini) / (maxi - mini);
	            return out * axis;
	        };


	    if(type === 'line'){
	        for(var n = 0; n < sourceData.length; n++){
	            var sepX = Math.floor(canW / sourceData[n][0].length);
	            var tenOnly = 0;
	            var tenLimit = sourceData[n][0].length - 1;
	            var sepY = Math.floor(canH / sourceData[max(sourceData[n][0])]);
	            if(document.getElementById("10Week").checked && Conf.turn >= 10){
	                sepX = Math.floor(canW / 10);
	                sepY = Math.floor(canH / sourceData[max(sourceData[n][0].slice(-11))]);
	                tenOnly = sourceData[n][0].length - 11;
	                tenLimit = 11;
	            }
	            var colour = sourceData[n][1];
	            //Lines
	            con.beginPath();
	            con.lineCap = 'round';
	            con.lineJoin = 'round';
	            con.moveTo(0, canH - normal(tenOnly, sourceData[n][0], canH));
	            for(var k = 1; k <= tenLimit; k++) {
	                var recent = k;
	                if(document.getElementById("10Week").checked && Conf.turn >= 10){
	                    recent = sourceData[n][0].length - (11 - k);
	                }
	                con.lineTo(k * sepX, canH - normal(recent, sourceData[n][0], canH));
	                con.arc(k * sepX, canH - normal(recent, sourceData[n][0], canH), 1, 0, Math.PI*2);
	            }
	            con.strokeStyle = '#000';
	            con.lineWidth = 3;
	            con.stroke();
	            con.strokeStyle = colour;
	            con.lineWidth = 2;
	            con.stroke();
	            con.closePath();
	        }
	        con.beginPath();
	        con.strokeStyle = 'rgba(255,255,255,0.02)';
	        con.lineWidth = 1;
	        con.lineCap = 'butt';
	        con.moveTo(5, Math.floor(canH - normal(0, [0], canH)));
	        con.lineTo(canW - 5, Math.floor(canH - normal(0, [0], canH)));
	        con.strokeStyle = 'rgba(255,255,255,0.08)';
	        for(var grad = 0; grad <= 10; grad++) {
	            con.moveTo(5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)], canH)));
	            con.lineTo(canW - 5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)], canH)));
	        }
	        con.stroke();
	        con.fillStyle = '#D9F7FF';
	        con.font = "14px Arial";
	        con.fillText(maxi, 5, 14);
	        con.fillText(mini + (maxi - mini)/2, 5, Math.floor(canH/2));
	        con.fillText(mini, 5, canH - 2);
	        con.closePath();

	    } else if(type === 'pie'){
	        var topVal = 0;
	        var topValRef;
	        var radius = Math.floor(canH / 2.1);
	        var center = [canW / 2, canH / 2];
	        var fillPie = function(start, stop, colour){
	            con.beginPath();
	            con.fillStyle = colour;
	            con.moveTo(center[0], center[1]);
	            con.arc(center[0], center[1], radius, start, stop);
	            con.lineTo(center[0], center[1]);
	            con.fill();
	            con.strokeStyle = '#222';
	            con.lineWidth = 1;
	            con.stroke();
	            con.closePath();
	        };

	        var nextStart = 0;
	        var total = 0;
	        for(var sum = 0; sum < sourceData.length; sum++){
	            total += sourceData[sum][0][sourceData[sum][0].length - 1];
	        }
	        for(var f = 0; f < sourceData.length; f++){
	            var current = sourceData[f][0][sourceData[f][0].length - 1];
	            if(current > 0){
	                fillPie(nextStart, nextStart + (Math.PI*2)*(current / total), sourceData[f][1]);
	                nextStart += (Math.PI*2)*(current / total);
	            }
	        }
	    } else if(type === 'bar') {
	        var barWidth = ((canH - 20) / sourceData.length) * 3;
	        var startX;
	        var startY;
	        for(var bar = 0; bar < sourceData.length; bar ++){
	            if(bar % 3 ===  0){
	                startX = 10;
	                startY = canH - (sourceData.length - bar)*barWidth/3 - 15;
	                if(bar > 0){
	                    startY += 5*bar/3;
	                }
	            }
	            con.fillStyle = sourceData[bar][1];
	            con.strokeStyle = '#222';
	            con.fillRect(startX/2, startY, (normal(0, sourceData[bar][0], canW))/2, barWidth);
	            con.strokeRect(startX/2, startY, (normal(0, sourceData[bar][0], canW))/2, barWidth);
	            startX += normal(0, sourceData[bar][0], canW);
	        }
	    } else {
	        console.log("Lies, lies and damned statistics" + sourceData);
	    }
	    //Legend, we only draw it once
	    if(Conf.fresh){
	        var canL = document.getElementById(outputId + 'Legend');
	        var conL = canL.getContext('2d');
	        conL.clearRect(0, 0, canW, canH);
	        var legendLeft = 15;
	        var legendTop = 5;
	        var legendBottom = 20;
	        for(var legend = 0; legend < sourceData.length; legend++){
	            conL.beginPath();
	            conL.strokeStyle = '#000';
	            conL.lineWidth = 0.5;
	            conL.fillStyle = sourceData[legend][1];
	            conL.fillRect(legendLeft, legendTop, 10, 10);
	            conL.strokeRect(legendLeft, legendTop, 10, 10);
	            legendTop += 15;
	            conL.closePath();
	            conL.beginPath();
	            conL.fillStyle = '#D9F7FF';
	            conL.font = "14px Arial";
	            conL.fillText(sourceData[legend][2], legendLeft + 20, legendTop - 5);
	            conL.closePath();
	        }
	    }
	},

	/**
	* Fits the map to the screen
	* @param {bool} [bool] Tells CneTools.mapFit(() if the window has been resized or not
	*/
	mapFit: function(bool) {
	    var quarterHeight = Math.floor(Conf.destinationHeight * 0.25);
	    if(bool) {
	        var overlay = document.getElementById('mPanOverlay');
	        var mainMap = document.getElementById('mainPanel');

	        //Nasty stuff... hence we use the if to touch this as little as possible
	        overlay.width = window.innerWidth + Conf.destinationWidth;
	        overlay.height = window.innerHeight + quarterHeight * 2;
	        overlay.style.top = -quarterHeight*2 + 'px';
	        overlay.style.left = -Conf.destinationWidth / 2 + 'px';
	        mainMap.width = window.innerWidth + Conf.destinationWidth; //Maybe avoid using screen, as we're not *certain* we'll be fullscreen, even if that's the permission we'll ask for
	        mainMap.height = window.innerHeight + quarterHeight * 2;
	        mainMap.style.top = -quarterHeight*2 + 'px';
	        mainMap.style.left = -Conf.destinationWidth / 2 + 'px';
	        document.body.style.width = window.innerWidth + 'px';
	        document.body.style.height = window.innerHeight + 'px';
	    }
	    Conf.xLimit = Math.ceil(Conf.mPanCanvas.width / Conf.destinationWidth);
	    Conf.yLimit = Math.ceil(Conf.mPanCanvas.height / (quarterHeight * 3));
	    Conf.mPanLoc.clearRect(0, 0, Conf.mPanCanvas.width, Conf.mPanCanvas.height);
	    drawTile(0, getTile('x'), getTile('y'), Conf.tileHighlight, Conf.mPanLoc);

	    //Messy stuff to handle if I try to zoom out of the map...
	    if(Conf.retY - Conf.yLimit / 2 < 0) {
	        Conf.retY = Math.floor(Conf.retY - (Conf.retY - Conf.yLimit / 2));
	    } else if(Conf.retY + Conf.yLimit / 2 > Conf.radarRad * 2) {
	        Conf.retY = Math.floor(Conf.retY - Conf.yLimit / 2);
	    }
	    if(Conf.retX - Conf.xLimit / 2 < 0) {
	        Conf.retX = Math.floor(Conf.retX - (Conf.retX - Conf.xLimit / 2));
	    } else if(Conf.retX + Conf.xLimit / 2 > Conf.radarRad * 2) {
	        Conf.retX = Math.floor(Conf.retX - Conf.xLimit / 2);
	    }
	    if(Conf.yLimit % 2 === 0) {
	        Conf.yLimit += 1;
	    }

	    Conf.yShift = Math.round(Conf.yLimit / 2);

	    if(Conf.yShift % 2 === 0) {
	        Conf.yShift += 1;
	        Conf.yLimit += 2;
	    }

	    if(Conf.retY % 2 !== 0) {
	        Conf.retY += 1;
	    }
	    drawRadar();
	    drawLoc();
	},

	/**
	 * Checks which buildings are available to the player and
	 * populates the sidebar with those buildings
	 */
	checkBuildings: function() {
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
	                    document.getElementById(Conf.buildings[thing][0]).onclick = construct;
	                } else {
	                    elem.classList.remove('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
	                }
	                break;
	            case 1:
	                if(Conf.level > 0) {
	                    elem.classList.add('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = construct;
	                } else {
	                    elem.classList.remove('active');
	                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
	                }
	                break;
	            default:
	                elem.classList.add('active');
	                document.getElementById(Conf.buildings[thing][0]).onclick = construct;
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
	},



	/**
	* Manages what robots are available for the given context in the menu
	*/
	checkRobots: function() {
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
	                    c3po.onclick = construct;
	                } else {
	                    c3po.classList.remove('active');
	                    c3po.onclick = null;
	                }
	                break;
	            case 1:
	                if(Conf.level > 0) {
	                    c3po.classList.add('active');
	                    c3po.onclick = construct;
	                } else {
	                    c3po.classList.remove('active');
	                    c3po.onclick = null;
	                }
	                break;
	            default:
	                c3po.classList.add('active');
	                c3po.onclick = construct;
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
	},



	/**
	 * Changes level from an input (slider etc.)
	 * @param  {int} newLevel the level we would change to
	 * @todo Maybe make a "navigate" namespace for radar and movement?
	 */
	changeLevel: function(newLevel) {
	    Conf.level = parseInt(newLevel, 10);
	    CneTools.checkBuildings();
	    drawRadar();
	},

	/**
	* Determines if a point is within communications range of the colony or not
	* @param {int} x X coordinate of point to test
	* @param {int} y Y coordinate of point to test
	* @returns {bool} Whether the point is in communications range or not
	*/
	inRange: function(x, y){
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
	},

	/**
	* Cross references the indexes of processed minerals to their ores
	* @param {int} ref 
	* @param {int} dir 'Direction' of the conversion: (0 processed -> ore; 1 ore -> processed
	* @returns {array} 
	* @todo dir seems redundant here, also, this should be in a "resources" namespace 
	*/
	resourceRef: function(ref,dir){
	    //dir should tell us if we're going from ore to processed or processed to ore
	    //0 is from processed to ore
	    //1 is from ore to processed
	    //ref is the reference
	    switch(ref){
	        case 0:
	            return [0,1,2];
	        case 1:
	            return [3];
	        case 2:
	            return [4,5,6];
	        case 3:
	            return [7,8];
	        case 4:
	            return [9,10,11,12];
	        case 5:
	            return [13,14];
	        case 6:
	            return [15,16];
	        case 7:
	            return [17,18];
	        case 8:
	            return [19,20];
	        case 9:
	            return [21,22];
	        case 10:
	            return [23];
	        case 11:
	            return [24,25];
	        case 12:
	            return [26,27];
	        case 13:
	            return [28,29];
	        default:
	            console.log("Whoah Timmy! You don't wanna stick that in the furnace! " + ref + " " + dir);
	    }
	},

	/**
	* Given two strings, will return a modified version (for tile references)
	* @param {string} string String to be placed at begginning of modified string
	* @param {string} orig Original string
	* @returns {string} Returns <tt>string</tt> + " #" + the first word after # in <tt>orig</tt>
	*/
	changeName: function(string, orig) {
	    return string + ' #' + orig.split('#')[1];
	},

	/**
	* Checks connectivity of the provided tile with the colony (on the current level)
	* @param {int} y Y coordinate to check
	* @param {int} x X coordinate to check
	* @returns {bool} Connected or not
	*/
	checkConnection: function(y, x) {
	    var connected = false;
	    for(var j = 0; j < 6; j++) {
	        if(Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]] && 
	           (Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 211 || 
	           Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 204)) {
	            connected = true;
	        }
	    }
	    return connected;
	}
}
