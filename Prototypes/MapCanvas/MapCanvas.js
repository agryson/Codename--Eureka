var mPanel, map, tile, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight;

function init() {
    mPanel = document.getElementById('mainPanel').getContext('2d');
    map = document.getElementById('map').getContext('2d');
    drawBack();
    sourceWidth = 400;
    sourceHeight = 346;
    destinationWidth = 200;
    destinationHeight = 173;
    tile = new Image();
    tile.src = 'images/tiles.png';
    tile.onload = function() {
        mainLogic();
    };
}

function drawBack() {
    var backPanel = document.getElementById('borderPanel').getContext('2d');
    backPanel.fillStyle="#555555";
    backPanel.fillRect(0,0,710,710);
}

function drawTile(tileType, tilePos) {
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
    switch (tilePos) {
        case 1:
            destinationX = 0;
            destinationY = 0;
            break;
        case 2:
            destinationX = 300;
            destinationY = 0;
            break;
        case 3:
            destinationX = 600;
            destinationY = 0;
            break;
        case 4:
            destinationX = 150;
            destinationY = 86;
            break;
        case 5:
            destinationX = 450;
            destinationY = 86;
            break;
        default:
            break;
    }
    mPanel.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
              destinationX, destinationY, destinationWidth, destinationHeight); 
}

function mainLogic() {
    drawTile(1,1);
    drawTile(3,2);
    drawTile(4,3);
    drawTile(8,4);
    drawTile(5,5);
}