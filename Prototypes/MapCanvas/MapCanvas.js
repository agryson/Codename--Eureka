//TODO: clean up variable names, improve comments

var mPanel, radar, radarLoc, map, tile, retX, retY, animate, radLimit, zoomMap; //General page vars

//Set up any global stuff that won't ever change after page load
function init() {
    /*get the canvas contexts*/
    mPanel = document.getElementById('mainPanel').getContext('2d');
    radar = document.getElementById('map').getContext('2d');
    radarLoc = document.getElementById('mapOverlay').getContext('2d');
    
    /*colour the canvases so we can see their relative sizes*/
    drawMockup();
    
    /*create the zoomed map grid references for use later*/ 
    zoomMap =new Array;
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
    retX=100;
    retY=100;
    animate=0;
    radLimit=95;
    
    /*create the game's map*/
    map = new Array(200);
    createMap();

    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is
    tile.onload = function() {                                                  //for some reason I need this to be an anonymous function... why?
        drawZoomMap();                                                          //draw the zoomMap
    };
    
    document.onkeydown = keydown;                                               //key listener 
    drawLoc();
    mainLoop();
}

/*the main game loop*/
function mainLoop() {
    if (animate==4){
       animate = 0;
    } else {
        animate +=1;
    }
    drawZoomMap();
     setTimeout(mainLoop, 200); //set the framerate here
}

/*detect when the up key is pressed*/
function keydown(e) {
    if (e.keyCode == 38 && radius(retX,upY)<radLimit) {
        move('up');
    }
    drawLoc();
}

//shifts our reference reticule (if possible), then redraws the map
function move(dir) {
    var upY = retY-2;
    var downY=retY+2;
    var leftX=retX-2;
    var rightX=retX+2;
    
    switch(dir) {
        case 'up':
	        if(radius(retX,upY)<radLimit) {
	          retY = upY;
          };
          break;
          
        case 'down':
        	 if(radius(retX,downY)<radLimit) {
	         	retY = downY;
          };
          break;
          
        case 'left':
        	 if(radius(leftX,retY)<radLimit) {
	         	retX = leftX;
          };
          break;
          
        case 'right':
        	 if(radius(rightX,retY)<radLimit) {
	         	retX = rightX;
          };
          break;
          
        default:
          break;
  }
  drawZoomMap();
  drawLoc();
}

//this function is just a placeholder to give us a background on the elements so we can see placement
function drawMockup() {
    var backPanel = document.getElementById('borderPanel').getContext('2d');
    backPanel.fillStyle= "#FF0000";
    backPanel.fillRect(0,0,720,720);
    radar.beginPath();
    radar.arc(100,100,100,0,Math.PI*2,true);
    radar.fillStyle= "#000";
    radar.fill();
}

//accepts the type of tile to draw, the x column number and the y column number, then draws it
function drawTile(tileType, tilePosX, tilePosY) {
	 	var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight, test; //Canvas vars
	 	sourceWidth = 400;                                                          //original tile width
   	sourceHeight = 346;                                                         //original tile height
    	destinationWidth = 70;                                                      //tile width on zoomMap... If I want 13 tiles across... for s=35
    	destinationHeight = 61; 																						 //tile height on zoomMap                                                 
    sourceX = animate*400;
    sourceY = tileType*346;
    destinationX = Math.floor(tilePosX*(destinationWidth*0.75));                //0.75 is the equivalent to h+s
    if (tilePosX%2 !== 0) {                                                     //if the column is odd...
        destinationY = Math.floor((tilePosY+1)*(destinationHeight));            //we need to displace it vertically
    } else {                                                                    //if it’s even though

	    destinationY = Math.floor(tilePosY*destinationHeight+destinationHeight/2);//we just set the vertical displace normally
    }

    mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
              destinationX, destinationY, destinationWidth, destinationHeight); 
}

//creates the map
function createMap() {
	var x;
	var y;
	for(y=0;y<200;y++) {
		map[y]=new Array(200); //create an array to hold the x cell, we now have a 200x200 2d array
		for(x=0; x<200; x++) {
			 map[y][x]=new Array(2); //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when i set tiles as objects
			if(radius(x,y)<=100) { //check the radius, mark true if it's mapped, mark false if it's not in the circle
				map[y][x][0]=true; //invert axes because referencing the array is not like referencing a graph
				map[y][x][1]=randTile(); //if we're in the circle, assign a tile value
			}else{
				map[y][x][0]=false;
			}
		}
	}
}

//returns the distance of the given point from the centrepoint
function radius(xVal,yVal) {
	 return Math.sqrt((xVal-100)*(xVal-100)+(yVal-100)*(yVal-100));
}

//this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile
function drawZoomMap() {
    var j,k;
    for(j=0;j<zoomMap.length;j++) {
        k=zoomMap[j][0];
        end=zoomMap[j][1];
        while (k<end) {
            drawTile(map[(retY+j-5)][(retX+k-6)][1],k,j);
            k++;
        }
    }
}

//This function just generates random tiles for us to test performance
function randTile() {
    return Math.floor(Math.random()*2);
}

//draws the current location on the small radar map
function drawLoc() {   
    radarLoc.clearRect(0,0,200,200);
    radarLoc.beginPath();
    radarLoc.arc(retX,retY,7,0,Math.PI*2,true);
    radarLoc.fillStyle= "#FFF";
    radarLoc.fill();
    radarLoc.closePath();
}