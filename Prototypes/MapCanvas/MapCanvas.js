var mPanel, map, tile; //General page vars
var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight; //Canvas vars

//Set up any global stuff that won't ever change after page load
function init() {
    mPanel = document.getElementById('mainPanel').getContext('2d');
    map = document.getElementById('map').getContext('2d');
    drawMockup();
    sourceWidth = 400;                                                          //original tile width
    sourceHeight = 346;                                                         //original tile height
    destinationWidth = 70;                                                      //tile width on zoomMap... If I want 13 tiles across... for s=35
    destinationHeight = 61;                                                     //tile height on zoomMap
    tile = new Image();                                                         //create the spritesheet object
    tile.src = 'images/tiles.png';                                              //tell script where spritesheet is
    tile.onload = function() {                                                  //for some reason I need this to be an anonymous function... why?
        drawZoomMap();                                                          //draw the zoomMap
    };
    document.onkeydown = keydown;                                               //key listener
}

/*detect when the up key is pressed*/
function keydown(e) {
    if (e.keyCode == 38) {
        drawZoomMap();
    }

}

//this function is just a placeholder to give us a background on the elements so we can see placement
function drawMockup() {
    var backPanel = document.getElementById('borderPanel').getContext('2d');
    backPanel.fillStyle= "#00FF00";
    backPanel.fillRect(0,0,720,720);
    backPanel.beginPath();
    backPanel.arc(360,350,350,0,Math.PI*2,true);
    backPanel.fillStyle= "#000";
    backPanel.fill();
    map.fillStyle= "#FF0000";
    map.fillRect(0,0,720,720);
    map.beginPath();
    map.arc(100,100,95,0,Math.PI*2,true);
    map.fillStyle= "#000";
    map.fill();
}

//this function accepts the type of tile to draw, the x column number and the y column number
function drawTile(tileType, tilePosX, tilePosY) {
    destinationX = Math.floor(tilePosX*(destinationWidth*0.75));                //0.75 is the equivalent to h+s
    if (tilePosX%2 !== 0) {                                                     //if the column is odd...
        destinationY = Math.floor((tilePosY+1)*(destinationHeight));            //we need to displace it vertically
    } else {                                                                    //if it’s even though
	    destinationY = Math.floor(tilePosY*destinationHeight+destinationHeight/2);//we just set the vertical displace normally
    }
    switch (tileType) {                                                         //we cut the desired tile out of the spritesheet here, this switch is likely to get VERY long!
        case 1:
            sourceX = 0;
            sourceY = 0;
            break;
        case 2:
            sourceX = 400;
            sourceY = 0;
            break;
        case 3:
            sourceX = 800;
            sourceY = 0;
            break;
        case 4:
            sourceX = 1200;
            sourceY = 0;
            break;
        case 5:
            sourceX = 1600;
            sourceY = 0;
            break;
        case 6:
            sourceX = 0;
            sourceY = 346;
            break;
        case 7:
            sourceX = 400;
            sourceY = 346;
            break;
        case 8:
            sourceX = 800;
            sourceY = 346;
            break;
        case 9:
            sourceX = 1200;
            sourceY = 346;
            break;
        case 10:
            sourceX = 1600;
            sourceY = 346;
            break;
        default:
            break;
    }
    mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
              destinationX, destinationY, destinationWidth, destinationHeight); 
}

//this draws the tiles but will need to be changed when we're not in the prototype
function drawZoomMap() {
    var i;
    var j=0;
    
    for(i=3; i<10; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=2; i<11; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=1; i<12; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=1; i<12; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=0; i<13; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=0; i<13; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=1; i<12; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=2; i<11; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=2; i<11; i++) {
        drawTile(randTile(),i,j);
    }
    j+=1;
    for(i=4; i<9; i++) {
        drawTile(randTile(),i,j);
    }
}

//This function just generates random tiles for us to test performance
function randTile() {
    return Math.floor((Math.random()*9)+1);
}