//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing
var Game;                                                                       //Global so I can get at it from other scripts...
//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/
function Terrain() {
    this.kind; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.resources; //an array that holds the different metal and resource kinds
    this.turns;  //remembers how many turns are left to become a tile of the desired kind
    var preparing = false;
    this.prepare = function(){
        if (!preparing){
            this.turns = 2;
            this.kind=5;
            preparing = true;
        }
    };
    this.nextTurn = function(){
       if (this.turns > 0){
           this.turns -=1;
           //console.log(this.turns);
       } else if(this.turns === 0){
           this.kind = 3;
           this.turns = false;
           preparing = true;
       }
    };
}

function Building() {
    this.kind; //kind of building
    this.health = 100; //health of building
    this.air = false; //boolean, does building have air?
    this.age = 0;
    this.nextTurn = function(){
      //placeholder  
    };
}

function Robot(name, kind) {
    this.name = name; //the robot's name/number so we can keep track of which robot is doing what
    this.kind = kind; //kind of robot 0=dozer, 1 = miner ...
    this.health = 100;
    this.busy = false; //is the robot currently working or not
    this.position = new Array(2); //position in x,y coordinates
}

//GENERAL SETUP AND TOOLS**********************************************************************************************
/*Set up any global stuff that won't ever change after page load*/
function Param(){
    //Radar related vars...
    this.radarRad = 150;                                                             //this is the radius of the map that we want, changing it here should change it everywhere except the html
    this.radLimit=this.radarRad-8;

    //The zoomed in map related thigs...
    this.zoomMap = [
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
    this.retX = this.radarRad;
    this.retY = this.radarRad;
    this.animate=0;
    this.tile = new Image();
    this.tile.src = 'images/tiles.png'; 
    this.tileHighlight = new Image();
    this.tileHighlight.src = 'images/tools.png';
    this.clickedOn = false;
    this.level = 0;
    this.mouseX;
    this.mouseY;
    
    //General game stuff
    this.turnNum = document.getElementById('turnNumber');
    this.turn = 0;
    this.map = [];
    this.map1 = [];
    this.map2 = [];
    this.map3 = [];
    this.map4 = [];    
    
    //Map generation vars
    this.seeder;
    this.rng;
    this.noise;
    this.noise2;
    this.noise3;

    //General canvas vars...
    this.mPanCanvas = document.getElementById('mPanOverlay'); 
    this.mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    this.mPanel = document.getElementById('mainPanel').getContext('2d');
    this.radarCanvas = document.getElementById('mapOverlay');
    this.radar = document.getElementById('map').getContext('2d');
    this.radarLoc = document.getElementById('mapOverlay').getContext('2d');
    this.overMPan;

}

function init() {
    Game = new Param();                                                             //TODO: Should add save and load game code here...
    Game.level = 0;                                                                 //Dunno why but level sometimes came up as less than 0?!?
    document.onkeydown = keypressed;                                               //keyboard listener
}

function overCanvas(bool, which){
    /*
    * Event listeners track the mouse movements. 
    * N.B.: You need to track on the topmost layer!!!
    */
    if (bool && which == 'mPan'){
        //radarCanvas.onmousemove = null;
        //console.log('yea!');
        Game.mPanCanvas.addEventListener('mousemove', function(evt){
            getMousePos(Game.mPanCanvas, evt);
        }, false);
    } else if (bool && which == 'radar') {
        //mPanCanvas.onmousemove = null;
        Game.radarCanvas.addEventListener('mousemove', function(evt){
            getMousePos(Game.radarCanvas, evt);
        }, false);
    } else {
        /*
        * Event listeners track the mouse movements. 
        * N.B.: You need to track on the topmost layer!!!
        */
        Game.mPanCanvas.onmousemove = null;
        Game.radarCanvas.onmousemove = null;
        Game.mPanLoc.clearRect(0,0,720,720);
    }
}

/*returns a random number from 0 to num-1, but the minimum (and maximum) can be offset with min
Think of num as the modifier, min as the base
*/
function randGen(num, min){
    return Math.floor(Math.random()*num)+min;
}

function changeLevel(newLevel){
    Game.level = parseInt(newLevel);
    drawRadar();
}

function nextTurn(){
    var x;
    var y;
    var hold;
    if (!hold){
        Game.turn += 1;
        for(y=0;y<Game.radarRad*2;y++) {
            for(x=0; x<Game.radarRad*2; x++) {
                for(var l=0; l<5; l++){
                    if(returnLevel(l)[y][x][0]===true) {
                        returnLevel(l)[y][x][1].nextTurn();
                    }
                }
            }   
        }
        Game.turnNum.innerHTML = "Week: " + Game.turn;
    }
    //The following hold code just prevent accidentally skipping two turns with accidental clicks...
    hold = true;
    setTimeout(hold = false,1000);
}

function leftMenuResize(bool) {
    if (bool){
        document.getElementById('leftMenu').onmousemove = resize;
    } else {
        document.getElementById('leftMenu').onmousemove = null;
    }
}

function resize(e) {
    var current = e.clientY;
    var total = window.innerHeight;
    var percentage = ((current/total - 0.01)*100);
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
    var N = 1; //Number of animation frames from 0 e.g. N=1 is the same as having two images which swap...
    Game.animate == N ? Game.animate = 0 : Game.animate += 1;
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
            drawRadar();
            break;
        case 48:
            Game.level = 0;
            drawRadar();
            break;
        case 49:
            Game.level = 1;
            drawRadar();
            break;
        case 50:
            Game.level = 2;
            drawRadar();
            break;
        case 51:
            Game.level = 3;
            drawRadar();
            break;
        case 52:
            Game.level = 4;
            drawRadar();
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
    Game.mouseX = evt.clientX - left + window.pageXOffset;
    Game.mouseY = evt.clientY - top + window.pageYOffset;
    if (Game.overMPan){
        Game.mPanLoc.clearRect(0,0,720,720);
        drawTile(1,getTile('x'),getTile('y'),true);
    }
}

/*shifts our reference reticule (if possible), then redraws the map*/
function move(dir) {
    var upY = Game.retY-2;
    var downY = Game.retY+2;
    var leftX = Game.retX-1;
    var rightX = Game.retX+1;
    switch(dir) {
        case 'up':
            if(distance(Game.retX,upY, Game.radarRad,Game.radarRad)<=Game.radLimit) {
                Game.retY = upY;
            }
            break;         
        case 'down':
            if(distance(Game.retX,downY, Game.radarRad,Game.radarRad)<=Game.radLimit) {
                Game.retY = downY;
            }
            break;         
        case 'left':
            if(distance(leftX,Game.retY, Game.radarRad,Game.radarRad)<=Game.radLimit) {
                Game.retX = leftX;
            }
            break;          
        case 'right':
            if(distance(rightX,Game.retY, Game.radarRad,Game.radarRad)<=Game.radLimit) {
                Game.retX = rightX;
            }
            break;
        case 'level':
            Game.level == 4 ? Game.level = 0 : Game.level += 1;        
        default:
            break;
    }
    drawZoomMap();
    drawLoc();
}

/*
can do stuff with adjacent hexes
e.g.
map[adjacent(x,y,0)[0]][adjacent(x,y,0)[1]][1].kind = 0;
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
    y = Math.floor(Game.mouseY/(70*0.74));
    
    y%2 !== 0 ? x = Math.floor((Game.mouseX-30)/60) : x = Math.floor(Game.mouseX/60);

    //corner case code
    yDiff = (Game.mouseY/(70*0.74))-y;
    if (yDiff < 0.33) {                                                         //If we're in the top third of the reference rectangle
        //tells which intermediate block we're in...
        if (y%2 !== 0) {
            xDiff = ((Game.mouseX-30)/60-x);
            //I now do some basic Pythagoras theorem to figure out which hexagon I'm in
            //Are we on the left or right hand side of the top third?
            if(xDiff < 0.5) {
                left = 0.5 - xDiff;                                                 //Adjust to get the opposite length of the 60° internal angle
                if(left*10 > yDiff*10*Math.tan(Math.PI/3)) {                  //I multiply by 10 so that I'm not dealing with numbers less than 1 
                    y -= 1;                                                      //change the reference appropriately
                }
            } else {                                                            //rinse repeat for all cases
                right = xDiff-0.5;
                if(right*10 > yDiff*10*Math.tan(Math.PI/3)) {
                    y -=1;
                    x += 1;
                }
            }
            
        } else {
            xDiff = (Game.mouseX/60-x);
            if(xDiff < 0.5) {
                left = 0.5 - xDiff;
                if(left*10 > yDiff*10*Math.tan(Math.PI/3)) {
                    y -=1;
                    x -= 1;
                }
            } else {
                right = xDiff-0.5;
                if(right*10 > yDiff*10*Math.tan(Math.PI/3)) {
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
    var x = Game.mouseX;
    var y = Game.mouseY;
    //ensure we're dealing with a multiple of two (since we move up and down in twos)
    if (y%2 !== 0) {
        y -= 1;
    }
    //then set the new values and draw
    if (distance(x, y, Game.radarRad, Game.radarRad) < Game.radLimit) {
        Game.retX = x;
        Game.retY = y;
        drawLoc();
    }
}

function returnLevel(level){
    switch(level){
    case 0:
      return Game.map;
    case 1:
      return Game.map1;
    case 2:
      return Game.map2;
    case 3:
      return Game.map3;
    case 4:
      return Game.map4;
    default:
      console.log('There was a problem with the level... ' + level);
    }
}

//MAPS**********************************************************************************
/*a placeholder to fill in our radar*/
function drawRadar() {
    var radarPixels = Game.radar.createImageData(Game.radarRad*2, Game.radarRad*2);

    for (var x = 0; x < radarPixels.width; x++)  {
        for (var y = 0; y < radarPixels.height; y++)  {
            if (Game.map[y][x][0]) {
                
                // Index of the pixel in the array
                var idx = (x + y * radarPixels.width) * 4;
                var kind = returnLevel(Game.level)[y][x][1].kind;
                switch(kind%6) {
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
                        radarPixels.data[idx + 0] = 211;
                        radarPixels.data[idx + 1] = 206;
                        radarPixels.data[idx + 2] = 203;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 3:
                        radarPixels.data[idx + 0] = 0;
                        radarPixels.data[idx + 1] = 62;
                        radarPixels.data[idx + 2] = 0;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 4:
                        radarPixels.data[idx + 0] = 108;
                        radarPixels.data[idx + 1] = 168;
                        radarPixels.data[idx + 2] = 204;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    default:
                        //If we're here, we're probably dealing with a building or robot...
                        radarPixels.data[idx + 0] = 0;
                        radarPixels.data[idx + 1] = 180;
                        radarPixels.data[idx + 2] = 0;
                        radarPixels.data[idx + 3] = 255;
                }
                //This should darken pixels the deeper we go underground...
                for(var i=0; i<3; i++){
                    if(Game.level > 0){
                        radarPixels.data[idx + i] - 100 >= 0 ? radarPixels.data[idx + i] -= 100 : radarPixels.data[idx + i] = 0;
                    }
                }
            }
        }
    }
    
    Game.radar.putImageData(radarPixels, 0, 0);
    Game.radar.fillStyle="#ffffff";
    Game.radar.font="14px Droid Sans";
    Game.radar.fillText('Depth: ' + Game.level*50 + 'm', 215, 298);
}

/*accepts the kind of tile to draw, the x column number and the y column number, then draws it*/
function drawTile(tileType, tilePosX, tilePosY, highlight, darkness) {
    try {
        if (tilePosX < Game.zoomMap[tilePosY][0] || tilePosX >= Game.zoomMap[tilePosY][1]) {
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
                
            if (highlight){                                            //highlight is an optional parameter to see which canvas to draw to and how
                sourceX = 0;
                sourceY = 0;        
                Game.mPanLoc.drawImage(Game.tileHighlight, sourceX, sourceY, sourceWidth, 
                    sourceHeight, destinationX, destinationY, destinationWidth, 
                    destinationHeight);
            } else if (tileType !== 4 && tileType !== 5 && tileType !== 10 && tileType !== 11 && tileType !== 16 && tileType !== 17 && tileType !== 22 && tileType !== 23 && tileType !== 28 && tileType !== 29){
                sourceX = 0;
                sourceY = tileType*sourceHeight;
                Game.mPanel.drawImage(Game.tile, sourceX, sourceY, sourceWidth, sourceHeight,
                    destinationX, destinationY, destinationWidth, destinationHeight);
            } else {
                sourceX = Game.animate*sourceWidth;
                sourceY = tileType*sourceHeight;                
                Game.mPanel.drawImage(Game.tile, sourceX, sourceY, sourceWidth, sourceHeight,
                    destinationX, destinationY, destinationWidth, destinationHeight);
            }
            if (darkness) {
                sourceX = 0;
                sourceY = darkness*sourceHeight;        
                Game.mPanel.drawImage(Game.tileHighlight, sourceX, sourceY, sourceWidth, 
                    sourceHeight, destinationX, destinationY, destinationWidth, 
                    destinationHeight);
            }
        }    
    } catch(e){
        //Do Nothing, we expect this error... unfortunately
        //Basically, when I go off the local map to the south it throws an error...
    }
}

/*this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule*/
function drawZoomMap() {
    Game.mPanel.clearRect(0,0,720,720);
    var y,x,end,sourceTile;

    switch(Game.level){
        case 0:
            sourceTile = Game.map;
            break;
        case 1:
            sourceTile = Game.map1;
            break;
        case 2:
            sourceTile = Game.map2;
            break;
        case 3:
            sourceTile = Game.map3;
            break;
        case 4:
            sourceTile = Game.map4;
            break;

    }

    for(y=0;y<Game.zoomMap.length;y++) {
        x=Game.zoomMap[y][0];
        end=Game.zoomMap[y][1];
        while (x<end) {
            drawTile(sourceTile[(Game.retY+y-5)][(Game.retX+x-5)][1].kind,x,y,false);
            if (y === 0 || y == Game.zoomMap.length - 1 || x == Game.zoomMap[y][0] || x == end - 1){//darkens the outer hexagons
                drawTile(sourceTile[(Game.retY+y-5)][(Game.retX+x-5)][1].kind,x,y,false,2);
            }
            x++;
        }
    }
}

/*draws the current location on the small radar map*/
function drawLoc() {   
    Game.radarLoc.clearRect(0,0,Game.radarRad*2,Game.radarRad*2);
    Game.radarLoc.beginPath();
    Game.radarLoc.arc(Game.retX,Game.retY,7,0,Math.PI*2,true);
    Game.radarLoc.fillStyle= 'rgba(255,251,229,0.7)';
    Game.radarLoc.fill();
    Game.radarLoc.closePath();
    Game.radarLoc.beginPath();
    Game.radarLoc.arc(Game.retX,Game.retY,8,0,Math.PI*2,true);
    Game.radarLoc.strokeStyle = '#BD222A';
    Game.radarLoc.stroke();
    Game.radarLoc.closePath();
}


    
    

//TESTING SECTION********************************************************************
//testing how to write to main map array
function clickTest() {
    for(var i = 0; i<5; i++){
        console.log('level: ' + i + ' is of kind: ' + returnLevel(i)[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].kind + ' & altitude: ' + returnLevel(i)[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].altitude);
    }
    var kind;
    switch (Game.clickedOn) {
        case 'test1':
            kind = 5;
            Game.clickedOn = null;
            break;
        case 'test2':
            kind = 5;
            Game.clickedOn = null;
            break;
        case null:
            kind = null;
            break;
        default:
            break;
    }
    if (kind >= 0 && kind <= 4 && returnLevel(Game.level)[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].kind !== 4){
        //map[(retY+getTile('y')-5)][(retX+getTile('x')-5)][1].kind = kind;
    } else if(kind == 5){
        returnLevel(Game.level)[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].prepare();
    }
    drawZoomMap();
    drawRadar();
    document.body.style.cursor="url('images/pointer.png'), default";
    //var a = coordinate((retX+getTile('x')-5),(retY+getTile('y')-5));
    //var rng = new CustomRandom(retX);
    //console.log('x: ' + a[0] + ' y: ' + a[1] + 'random seeded y x: ' + rng.next());
    console.log('x: ' + getTile('x') + '  y: ' + getTile('y') + ' equivalent to map[' + (Game.retY+getTile('y')-5) + '][' + (Game.retX+getTile('x')-5) + ']');
    console.log('iron='+Game.map[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].resources[0] + ' zinc='+Game.map[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].resources[1]);
    console.log('altitude: '+ Game.map[(Game.retY+getTile('y')-5)][(Game.retX+getTile('x')-5)][1].altitude);
    //console.log('top left altitude: '+map[adjacent((retX+getTile('x')-5),(retY+getTile('y')-5),0)[0]][adjacent((retX+getTile('x')-5),(retY+getTile('y')-5),0)[1]][1].altitude);
}

function construct(id) {
    if (Game.clickedOn === id) {
        Game.clickedOn = null;
        document.body.style.cursor="url('images/pointer.png'), default";
    } else {
        Game.clickedOn = id;
        document.body.style.cursor="url('images/dozer.png'), default";
    }
}