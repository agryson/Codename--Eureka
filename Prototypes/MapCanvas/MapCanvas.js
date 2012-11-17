//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing

//GLOBAL VARS**********************************************************************************************
var mPanCanvas, mPanLoc, radarCanvas, mPanel, radar, radarLoc;                  //General canvas page vars
var map, zoomMap, tile, tileHighlight, retX, retY, animate, radLimit, radarRad,
    clickedOn; //hold info for various bits and bobs
                                                //movement vars
var mouseX, mouseY, mPanTrack;                                                  //mouse trackers for main panel
var noise,noise2,noise3;                                                        //vars for world generation
var turn = 0;

//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/
function Terrain() {
    this.type; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.resources; //an array that holds the different metal and resource types
    this.turns = false;  //remembers how many turns are left to become a tile of the desired type
    this.prepare = function(){
        console.log(this.turns);
        if (this.type < 3 && this.turns === false){
            this.turns = this.type + 1;
            this.type=5;
        }
    };
    this.nextTurn = function(){
       if (this.turns !== false && this.turns !== 0){
           this.turns -=1;
           console.log('turns left: '+this.turns);
       } else if(this.turns === 0){
           this.type = 3;
       }
    };
}

function Building() {
    this.type; //type of building
    this.health = 100; //health of building
    this.air = false; //boolean, does building have air?
    this.age = 0;
    this.nextTurn = function(){
      //placeholder  
    };
}

function Robot(name, type) {
    this.name = name; //the robot's name/number so we can keep track of which robot is doing what
    this.type = type; //type of robot 0=dozer, 1 = miner ...
    this.health = 100;
    this.busy = false; //is the robot currently working or not
    this.position = new Array(2); //position in x,y coordinates
}

//GENERAL SETUP AND TOOLS**********************************************************************************************
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
    /*set up our noise layers*/
    noise = new ClassicalNoise();
    noise2 = new ClassicalNoise();
    noise3 = new ClassicalNoise();

    /*create the game's map*/
    map = new Array(radarRad*2);
    createMap();
    
    /*draw the radar background once on load*/
    drawRadar();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is

    tileHighlight = new Image();                                                //create the spritesheet object for the tools png (highlights/buttons etc.)
    tileHighlight.src = 'images/tools.png';                                     //tell script where spritesheet is

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
    document.onkeyup = keypressed;                                               //keyboard listener
    drawLoc();
    mainLoop();
}

/*returns a random number from 0 to num-1, but the minimum (and maximum) can be offset with min
Thinkof num as the modifier, min as the base
*/
function randGen(num, min){
    return Math.floor(Math.random()*num)+min;
}

function nextTurn(){
    var x;
    var y;
    turn += 1;
	for(y=0;y<radarRad*2;y++) {
		for(x=0; x<radarRad*2; x++) {
			if(map[y][x][0]===true) {
                map[y][x][1].nextTurn();
			}
		}   
	}
    console.log('It is now turn: '+ turn);
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
function keypressed(e) {
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
    var upY = retY-2;
    var downY = retY+2;
    var leftX = retX-1;
    var rightX = retX+1;
    console.log('Inside move, before switch '+ dir);
    switch(dir) {
        case 'up':
            if(distance(retX,upY, radarRad,radarRad)<=radLimit) {
                retY = upY;
            }
            break;         
        case 'down':
            if(distance(retX,downY, radarRad,radarRad)<=radLimit) {
                retY = downY;
            }
            break;         
        case 'left':
            if(distance(leftX,retY, radarRad,radarRad)<=radLimit) {
                retX = leftX;
            }
            break;          
        case 'right':
            if(distance(rightX,retY, radarRad,radarRad)<=radLimit) {
                retX = rightX;
            }
            break;         
        default:
            console.log('inside move');
            break;
    }
    drawZoomMap();
    drawLoc();
}

/*
can do stuff with adjacent hexes
e.g.
map[adjacent(x,y,0)[0]][adjacent(x,y,0)[1]][1].type = 0;
*/
function adjacent(x,y,index) {
    if(y%2 === 0) {
        index += 6;
    }
    switch(index) {
        case 0:
            return [y-1,x-1];
        case 1:
            return [y-1,x];
        case 2:
            return [y,x+1];
        case 3:
            return [y+1,x];
        case 4:
            return [y+1,x-1];
        case 5:
            return [y,x-1];
        case 6:
            return [y-1,x];
        case 7:
            return [y-1,x+1];
        case 8:
            return [y,x+1];
        case 9:
            return [y+1,x+1];
        case 10:
            return [y+1,x]; 
        case 11:
            return [y,x-1];
        default:
            console.log('There was a problem jim, x:' + x + ' y:' + y + ' index:' + index);
    }
}

/*returns the distance of the given point from the centrepoint*/
function distance(x1,y1,x2,y2) {
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
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
    if (distance(x,y, radarRad, radarRad) < radLimit) {
        retX = x;
        retY = y;
        drawLoc();
    }
}

//WORLD GENERATION****************************************************************
//FOLLOWING INDENTED CODE WAS 'BORROWED' FROM STACK OVERFLOW
    // Ported from Stefan Gustavson's java implementation
    // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
    // Read Stefan's excellent paper for details on how this code works.
    //
    // Sean McCullough banksean@gmail.com
    
    /**
     * You can pass in a random number generator object if you like.
     * It is assumed to have a random() method.
     */
    var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
        if (r == undefined) r = Math;
      this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                     [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                     [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
      this.p = [];
      for (var i=0; i<256; i++) {
          this.p[i] = Math.floor(r.random()*256);
      }
      // To remove the need for index wrapping, double the permutation table length 
      this.perm = []; 
      for(var i=0; i<512; i++) {
            this.perm[i]=this.p[i & 255];
      }
    };
    
    ClassicalNoise.prototype.dot = function(g, x, y, z) { 
        return g[0]*x + g[1]*y + g[2]*z; 
    };
    
    ClassicalNoise.prototype.mix = function(a, b, t) { 
        return (1.0-t)*a + t*b; 
    };
    
    ClassicalNoise.prototype.fade = function(t) { 
        return t*t*t*(t*(t*6.0-15.0)+10.0); 
    };
    
      // Classic Perlin noise, 3D version 
    ClassicalNoise.prototype.noise = function(x, y, z) { 
      // Find unit grid cell containing point 
      var X = Math.floor(x); 
      var Y = Math.floor(y); 
      var Z = Math.floor(z); 
      
      // Get relative xyz coordinates of point within that cell 
      x = x - X; 
      y = y - Y; 
      z = z - Z; 
        
      // Wrap the integer cells at 255 (smaller integer period can be introduced here) 
      X = X & 255; 
      Y = Y & 255; 
      Z = Z & 255;
      // Calculate a set of eight hashed gradient indices 
      var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
      var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
      var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
      var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
      var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
      var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
      var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
      var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 
      
      // The gradients of each corner are now: 
      // g000 = grad3[gi000]; 
      // g001 = grad3[gi001]; 
      // g010 = grad3[gi010]; 
      // g011 = grad3[gi011]; 
      // g100 = grad3[gi100]; 
      // g101 = grad3[gi101]; 
      // g110 = grad3[gi110]; 
      // g111 = grad3[gi111]; 
      // Calculate noise contributions from each of the eight corners 
      var n000= this.dot(this.grad3[gi000], x, y, z); 
      var n100= this.dot(this.grad3[gi100], x-1, y, z); 
      var n010= this.dot(this.grad3[gi010], x, y-1, z); 
      var n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
      var n001= this.dot(this.grad3[gi001], x, y, z-1); 
      var n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
      var n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
      var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); 
      // Compute the fade curve value for each of x, y, z 
      var u = this.fade(x); 
      var v = this.fade(y); 
      var w = this.fade(z); 
       // Interpolate along x the contributions from each of the corners 
      var nx00 = this.mix(n000, n100, u); 
      var nx01 = this.mix(n001, n101, u); 
      var nx10 = this.mix(n010, n110, u); 
      var nx11 = this.mix(n011, n111, u); 
      // Interpolate the four results along y 
      var nxy0 = this.mix(nx00, nx10, v); 
      var nxy1 = this.mix(nx01, nx11, v); 
      // Interpolate the two last results along z 
      var nxyz = this.mix(nxy0, nxy1, w); 
      
      return nxyz; 
    };

function altitude(x,y){
    var gridSize = 75;
    var n = (noise.noise(x / gridSize, y / gridSize, 0) + 1) * 127;
    var n2 = (noise2.noise(x / (gridSize/2), y / (gridSize/2), 0) + 1) * 127;
    var n3 = (noise3.noise(x / (gridSize/4), y / (gridSize/4), 0) + 1) * 127;
    
    return Math.round((n+n2+n3)/3);
}

/*creates the map*/
function createMap() {
    var x;
	var y;
	for(y=0;y<radarRad*2;y++) {
		map[y]=new Array(radarRad*2);                                           //create an array to hold the x cell, we now have a 200x200 2d array
		for(x=0; x<radarRad*2; x++) {
            map[y][x]=new Array(2);                                             //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
			if(distance(x,y,radarRad,radarRad)<=radarRad) {                      //check the radius, mark true if it's mapped, mark false if it's not in the circle
				map[y][x][0]=true;                                              //invert axes because referencing the array is not like referencing a graph
				map[y][x][1]= new Terrain();                                    //if we're in the circle, assign a tile value
                map[y][x][1].altitude=altitude(x,y);
                map[y][x][1].resources= new Array(2);                           //insert the number of resources we'll be looking for
                setType(x,y);
                generateResources(x,y,map[y][x][1].type);
			}else{
				map[y][x][0]=false;
			}
		}
        
	}
    //genRivers(500, 3000);
}
/*
//Rivers don't look convincing enough but I may want to come back to them at some point...
function genRivers(num, steps) {
    console.log('called rivers');
    var x = Math.floor(Math.random()*radarRad*2);
    var y = Math.floor(Math.random()*radarRad*2);
    for (num; num >= 0; num--) {
        river(x,y,steps);
        x = Math.floor(Math.random()*radarRad*2);
        y = Math.floor(Math.random()*radarRad*2);
    }
    drawRadar();
}

function river(x,y,steps){
    var tempX = x;
    var tempY = y;
    try{
    if (map[y][x][0] === true && map[y][x][1] !== null && map[y][x][1].altitude > 160){
        for (steps; steps >=0; steps--) {
            map[y][x][1].type = 4;
            for (var i = 0; i < 6; i++){
                try{
                if  (map[tempY][tempX][0] === true && map[adjacent(x,y,i)[0]][adjacent(x,y,i)[1]][1].altitude <= map[tempY][tempX][1].altitude){
                    tempX = adjacent(x,y,i)[1];
                    tempY = adjacent(x,y,i)[0];
                }
                }catch(e){}
            }
            if (x == tempX && y == tempY){
                tempX = adjacent(x,y,randGen(6,0))[1];
                tempY = adjacent(x,y,randGen(6,0))[0];
                console.log('new riverpoint   x' + x + '   y:' + y);
            }
            
            x = tempX;
            y = tempY;
            
        }
    }
    }catch(e){}
}
*/

/*Sets the tile type as a function of altitude*/
function setType(x,y) {
    var altitude = map[y][x][1].altitude;
    var high = 160;
    var med = 130;
    var low = 90;
    
    if (altitude >= high){
        map[y][x][1].type = 2;
    } else if(altitude < high && altitude >= med){
        map[y][x][1].type = 1;
    } else if(altitude < med && altitude >= low ){
        map[y][x][1].type = 0;
    } else {
        map[y][x][1].type = 4;
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

//MAPS**********************************************************************************
/*a placeholder to fill in our radar*/
function drawRadar() {
    var radarPixels = radar.createImageData(radarRad*2, radarRad*2);

    for (var x = 0; x < radarPixels.width; x++)  {
        for (var y = 0; y < radarPixels.height; y++)  {
            if (map[y][x][0] === true) {
                
                // Index of the pixel in the array
                var idx = (x + y * radarPixels.width) * 4;
                /*
                radarPixels.data[idx + 0] = map[y][x][1].altitude;
                radarPixels.data[idx + 1] = map[y][x][1].altitude;
                radarPixels.data[idx + 2] = map[y][x][1].altitude;
                radarPixels.data[idx + 3] = 255;
                */

                var kind = map[y][x][1].type;
                switch(kind) {
                    case 0:
                        radarPixels.data[idx + 0] = 212;
                        radarPixels.data[idx + 1] = 197;
                        radarPixels.data[idx + 2] = 174;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 1:
                        radarPixels.data[idx + 0] = 201;
                        radarPixels.data[idx + 1] = 179;
                        radarPixels.data[idx + 2] = 165;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 2:
                        radarPixels.data[idx + 0] = 231;
                        radarPixels.data[idx + 1] = 226;
                        radarPixels.data[idx + 2] = 223;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 3:
                        radarPixels.data[idx + 0] = 16;
                        radarPixels.data[idx + 1] = 82;
                        radarPixels.data[idx + 2] = 4;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 4:
                        radarPixels.data[idx + 0] = 128;
                        radarPixels.data[idx + 1] = 188;
                        radarPixels.data[idx + 2] = 224;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    default:
                        //If we're here, we're probably dealing with a building or robot...
                        radarPixels.data[idx + 0] = 0;
                        radarPixels.data[idx + 1] = 200;
                        radarPixels.data[idx + 2] = 0;
                        radarPixels.data[idx + 3] = 255;
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
            destinationY = Math.floor(tilePosY*destinationWidth*0.86);          //shift it, the number here is a constant that depends ont eh hexagon deformation
                
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

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule*/
function drawZoomMap() {
    mPanel.clearRect(0,0,720,720);
    var y,x,end;
    //var yellow = false;//test for conditional display of menu items
    for(y=0;y<zoomMap.length;y++) {
        x=zoomMap[y][0];
        end=zoomMap[y][1];
        while (x<end) {
            drawTile(map[(retY+y-5)][(retX+x-5)][1].type,x,y);
            x++;
            //if (map[(retY+y-5)][(retX+x-5)][1].type===1) {
                //yellow=true;
            //}
        }
    }
    //tests for conditional display of menu items
    //if (yellow===true) {
        //document.getElementById('test1').style.display='block';
    //} else {
        //document.getElementById('test1').style.display='none';
    //}
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

//TESTING SECTION********************************************************************
//testing how to write to main map array
function clickTest() {
    var kind;
    switch (clickedOn) {
        case 'dozer':
            kind = 5;
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
    if (kind >= 0 && kind <= 4 && map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].type !== 4){
        //map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].type = kind;
    } else if(kind == 5){
        map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].prepare();
    }
    drawZoomMap();
    drawRadar();
    document.body.style.cursor="default";
    //var a = coordinate((retX+getTile('x')-5),(retY+getTile('y')-5));
    //var rng = new CustomRandom(retX);
    //console.log('x: ' + a[0] + ' y: ' + a[1] + 'random seeded y x: ' + rng.next());
    console.log('x: ' + getTile('x') + '  y: ' + getTile('y') + ' equivalent to map[' + (retY+getTile('y')-5) + '][' + (retX+getTile('x')-5) + ']');
    console.log('iron='+map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].resources[0] + ' zinc='+map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].resources[1]);
    console.log('altitude: '+ map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].altitude);
    //console.log('top left altitude: '+map[adjacent((retX+getTile('x')-5),(retY+getTile('y')-5),0)[0]][adjacent((retX+getTile('x')-5),(retY+getTile('y')-5),0)[1]][1].altitude);
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


