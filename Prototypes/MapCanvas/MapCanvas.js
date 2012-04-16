var mPanel, map, tile, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight;

function init() {
    mPanel = document.getElementById('mainPanel').getContext('2d');
    map = document.getElementById('map').getContext('2d');
    drawBack();
    sourceWidth = 400;
    sourceHeight = 346;
    destinationWidth = 70; //If I want 13 tiles across... for s=35
    destinationHeight = 61;
    tile = new Image();
    tile.src = 'images/tiles.png';
    tile.onload = function() {
        drawZoomMap();
    };
}

function drawBack() {
    var backPanel = document.getElementById('borderPanel').getContext('2d');
    backPanel.fillStyle="#555555";
    backPanel.fillRect(0,0,710,710);
}

function drawTile(tileType, tilePosX, tilePosY) {
    destinationX = Math.floor(tilePosX*(destinationWidth*0.75));                //0.75 is the equivalent to h+s
    if (tilePosX%2 !== 0) {                                                     //if the column is odd...
        destinationY = Math.floor((tilePosY+1)*(destinationHeight));            //we need to displace it vertically
    } else {                                                                    //if it’s even though
	    destinationY = Math.floor(tilePosY*destinationHeight+destinationHeight/2);              //we just set the vertical displace normally
    }
    switch (tileType) {
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

function randTile() {
    return Math.floor((Math.random()*9)+1);
}