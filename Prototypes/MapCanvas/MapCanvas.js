//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing
var mPanCanvas, mPanLoc, radarCanvas, mPanel, radar, radarLoc;                  //General canvas page vars
var map, zoomMap, tile, tileHighlight, retX, retY, animate, radLimit, radarRad,
    clickedOn; //hold info for various bits and bobs
var upY, downY, leftX, rightX;                                                  //movement vars
var mouseX, mouseY, mPanTrack;                                                  //mouse trackers for main panel

/*Define our Constructors*/
function Terrain() {
    this.type; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared, 5=MinedOut
    this.resources; //an array that holds the different metal and resource types
}

function Building() {
    this.type; //type of building
    this.health; //health of building
    this.air; //boolean, does building have air?
    this.age;
}

/*Set up any global stuff that won't ever change after page load*/
function init() {
    /*get the topmost canvases that we'll need for mouse tracking*/
    mPanCanvas = document.getElementById('mPanOverlay');
    radarCanvas = document.getElementById('mapOverlay');
    
    /*get all the canvas contexts*/
    mPanel = document.getElementById('mainPanel').getContext('2d');
    mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    radar = document.getElementById('map').getContext('2d');
    radarLoc = document.getElementById('mapOverlay').getContext('2d');

    /*create the zoomed map grid references for use later*/ 
    zoomMap =new Array(13);
    zoomMap = [
    [3,9],
    [2,9],
    [1,11],
    [0,11],
    [1,11],
    [0,11],
    [0,12],
    [0,11],
    [1,11],
    [0,11],
    [1,11],
    [2,9],
    [3,9]
    ];
    
    /*set any initial values we will need*/
    radarRad = 150;                                                             //this is the radius of the map that we want, changing it here should change it everywhere except the html
    retX = radarRad;
    retY = radarRad;
    animate=0;
    radLimit=radarRad-8;
    
    /*create the game's map*/
    map = new Array(radarRad*2);
    createMap();
    
    /*draw the radar background once on load*/
    drawRadar();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is

    tileHighlight = new Image();                                                //create the spritesheet object for the tools png (highlights/buttons etc.)
    tileHighlight.src = 'images/tools.png';                                     //tell script where spritesheet is

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

/*returns a random number from 0 to num-1, but the minimum (and maximum) can be offset with min
Thinkof num as the modifier, min as the base
*/
function randGen(num, min){
    return Math.floor(Math.random()*num)+min;
}

/*the main game loop*/
function mainLoop() {
    if (animate==1){                                                            //number of frames = n+1
       animate = 0;
    } else {
        animate +=1;
    }
    drawZoomMap();
    setTimeout(mainLoop, 200);                                                  //set the framerate here
}

/*detect when an arrow key is pressed and move accordingly*/
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
    leftX = retX-1;
    rightX = retX+1;
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

/*a placeholder to fill in our radar*/
function drawRadar() {
    var radarPixels = radar.createImageData(radarRad*2, radarRad*2);
    
    for (var x = 0; x < radarPixels.width; x++)  {
        for (var y = 0; y < radarPixels.height; y++)  {
            if (map[y][x][0] === true) {
                // Index of the pixel in the array
                var idx = (x + y * radarPixels.width) * 4;
                var kind = map[y][x][1].type;
                switch(kind) {
                    case 0:
                        radarPixels.data[idx + 0] = 255;
                        radarPixels.data[idx + 1] = 231;
                        radarPixels.data[idx + 2] = 10;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 1:
                        radarPixels.data[idx + 0] = 8;
                        radarPixels.data[idx + 1] = 138;
                        radarPixels.data[idx + 2] = 8;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 2:
                        radarPixels.data[idx + 0] = 255-8;
                        radarPixels.data[idx + 1] = 231-138;
                        radarPixels.data[idx + 2] = 2;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    default:
                        //do nothing
                }
            }
        }
    }
    
    radar.putImageData(radarPixels, 0, 0);
}

/*accepts the type of tile to draw, the x column number and the y column number, then draws it*/
function drawTile(tileType, tilePosX, tilePosY, highlight) {
    try {
        if (tilePosX < zoomMap[tilePosY][0] || tilePosX >= zoomMap[tilePosY][1]) {
            //this if checks to make sure we requested a tile we can draw, 
            //mainly to prevent highlighting outside of the map
        } else {
            var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, 
                destinationY, destinationWidth, destinationHeight;              //Canvas vars
            sourceWidth = 346;                                                  //original tile width
            sourceHeight = 400;                                                 //original tile height
            destinationWidth = 60;                                              //tile width on zoomMap... If I want 13 tiles across... for s=35
            destinationHeight = 70;                                             //tile height on zoomMap                                                 
            destinationY = Math.floor(tilePosY*destinationWidth*0.88);          //shift it, the number here is a constant that depends ont eh hexagon deformation
                
                if (tilePosY%2 === 0) {                                         //if the row is even...
                    destinationX = Math.floor(tilePosX*destinationWidth);       //we set its X normally
                } else {                                                        //if it’s odd though
        
                    destinationX = Math.floor(tilePosX*destinationWidth + 
                                    destinationWidth/2);                        //we need a little bit of displacement
                }
                
            if (highlight === true){                                            //highlight is an optional parameter to see which canvas to draw to and how
                sourceX = 0;
                sourceY = 0;        
                mPanLoc.drawImage(tileHighlight, sourceX, sourceY, sourceWidth, 
                    sourceHeight, destinationX, destinationY, destinationWidth, 
                    destinationHeight);
            } else {
                sourceX = animate*346;
                sourceY = tileType*400;
                mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
                    destinationX, destinationY, destinationWidth, destinationHeight);
            }
        }    
    } catch(e){
        //Do Nothing, we expect this error... unfortunately
    }
}

/*creates the map*/
function createMap() {
	var x;
	var y;
	for(y=0;y<radarRad*2;y++) {
		map[y]=new Array(radarRad*2);                                           //create an array to hold the x cell, we now have a 200x200 2d array
		for(x=0; x<radarRad*2; x++) {
            map[y][x]=new Array(2);                                             //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
			if(radius(x,y)<=radarRad) {                                         //check the radius, mark true if it's mapped, mark false if it's not in the circle
				map[y][x][0]=true;                                              //invert axes because referencing the array is not like referencing a graph
				map[y][x][1]= new Terrain();                                    //if we're in the circle, assign a tile value
                map[y][x][1].type = 0;
                map[y][x][1].resources= new Array(2);                           //insert the number of resources we'll be looking for
                generateResources(x,y,0);
			}else{
				map[y][x][0]=false;
			}
		}
        
	}
    createMountains(60,600,70);
}

/*Generates the mountains, num=number of mountain spawn points, steps=length of the random walk, smoothness= how smootht he gradient should be*/
function createMountains(num, steps, smoothness) {
    var stepHolder = steps;
    for (num; num >= 0; num--) {
        var x = Math.floor(Math.random()*radarRad*2);
        var y = Math.floor(Math.random()*radarRad*2);
        steps = stepHolder;
        for (steps; steps >= 0; steps--) {
            try{
                if(map[y][x][0] === true) {
                    map[y][x][1].type=2;
                    generateResources(x,y,2);
                    x += randWalk();
                    y += randWalk();
                }
            } catch(e) { //Do Nothing
            }
        }      
    }
    smoothMountains(smoothness);
}

function smoothMountains(smoothness) {
    for (var y = 0; y < radarRad*2; y++) {
        for (var x = 0; x < radarRad*2; x++) {
            try{
                if(map[y][x][0]===true && map[y][x][1].type===2) {
                    var xTemp = x;
                    var yTemp = y;
                    for(var steps = smoothness; steps > 0; steps--){
                        if(xTemp < radarRad*2 && xTemp > 0 && yTemp > 0 && yTemp < radarRad*2 && map[yTemp][xTemp][0] === true && map[yTemp][xTemp][1].type === 0) {
                            map[yTemp][xTemp][1].type=1;
                            generateResources(xTemp,yTemp,1);
                        }
                        xTemp += randWalk();
                        yTemp += randWalk();
                    }
                }
            } catch(e){console.log('hmm... y:' + y + '  x:'+x+ e);}
        }
    }
}

/*sets the resources appropriately for the terrain type at x,y*/
function generateResources(x,y,terrain) {
    switch (terrain) {
        case 0:
            map[y][x][1].resources[0]=randGen(2,0);
            map[y][x][1].resources[1]=randGen(2,0);
            break;
        case 1:
            map[y][x][1].resources[0]=randGen(5,10);
            map[y][x][1].resources[1]=randGen(5,10);
            break;
        case 2:
            map[y][x][1].resources[0]=randGen(5,20);
            map[y][x][1].resources[1]=randGen(5,20);
            break;
        default:
            //do nothing
    }
}

/*returns the distance of the given point from the centrepoint*/
function radius(xVal,yVal) {
    return Math.sqrt((xVal-radarRad)*(xVal-radarRad)+(yVal-radarRad)*(yVal-radarRad));
}

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule*/
function drawZoomMap() {
    mPanel.clearRect(0,0,720,720);
    var y,x,end;
    var yellow = false;
    for(y=0;y<zoomMap.length;y++) {
        x=zoomMap[y][0];
        end=zoomMap[y][1];
        while (x<end) {
            drawTile(map[(retY+y-5)][(retX+x-5)][1].type,x,y);
            x++;
            if (map[(retY+y-5)][(retX+x-5)][1].type===1) {
                yellow=true;
            }
        }
    }
    if (yellow===true) {
        document.getElementById('test1').style.display='block';
    } else {
        document.getElementById('test1').style.display='none';
    }
}

/*Random walk function for "clumpy" randomness*/
function randWalk() {
    var walk = Math.floor(Math.random()*3);
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

/*draws the current location on the small radar map*/
function drawLoc() {   
    radarLoc.clearRect(0,0,radarRad*2,radarRad*2);
    radarLoc.beginPath();
    radarLoc.arc(retX,retY,7,0,Math.PI*2,true);
    radarLoc.fillStyle= 'rgba(255,251,229,0.7)';
    radarLoc.fill();
    radarLoc.closePath();
    radarLoc.beginPath();
    radarLoc.arc(retX,retY,8,0,Math.PI*2,true);
    radarLoc.strokeStyle = '#BD222A';
    radarLoc.stroke();
    radarLoc.closePath();
}

/*Highlights the appropriate hexagon when the mouse is over it*/
function drawmPanLoc() {
    mPanLoc.clearRect(0,0,720,720);

    if (mPanTrack === true) {
        drawTile(1,getTile('x'),getTile('y'),true);                             //send our reference, with the optional "true" to tell drawTile that we want a hgihlight
    }
}

/*Get the tile x or y value for the tile the mouse is currently over*/
function getTile(axis) {
    var x, y, yDiff, xDiff, left, right;
    
    //set the general cases
    y = Math.floor(mouseY/(70*0.75));
    
    if (y%2 !== 0) {
        x = Math.floor((mouseX-30)/60);                                         //We need an offset for the shifted rows
    } else {
        x = Math.floor(mouseX/60);
    }
    
    //corner case code
    yDiff = (mouseY/(70*0.75))-y;
    if (yDiff < 0.33) {                                                         //If we're in the top third of the reference rectangle
        //tells which intermediate block we're in...
        if (y%2 !== 0) {
            xDiff = (((mouseX-30)/60)-x);
            //I now do some basic Pythagoras theorem to figure out which hexagon I'm in
            //Are we on the left or right hand side fo the top third?
            if(xDiff<0.5) {
                left=0.5-xDiff;                                                 //Adjust to get the opposite length of the 60° internal angle
                if((left*10)>(yDiff*10)*Math.tan(Math.PI/3)) {                  //I multiply by 10 so that I'm not dealing with numbers less than 1 
                    y -=1;                                                      //change the reference appropriately
                }
            } else {                                                            //rinse repeat for all cases
                right = xDiff-0.5;
                if((right*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                    x += 1;
                }
            }
            
        } else {
            xDiff = ((mouseX/60)-x);
            if(xDiff<0.5) {
                left=0.5-xDiff;
                if((left*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                    x -= 1;
                }
            } else {
                right = xDiff-0.5;
                if((right*10)>(yDiff*10)*Math.tan(Math.PI/3)) {
                    y -=1;
                }
            }
        }

    }
    if(axis === 'x') {                                                          //return the appropriate tile axis reference
        return x;
    } else {
        return y;
    }
}

/*When the radar is clicked, moves the map to that location*/
function jump() {
    var x = mouseX;
    var y = mouseY;
    //ensure we're dealing with a multiple of two (since we move up and down in twos)
    if (y%2 !== 0) {
        y -= 1;
    }
    //then set the new values and draw
    if (radius(x,y) < radLimit) {
        retX = x;
        retY = y;
        drawLoc();
    }
}

//testing how to write to main map array
function clickTest() {
    var kind;
    switch (clickedOn) {
        case 'test1':
            kind = 0;
            clickedOn = null;
            break;
        case 'test2':
            kind = 1;
            clickedOn = null;
            break;
        case null:
            kind = null;
            break;
        default:
            break;
    }
    if (kind === 0 || kind ===1){
        map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].type = kind;
        drawZoomMap();
        drawRadar();
    }
    document.body.style.cursor="default";
    console.log('x: ' + getTile('x') + '  y: ' + getTile('y') + ' equivalent to map[' + (retY+getTile('y')-5) + '][' + (retX+getTile('x')-5) + ']');
    console.log('iron='+map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].resources[0] + ' zinc='+map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].resources[1]);
}

function construct(id) {
    if (clickedOn === id) {
        clickedOn = null;
        document.body.style.cursor="default";
    } else {
        clickedOn = id;
        document.body.style.cursor="url('images/bdozePointer.png'), default";
    }
}