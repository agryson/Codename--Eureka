//TODO: clean up variable names, remove mPanTrack value when testing is done?
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing
var mPanCanvas, mPanLoc, radarCanvas, mPanel, radar, radarLoc, radarRad;                  //General canvas page vars
var map, zoomMap, tile, retX, retY, animate, radLimit;                          //hold info for various bits and bobs
var upY, downY, leftX, rightX;                                                  //movement vars
var mouseX, mouseY, mPanTrack;                                                             //mouse trackers for main panel

/*Set up any global stuff that won't ever change after page load*/
function init() {
    /*get the topmost canvases that we'll need*/
    mPanCanvas = document.getElementById('mPanOverlay');
    radarCanvas = document.getElementById('mapOverlay');
    
    /*get all the canvas contexts*/
    mPanel = document.getElementById('mainPanel').getContext('2d');
    mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    radar = document.getElementById('map').getContext('2d');
    radarLoc = document.getElementById('mapOverlay').getContext('2d');

    /*create the zoomed map grid references for use later*/ 
    zoomMap =new Array(10);
    zoomMap = [
    [3,10],
    [2,11],
    [1,12],
    [1,12],
    [0,13],
    [0,13],
    [1,12],
    [2,11],
    [2,11],
    [4,9]
    ];
    
    /*set any initial values we will need*/
    retX = retY = radarRad = 100;
    animate=0;
    radLimit=radarRad-5;
    
    /*create the game's map*/
    map = new Array(200);
    createMap();
    
    /*draw the radar background once on load*/
    drawRadar();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is
    tile.onload = function() {                                                  //for some reason I need this to be an anonymous function... why?
        drawZoomMap();                                                          //draw the zoomMap
    };
    
    document.onkeydown = keydown;                                               //keyboard listener
    
    /*
    * Event listeners track the mouse movements. 
    * N.B.: You need to track on the topmost layer!!!
    */
    mPanCanvas.addEventListener('mousemove', function(evt){
        getMousePos(mPanCanvas, evt);
    }, false);
    radarCanvas.addEventListener('mousemove', function(evt){
        getMousePos(radarCanvas, evt);
    }, false);
    
    drawLoc();
    mainLoop();
}

/*the main game loop*/
function mainLoop() {
    if (animate==1){        //the value here tells us how many frames to play (0 = 1 frame)
       animate = 0;
    } else {
        animate +=1;
    }
    drawZoomMap();
    setTimeout(mainLoop, 200); //set the framerate here
}

/*detect when the up key is pressed*/
function keydown(e) {
    switch(e.keyCode) {
        case 38:
            move('up');
            break;
        case 40:
            move('down');
            break;         
        case 37:
            move('left');
            break;         
        case 39:
            move('right');
            break;  
        default:
            console.log("Uhm... that key doesn't do anything... ");
          break;
    }
    drawLoc();
}

/*Reads the mouse position*/
function getMousePos(canvas, evt){
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    
    while (obj && obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
        
    }
    
    // return relative mouse position
    mouseX = evt.clientX - left + window.pageXOffset;
    mouseY = evt.clientY - top + window.pageYOffset;
    drawmPanLoc();
    return {
        x: mouseX,
        y: mouseY
    };
    
}

/*shifts our reference reticule (if possible), then redraws the map*/
function move(dir) {
    upY = retY-2;
    downY = retY+2;
    leftX = retX-2;
    rightX = retX+2;
    switch(dir) {
        case 'up':
            if(radius(retX,upY)<radLimit) {
                retY = upY;
            }
            break;         
        case 'down':
            if(radius(retX,downY)<radLimit) {
                retY = downY;
            }
            break;         
        case 'left':
            if(radius(leftX,retY)<radLimit) {
                retX = leftX;
            }
            break;          
        case 'right':
            if(radius(rightX,retY)<radLimit) {
                retX = rightX;
            }
            break;         
        default:
            break;
    }
    drawZoomMap();
    drawLoc();
}

/*this function is just a placeholder to give us a background on the elements so we can see placement*/
function drawRadar() {
    radar.beginPath();
    radar.arc(radarRad,radarRad,radarRad,0,Math.PI*2,true);
    radar.fillStyle= "#000";
    radar.fill();
}

/*accepts the type of tile to draw, the x column number and the y column number, then draws it*/
function drawTile(tileType, tilePosX, tilePosY) {
    var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight; //Canvas vars
    sourceWidth = 346;                                                          //original tile width
    sourceHeight = 400;                                                         //original tile height
    destinationWidth = 70;                                                      //tile width on zoomMap... If I want 13 tiles across... for s=35
    destinationHeight = 61;                                                     //tile height on zoomMap                                                 
    sourceX = animate*346;
    sourceY = tileType*400;
    destinationX = Math.floor(tilePosX*(destinationWidth/2));                   //shift the tile horizontally by half
    if (tilePosX%2 !== 0) {                                                     //if the column is odd...
        destinationY = Math.floor((tilePosY+1)*(destinationHeight*0.75));       //we need to displace it vertically
    } else {                                                                    //if it’s even though

        destinationY = Math.floor(tilePosY*destinationHeight+destinationHeight/2);//we just set the vertical displace normally
    }

    mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
              destinationX, destinationY, destinationWidth, destinationHeight); 
}

/*creates the map*/
function createMap() {
	var x;
	var y;
	for(y=0;y<radarRad*2;y++) {
		map[y]=new Array(radarRad*2);                                                  //create an array to hold the x cell, we now have a 200x200 2d array
		for(x=0; x<radarRad*2; x++) {
            map[y][x]=new Array(2);                                             //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when i set tiles as objects
			if(radius(x,y)<=radarRad) {                                              //check the radius, mark true if it's mapped, mark false if it's not in the circle
				map[y][x][0]=true;                                              //invert axes because referencing the array is not like referencing a graph
				map[y][x][1]=randTile();                                        //if we're in the circle, assign a tile value
			}else{
				map[y][x][0]=false;
			}
		}
	}
}

/*returns the distance of the given point from the centrepoint*/
function radius(xVal,yVal) {
    return Math.sqrt((xVal-radarRad)*(xVal-radarRad)+(yVal-radarRad)*(yVal-radarRad));
}

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile*/
function drawZoomMap() {
    var j,k,end;
    for(j=0;j<zoomMap.length;j++) {
        k=zoomMap[j][0];
        end=zoomMap[j][1];
        while (k<end) {
            drawTile(map[(retY+j-5)][(retX+k-6)][1],k,j);
            k++;
        }
    }
}

/*This function just generates random tiles for us to test performance*/
function randTile() {
    return Math.floor(Math.random()*2);
}

/*draws the current location on the small radar map*/
function drawLoc() {   
    radarLoc.clearRect(0,0,radarRad*2,radarRad*2);
    radarLoc.beginPath();
    radarLoc.arc(retX,retY,7,0,Math.PI*2,true);
    radarLoc.fillStyle= "#FFF";
    radarLoc.fill();
    radarLoc.closePath();
}

/*Draws a spot under the mouse pointer when on the main map, we'll later replace
this with code to highlight the selected hexagon*/
function drawmPanLoc() {
    mPanLoc.clearRect(0,0,700,700);
    if (mPanTrack === true) {
        mPanLoc.beginPath();
        mPanLoc.arc(mouseX,mouseY,7,0,Math.PI*2,true);
        mPanLoc.fillStyle= "#FFF";
        mPanLoc.fill();
        mPanLoc.closePath();
    }
}

/*When the radar is clicked, moves the map to that location*/
function jump() {    
    if (radius(mouseX,mouseY) < radLimit) {
        retX = mouseX;
        retY = mouseY;
        drawLoc();
    }
}