//TODO: clean up variable names
"use strict";                                                                   //this will break everything if there's any errors... that's a good thing
var Game;                                                                       //Global so I can get at it from other scripts...
//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/
function Terrain() {
    this.kind; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.UG;
    this.resources; //an array that holds the different metal and resource kinds
    this.turns;  //remembers how many turns are left to become a tile of the desired kind
    this.diggable;
    var wip = false; //Work in Progress?
    var prepared = false;
    this.willBe = 3;
    this.willBeDiggable = false;
    //robots
    this.robotInUse;
    //buildings
    this.health = 0;
    this.air = false;
    this.age = 0;
    this.exists = false; //does the building exist?

    this.nextTurn = function(){
       if (this.turns > 0){
           this.turns -=1;
       } else if(this.turns === 0){
            if(this.robotInUse >= 0){
                Game.robots[this.robotInUse][0]-=1;
                this.robotInUse = -1;
            }
            this.turns = false;
            this.wip = false;
            this.kind=3; //terrain is prepared before putting anythign else on it...
            switch(this.willBe){
                case 1000:
                    this.build(6,50,2);//obviously building an airshaft here...
                    break;
                case 1100:
                    this.build(6,80,2);//obviously building a mine...
                    break;
                default:
                    this.kind = this.willBe;
            }
            this.diggable = this.willBeDiggable;
       }
       if(this.exists){
            this.age += 1;
       }
    };

    this.prepare = function(){
        if (!prepared && !this.wip && this.diggable && Game.robots[0][0] < Game.robots[0][1]){
            this.turns = eta(2,this.kind);
            this.kind=8;
            this.wip = true; //tells us that work is in progress
            this.willBe = 3;
            this.robotInUse = 0;
            Game.robots[0][0] +=1;
        }else {
            notify("You can't prepare this terrain...");
        }
    };

    this.digDown = function(x,y,lowerTile){

        if(Game.level < 4 && !wetTest([y,x], Game.level+1) && lowerTile.kind !== 4 && !lowerTile.wip && this.diggable && Game.robots[1][0] < Game.robots[1][1]-1){
            this.willBe=1000; //TODO: fix to be a real airlift...
            this.turns = eta(2, this.kind);
            this.kind=9;
            Game.robots[1][0]+=1;
            this.robotInUse = 1;
            this.digCavern(x,y,lowerTile,Game.level + 1,true,1000);
        } else {
            notify("Can't dig here...");
        }
    };

    /*digCavern takes the x & y coordinates of the clicked upon tile, the level (0-4) you want the cavern built on (to allow for digging down)
    a boolean 'nearWallKnown' (true if digging down, false otherwise) and a willBe tile type so that we can place a building (airshaft) if necessary*/
    this.digCavern = function(x,y,tile,level,nearWallKnown,willBe){
        var nearWall = nearWallKnown;
        var adj;
        var free;

        for(var i = 0; i<6;i++){
                adj = returnLevel(level)[adjacent(x,y, i)[0]][adjacent(x,y, i)[1]][1];
                if(adj.diggable){
                    nearWall = true;
                }
            }
        if(level > 0 && !wetTest([y,x], level) && nearWall && !tile.wip && Game.robots[1][0] < Game.robots[1][1] && !this.exists){
            Game.robots[1][0]+=1;
            tile.robotInUse = 1;
            willBe >= 0 ? tile.willBe=willBe : tile.willBe = willBe+5; //this is for if we try to do it on prepared terrain
            tile.wip = true;
            tile.turns = eta(2, this.kind);
            tile.kind=9;
            for(var i = 0; i<6;i++){
                adj = returnLevel(level)[adjacent(x,y, i)[0]][adjacent(x,y, i)[1]][1];
                if(adj.kind !== 4 && !wetTest(adjacent(x,y, i), level) && !adj.diggable && !adj.wip && adj.kind>4 && !adj.exists){
                    adj.turns = eta(2, adj.kind);
                    adj.willBe = adj.kind - 5;
                    adj.kind = 9;
                    adj.wip = true;
                    adj.willBeDiggable = true;
                }
            }
        } else {
            notify("You can't dig a cavern here...");
        }
    };

    this.mine = function(x,y,lowerTile){
        var wet = false;
        for(var i = 0; i<6;i++){
                if(wetTest(adjacent(x,y, i), Game.level)){
                    wet = true;
                }
            }
        if(Game.level < 4 && lowerTile.kind !== 4 && !this.wip && this.diggable && !lowerTile.diggable && Game.robots[3][0] < Game.robots[3][1]){
            Game.robots[3][0] += 1;
            this.robotInUse = 3;
            this.turns = eta(5, this.kind);
            this.kind=10;
            this.wip = true;
            this.willBe = 1100;
            lowerTile.turns = eta(5, lowerTile.kind);
            lowerTile.wip = true;
            lowerTile.willBe = 1100;
            lowerTile.willBeDiggable = true;
            lowerTile.kind = 10;
        } else {
            notify("You can't mine here...");
        }
        //TODO: get the resoures from this and adjacent tiles...
    };

    this.recycle = function(){
        if(!wip && this.kind !== 4 && Game.robots[2][0] < Game.robots[2][1]){
            this.turns = eta(3, this.kind);
            this.kind=11;
            this.wip = true;
            this.willBe = 3;
            Game.robots[2][0] +=1;
            this.robotInUse = 2;
        } else {
            notify("You can't recycle this...");
        }
        //TODO: get the resoures from the recycled building if I can...
    };

    function eta(baseTurns, kind){
        //calculates the turns necessary to do something on this terrain
        if(kind === 1 || kind === 6){
            return Math.floor(baseTurns*1.5);
        }else if (kind === 2 || kind === 7){
            return Math.floor(baseTurns*2.4);
        } else {
            return baseTurns;
        }
    };

    this.build = function(building, health, turns) {
        if (this.kind === 3){
            this.kind = 8; //TODO: replace with a construction animation
            if(this.UG){
                this.willBe = building + 1; //TODO: if underground add 1 and have a different tile for underground ones...
            }else{
                this.willBe = building;
            }
            this.wip = true;
            this.health = health; //health of building
            this.turns = turns;
            this.exists = true;
            this.age = 0;
        }
    };

}
/*
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
*/
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
    this.buildings = ['agri','arp','command','connector','clichy','research', 'store', 'warehouse', 'hab', 'workshop', 'commarray', 'genfab', 'oreproc'];
    this.robots = [[0,5], [0,3], [0,1],[0,1]];//number of drones: dozer/digger/recycler/miner [current/max]
    
    //Map generation vars
    this.seeder = '';
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
    checkBuildings();
}

function checkBuildings(){
    for(var i = 0; i<Game.buildings.length; i++){
        console.log(Game.buildings[i]);
        document.getElementById(Game.buildings[i]).style.display = 'table';
    }
}

function notify(notif){
    var notification =  document.getElementById('notifications');
    notification.innerHTML= '';
    notification.innerHTML= notif;
    notification.style.width = 700 + 'px';
    setTimeout(
        function(){
            notification.style.width = 0;
        }, 
        2800);
}

function overCanvas(bool, which){
    /*
    * Event listeners track the mouse movements. 
    * N.B.: You need to track on the topmost layer!!!
    */
    if (bool && which == 'mPan'){
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
    drawRadar();
    Game.turnNum.innerHTML = "Week: " + Game.turn;
    //The following hold code just prevents accidentally skipping two turns with accidental clicks...
    document.getElementById('turn').disabled = true;
    setTimeout(function(){document.getElementById('turn').disabled = false},300);
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
    document.getElementById('buildingContainer').style.height = percentage+2 + '%';
    document.getElementById('droneContainer').style.height = 97.5-percentage + '%';
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
            document.getElementById('slider').value = Game.level;        
            break;
        case 49:
            Game.level = 1;
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 50:
            Game.level = 2;
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 51:
            Game.level = 3;
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 52:
            Game.level = 4;
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 27:
            Game.clickedOn = null;
            document.body.style.cursor="url('images/pointer.png'), default";
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
            document.getElementById('slider').value = Game.level;        
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
        case 6:
            return [y-1,x];
        case 2:
        case 8:
            return [y,x+1];
        case 3:
        case 10:
            return [y+1,x];
        case 4:
            return [y+1,x-1];
        case 5:
        case 11:
            return [y,x-1];
        case 7:
            return [y-1,x+1];
        case 9:
            return [y+1,x+1];
        default:
            console.log('There was a problem jim, x:' + x + ' y:' + y + ' index:' + index);
    }
}
//tests if any of the adjacent tiles are wet...
function wetTest(yxArray, level){
    var yxArray  = yxArray.slice(0);
    for(var i=0;i<6;i++){
        var tileToTest = returnLevel(level)[adjacent(yxArray[1],yxArray[0], i)[0]][adjacent(yxArray[1],yxArray[0], i)[1]][1];
        if(tileToTest.kind === 4){
            return true;
        }
    }
    return false;
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
                switch(kind) {
                    case 0:
                    case 5:
                        radarPixels.data[idx + 0] = 212;
                        radarPixels.data[idx + 1] = 197;
                        radarPixels.data[idx + 2] = 174;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 1:
                    case 6:
                        radarPixels.data[idx + 0] = 201;
                        radarPixels.data[idx + 1] = 179;
                        radarPixels.data[idx + 2] = 165;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 2:
                    case 7:
                        radarPixels.data[idx + 0] = 211;
                        radarPixels.data[idx + 1] = 206;
                        radarPixels.data[idx + 2] = 203;
                        radarPixels.data[idx + 3] = 255;
                        break;
                    case 3:
                        radarPixels.data[idx + 0] = 0;
                        radarPixels.data[idx + 1] = 132;
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
                    if(Game.level > 0 && kind < 8){
                        radarPixels.data[idx + i] - 100 >= 0 ? radarPixels.data[idx + i] -= 100 : radarPixels.data[idx + i] = 0;
                    }else{
                        //radarPixels.data[idx + i] += 0;//leave as is...
                    }
                }
            }
        }
    }
    Game.radar.putImageData(radarPixels, 0, 0);
    Game.radar.fillStyle="#ffffff";
    Game.radar.font="14px Arial";
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
            } else if (tileType !== 4 && tileType < 8){
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
function clicked() {
    var y = Game.retY+getTile('y')-5;
    var x = Game.retX+getTile('x')-5;
    //var kind;
    var tile = returnLevel(Game.level)[y][x][1];
    var lowerTile = returnLevel(Game.level + 1)[y][x][1];
    switch (Game.clickedOn) {
        case 'dozer':
            tile.prepare();
            break;
        case 'digger':
        //This let's me dig down to create airshafts
            tile.digDown(x,y,lowerTile);
            break;
        case 'cavernDigger':
            tile.digCavern(x,y,tile,Game.level,false,tile.kind-5);
            break;
        case 'miner':
            tile.mine(x,y,lowerTile);
            break;
        case 'recycler':
            tile.recycle();
            //TODO: add recycle code
            break;
        case 'agri':
            if(Game.level === 0){
                tile.build(7,70,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'agri2':
            if(Game.level === 0){
                tile.build(7,90,3); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'airport':
            if(Game.level === 0){
                tile.build(7,60,3); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'arp':
            tile.build(7,80,2);
            break;
        case 'barracks':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,60,3); //TODO: change this to a real connector...
            }
            break;
        case 'civprot':
            tile.build(7,70,2);
            break;
        case 'civprot2':
            tile.build(7,90,2);
            break;
        case 'command':
            tile.build(7,100,2);
            break;
        case 'commarray':
            if(Game.level === 0){
                tile.build(7,60,1); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'commarray2':
            if(Game.level === 0){
                tile.build(7,80,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'connector':
            tile.build(7,20,1); //TODO: change this to a real connector...
            break;
        case 'dronefab':
            if(Game.level === 0){
                tile.build(7,80,4); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'chernobyl':
            if(Game.level === 0){
                tile.build(7,70,4); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'tokamak':
            if(Game.level === 0){
                tile.build(7,90,5); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'genfab':
            if(Game.level === 0){
                tile.build(7,70,3); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'geotherm':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,70,4); //TODO: change this to a real connector...
            }
            break;
        case 'hab':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,70,2); //TODO: change this to a real connector...
            }
            break;
        case 'hab2':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,80,3); //TODO: change this to a real connector...
            }
            break;
        case 'hab3':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,90,4); //TODO: change this to a real connector...
            }
            break;
        case 'er':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,80,3); //TODO: change this to a real connector...
            }
            break;
        case 'nursery':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,70,2); //TODO: change this to a real connector...
            }
            break;
        case 'oreproc':
            if(Game.level === 0){
                tile.build(7,80,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'rec':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,60,3); //TODO: change this to a real connector...
            }
            break;
        case 'recycler':
            if(Game.level === 0){
                tile.build(7,70,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'clichy':
            tile.build(7,30,2);
            break;
        case 'research':
            tile.build(7,80,3);
            break;
        case 'research2':
            tile.build(7,60,4);
            break;
        case 'solar':
            if(Game.level === 0){
                tile.build(7,30,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'space':
            if(Game.level === 0){
                tile.build(7,80,5); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'stasis':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,100,4); //TODO: change this to a real connector...
            }
            break;
        case 'store':
            tile.build(7,40,1);
            break;
        case 'uni':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,70,2); //TODO: change this to a real connector...
            }
            break;
        case 'warehouse':
            tile.build(7,40,1);
            break;
        case 'windfarm':
            if(Game.level === 0){
                tile.build(7,40,2); //TODO: change this to a real connector...
            } else {
                notify('This is a surface construction...');
            }
            break;
        case 'workshop':
            if(Game.level === 0){
                notify('This is a sub-surface construction...');
            } else {
                tile.build(7,70,3); //TODO: change this to a real connector...
            }
            break;
        default:
            console.log("I don't recognise that building code...")
    }
    drawZoomMap();
    drawRadar();
}

function construct(id) {
    //When I click on a menu item, this remembers what it is _unless_ I click again, in which case, it forgets
    if (Game.clickedOn === id) {
        Game.clickedOn = 'none';
        document.body.style.cursor="url('images/pointer.png'), default";
    } else {
        Game.clickedOn = id;
        switch(id){
            case 'dozer':
                document.body.style.cursor="url('images/dozer.png'), default";
                break;
            case 'miner':
                document.body.style.cursor="url('images/miner.png'), default";
                break;
            case 'digger':
                document.body.style.cursor="url('images/digger.png'), default";
                break;
            case 'cavernDigger':
                document.body.style.cursor="url('images/digger.png'), default";
                break;
            case 'recycle':
                document.body.style.cursor="url('images/recycle.png'), default";
                break;
            //TODO: Change the pointers below to appropriate icons for the relevant building...
            case 'agri':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'agri2':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'airport':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'arp':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'barracks':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'civprot':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'civprot2':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'command':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'commarray':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'commarray2':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'connector':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'dronefab':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'chernobyl':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'tokamak':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'genfab':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'geotherm':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'hab':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'hab2':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'hab3':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'er':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'nursery':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'oreproc':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'rec':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'recycler':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'clichy':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'research':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'research2':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'solar':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'space':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'stasis':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'store':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'uni':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'warehouse':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'windfarm':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            case 'workshop':
                document.body.style.cursor="url('images/build.png'), default";
                break;
            default:
                console.log("There was a problem finding out which building or drone you wanted...")
        }
    }
}