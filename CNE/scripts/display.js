"use strict";
/**
* Namespace wrapper for the display.
* @namespace
*/
var Display = (function(){
	/**
	* Sets the map's zoom to provided zoom level
	* @public
	* @memberOf Display
	* @param {int} zoomLevel The level of zoom that's needed
	*/
	function zoom(zoomLevel) {
	    Conf.destinationWidth = zoomLevel * 6 * 6;
	    Conf.destinationHeight = zoomLevel * 7 * 6;
	    Display.resizeMap();
	}

	/**
	* Draws all graphs and charts for the statistics panel
	* @public
	* @memberOf Display
	* @param {string} type The type of chart. Valid values are <tt>line</tt>, <tt>pie</tt> & <tt>bar</tt>
	* @param {string} outputId The id of the canvas to draw to
	* @param {array} sourceData The array of data to plot
	* @param {bool} [from0] If true, forces y-axis to start from 0 rather than adapting to the data given
	* @todo This should be generalized and then moved into tools.js
	*/
	function drawGraph(type, outputId, sourceData, from0) {
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
	}

	/**
	 * Draws the radar properly
	 * @public
	 * @memberOf Display
	 */
	function drawRadar() {
	    Conf.radar.clearRect(0, 0, Conf.radarRad * 2, Conf.radarRad * 2);
	    var radarPixels = Conf.radar.createImageData(Conf.radarRad * 2, Conf.radarRad * 2);
	    var options = ["aluminiumRadarOpt","calciumRadarOpt","copperRadarOpt","goldRadarOpt","ironRadarOpt","leadRadarOpt","magnesiumRadarOpt","mercuryRadarOpt","phosphorousRadarOpt","potassiumRadarOpt","silverRadarOpt","sodiumRadarOpt","tinRadarOpt","zincRadarOpt"];
	    var surfaceColor = [
	        [212, 197, 174, 255],
	        [201, 179, 165, 255],
	        [211, 206, 203, 255],
	        [0, 132, 0, 255],
	        [108, 168, 204, 255]
	    ]; //rgba of terrain 0,1,2,3,4
	    var ugColor = [
	        [112, 97, 74, 255],
	        [101, 79, 65, 255],
	        [111, 106, 103, 255],
	        [0, 32, 0, 255],
	        [8, 68, 104, 255]
	    ]; //rgba of terrain 0,1,2,3,4
	    var other = [0, 180, 0, 255];

	    for(var x = 0; x < radarPixels.width; x++) {
	        for(var y = 0; y < radarPixels.height; y++) {
	            // Index of the pixel in the array
	            var idx = (x + y * radarPixels.width) * 4;
	            var kind = Conf.map[Conf.level][y][x].kind;
	            var resourceOnTile = Conf.map[Conf.level][y][x].resources;
	            //TODO: Clean up this awful for!
	            for(var i = 0; i < 4; i++) {
	                if(kind < 4 && kind >= 0) {
	                    radarPixels.data[idx + i] = surfaceColor[kind][i];
	                } else if(kind < 13 && kind >= 9){
	                    radarPixels.data[idx + i] = surfaceColor[kind - 9][i];
	                }else if(kind > 4 && kind < 8) {
	                    radarPixels.data[idx + i] = ugColor[kind - 5][i];
	                } else if(kind > 13 && kind < 17) {
	                    radarPixels.data[idx + i] = ugColor[kind - 14][i];
	                } else if(kind === 4) {
	                    Conf.level !== 0 ? radarPixels.data[idx + i] = ugColor[4][i] : radarPixels.data[idx + i] = surfaceColor[4][i];
	                } else {
	                    radarPixels.data[idx + i] = other[i];
	                }
	                for(var j = 0; j < options.length; j++){
	                    if(Conf.map[Conf.level][y][x].mineable && document.getElementById(options[j]).checked){
	                        var ore = CneTools.Resources.reference(j, 0);
	                        for(var k = 0; k < ore.length; k++){
	                            if(resourceOnTile[ore[k]]){
	                                radarPixels.data[idx + i] = other[i];
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }
	    Conf.radar.putImageData(radarPixels, 0, 0);
	    for(var tower = 0; tower < Conf.commTowers.length; tower++){
	        var radius = 75 - Conf.level*10;
	        var thisTower = Conf.mapTiles[0][Conf.commTowers[tower][1]][Conf.commTowers[tower][0]].kind;
	        if(thisTower === 210 || thisTower === 237){
	            radius -= 25;
	        }
	        Conf.radar.beginPath();
	        Conf.radar.strokeStyle = '#BD222A';
	        Conf.radar.lineWidth = 0.3;
	        Conf.radar.arc(Conf.commTowers[tower][0], Conf.commTowers[tower][1], radius, 0, Math.PI*2, true);
	        Conf.radar.stroke();
	        Conf.radar.closePath();
	    }
	    Conf.level === 0 ? Conf.radar.fillStyle = "#000000" : Conf.radar.fillStyle = "#ffffff";
	    Conf.radar.font = "14px Arial";
	    Conf.radar.fillText('Depth: ' + Conf.level * 50 + 'm', 215, 298);
	}



	/**
	 * Accepts the kind of tile to draw, the x column number and the y column number, then draws it
	 * @public
	 * @memberOf Display
	 * @param {int} tileType  Type of tile to draw
	 * @param {int} tilePosX  Tile's x coordinate
	 * @param {int} tilePosY  Tile's y coordinate
	 * @param {Object} source The image object to get sprite from.(Probably {@link Conf#tileHighlight} or {@link Conf#spritesheet})
	 * @param {Object} destination The canvas context to draw the images to
	 * @param {bool} animateIt Whether or not the sprite is animated
	 * @param {int} modX From 0, move to the modXth sprite
	 * @param {int} modY From 0, move to the modYth sprite
	 * @todo This could be simplified a lot and made to have optional arguments
	 */
	function drawTile(tileType, tilePosX, tilePosY, source, destination, animateIt, modX, modY) {
	    var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY; //Canvas vars
	    sourceWidth = 216; //original tile width
	    sourceHeight = 252; //original tile height
	    destinationY = Math.floor(tilePosY * Conf.destinationWidth * 0.86); //shift it, the number here is a constant that depends on the hexagon deformation
	    if(tilePosY % 2 === 0) { //if the row is even...
	        destinationX = Math.floor(tilePosX * Conf.destinationWidth - Conf.destinationWidth / 2); //we set its X normally
	    } else { //if it’s odd though
	        destinationX = Math.floor(tilePosX * Conf.destinationWidth); //we need a little bit of displacement
	    }
	    animateIt ? sourceX = Conf.animate * sourceWidth : sourceX = 0;
	    sourceX += sourceWidth * modX;
	    sourceY = (tileType * sourceHeight) + (sourceHeight * modY);
	    destination.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, Conf.destinationWidth, Conf.destinationHeight);
	}




	/**
	 * Draws the tiles, looping through the zoomMap's grid and placing the 
	 * appropriate tile with respect to the reticule
	 * @public
	 * @memberOf Display
	 */
	function drawMap() {
	    var y, x, tileKind;
	    Logic.main();
	    requestAnimationFrame(Display.drawMap);
	    Conf.mPanLoc.clearRect(0, 0, Conf.mPanCanvas.width, Conf.mPanCanvas.height);
	    if(Conf.highlight) {
	        Display.drawTile(0, CneTools.getTile('x'), CneTools.getTile('y'), Conf.tileHighlight, Conf.mPanLoc, false, 0, 0);
	    }
	    for(y = 0; y < Conf.yLimit; y++) {
	        x = 0;
	        while(x <= Conf.xLimit) {
	            if(typeof Conf.mapTiles[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind === "number"){
	                tileKind = Conf.mapTiles[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind;
	            } else {
	                tileKind = Conf.map[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind;
	            }

	            if(tileKind < 100) {
	                Display.drawTile(tileKind, x, y, Conf.spritesheet, Conf.mPanel, false, 10, 3);
	            } else if(tileKind >= 200) {
	                Display.drawTile(tileKind - 200, x, y, Conf.spritesheet, Conf.mPanel, false, 0, 4);
	            } else {
	                Display.drawTile(tileKind - 100, x, y, Conf.spritesheet, Conf.mPanel, true, 0, 0);
	            }
	            x++;
	        }
	    }
	}



	/**
	 * Draws the current location on the small radar map
	 * @public
	 * @memberOf Display
	 */
	function drawReticule() {
	    Conf.radarLoc.clearRect(0, 0, Conf.radarRad * 2, Conf.radarRad * 2);
	    Conf.radarLoc.beginPath();
	    Conf.radarLoc.fillRect(Conf.retX - (Conf.xLimit / 2), Conf.retY - (Conf.yLimit / 2), Conf.xLimit, Conf.yLimit);
	    Conf.radarLoc.fillStyle = 'rgba(255,251,229,0.3)';
	    Conf.radarLoc.fill();
	    Conf.radarLoc.closePath();
	    Conf.radarLoc.beginPath();
	    Conf.radarLoc.strokeRect(Conf.retX - (Conf.xLimit / 2), Conf.retY - (Conf.yLimit / 2), Conf.xLimit, Conf.yLimit);
	    Conf.radarLoc.strokeStyle = '#BD222A';
	    Conf.radarLoc.stroke();
	    Conf.radarLoc.closePath();
	}

	/**
	* Fits the map to the screen
	* @public
	* @memberOf Display
	* @param {bool} [bool] Has the window been resized or not
	*/
	function resizeMap(bool) {
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
	    Display.drawTile(0, CneTools.getTile('x'), CneTools.getTile('y'), Conf.tileHighlight, Conf.mPanLoc);

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
	    Display.drawRadar();
	    Display.drawReticule();
	}

	return {
		zoom: zoom,
		drawGraph: drawGraph,
		drawRadar: drawRadar,
		drawTile: drawTile,
		drawMap: drawMap,
		drawReticule: drawReticule,
		resizeMap: resizeMap
	}
})();