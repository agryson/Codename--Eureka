//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing

//GLOBAL VARS**********************************************************************************************
var mPanCanvas, mPanLoc, radarCanvas, mPanel, radar, radarLoc;                  //General canvas page vars
var map, map1, zoomMap, tile, tileHighlight, retX, retY, animate, radLimit, radarRad,
    clickedOn, seeder, rng, turnNum; //hold info for various bits and bobs
                                                //movement vars
var mouseX, mouseY, overMPan;                                                  //mouse trackers for main panel
var noise,noise2,noise3;                                                        //vars for world generation
var turn = 0;
var level = 0;

//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/
function Terrain() {
    this.type; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.resources; //an array that holds the different metal and resource types
    this.turns = false;  //remembers how many turns are left to become a tile of the desired type
    this.prepare = function(){
        if (this.type < 3 && this.turns === false){
            this.turns = this.type + 1;
            this.type=5;
        }
    };
    this.nextTurn = function(){
       if (this.turns !== false && this.turns !== 0){
           this.turns -=1;
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
    turnNum = document.getElementById('turnNumber');
    
    /*set up our noise layers*/
    //seeder = getSeed();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is

    tileHighlight = new Image();                                                //create the spritesheet object for the tools png (highlights/buttons etc.)
    tileHighlight.src = 'images/tools.png';                                     //tell script where spritesheet is

    document.onkeyup = keypressed;                                               //keyboard listener
}

function overCanvas(bool, which){
    /*
    * Event listeners track the mouse movements. 
    * N.B.: You need to track on the topmost layer!!!
    */
    if (bool === true && which == 'mPan'){
        //radarCanvas.onmousemove = null;
        mPanCanvas.addEventListener('mousemove', function(evt){
            getMousePos(mPanCanvas, evt);
        }, false);
    } else if (bool === true && which == 'radar') {
        //mPanCanvas.onmousemove = null;
        radarCanvas.addEventListener('mousemove', function(evt){
            getMousePos(radarCanvas, evt);
        }, false);
    } else {
        /*
        * Event listeners track the mouse movements. 
        * N.B.: You need to track on the topmost layer!!!
        */
        mPanCanvas.onmousemove = null;
        radarCanvas.onmousemove = null;
        mPanLoc.clearRect(0,0,720,720);
    }
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
    var hold;
    if (hold !== true){
        turn += 1;
        for(y=0;y<radarRad*2;y++) {
            for(x=0; x<radarRad*2; x++) {
                if(map[y][x][0]===true) {
                    map[y][x][1].nextTurn();
                }
            }   
        }
        turnNum.innerHTML = "Week: " + turn;
    }
    hold = true;
    setTimeout(hold = false,1000);
}

function leftMenuResize(bool) {
    if (bool === true){
        document.getElementById('leftMenu').onmousemove = resize;
    } else {
        document.getElementById('leftMenu').onmousemove = null;
    }
}

function resize(e) {
    var current = e.clientY;
    var total = window.innerHeight;
    var percentage = ((current/total)*100);
    if (percentage < 10) {
        percentage = 11;
    } else if (percentage > 90){
        percentage = 89;
    }
    document.getElementById('buildingContainer').style.height = percentage + '%';
    document.getElementById('droneContainer').style.marginTop = percentage + '%';
    document.getElementById('leftMenuSlider').style.marginTop = percentage + '%';
}

function pulldown() {
    var i = document.getElementById('execDropDownContainer');
    if (parseInt(i.style.height, 10) === 0 || i.style.height === '') {
        i.style.height = '650px';
    } else {
        i.style.height = '0px';
    }
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
        case 76:
            move('level'); //changes level  
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
    if (overMPan === true){
        mPanLoc.clearRect(0,0,720,720);
        drawTile(1,getTile('x'),getTile('y'),true);
    }
}

/*shifts our reference reticule (if possible), then redraws the map*/
function move(dir) {
    var upY = retY-2;
    var downY = retY+2;
    var leftX = retX-1;
    var rightX = retX+1;
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
        case 'level':
            level == 0 ? level = 1 : level = 0;//TODO insert change level code         
        default:
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
function drawTile(tileType, tilePosX, tilePosY, highlight, darkness) {
    try {
        if (tilePosX < zoomMap[tilePosY][0] || tilePosX >= zoomMap[tilePosY][1]) {
            //this if checks to make sure we requested a tile we can draw, 
            //mainly to prevent highlighting outside of the map
        } else {
            var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, 
                destinationY, destinationWidth, destinationHeight;              //Canvas vars
            sourceWidth = 173;                                                  //original tile width
            sourceHeight = 200;                                                 //original tile height
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
            } else if (tileType < 4 || tileType > 5){
                sourceX = 0;
                sourceY = tileType*sourceHeight;
                mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
                    destinationX, destinationY, destinationWidth, destinationHeight);
            } else {
                sourceX = animate*sourceWidth;
                sourceY = tileType*sourceHeight;                
                mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
                    destinationX, destinationY, destinationWidth, destinationHeight);
            }
            if (darkness) {
                sourceX = 0;
                sourceY = darkness*sourceHeight;        
                mPanel.drawImage(tileHighlight, sourceX, sourceY, sourceWidth, 
                    sourceHeight, destinationX, destinationY, destinationWidth, 
                    destinationHeight);
            }
        }    
    } catch(e){
        //Do Nothing, we expect this error... unfortunately
    }
}

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule*/
function drawZoomMap() {
    mPanel.clearRect(0,0,720,720);
    var y,x,end,sourceTile;
    level == 0 ? sourceTile = map : sourceTile = map1;

    for(y=0;y<zoomMap.length;y++) {
        x=zoomMap[y][0];
        end=zoomMap[y][1];
        while (x<end) {
            drawTile(sourceTile[(retY+y-5)][(retX+x-5)][1].type,x,y,false);
            if (y === 0 || y == zoomMap.length - 1 || x == zoomMap[y][0] || x == end - 1){//darkens the outer hexagons
                drawTile(sourceTile[(retY+y-5)][(retX+x-5)][1].type,x,y,false,2);
            }
            x++;
        }
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


    
    

//TESTING SECTION********************************************************************
//testing how to write to main map array
function clickTest() {
    var kind;
    switch (clickedOn) {
        case 'test1':
            kind = 5;
            clickedOn = null;
            break;
        case 'test2':
            kind = 5;
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