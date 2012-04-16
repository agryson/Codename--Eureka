var mPanel, map, mPan2d, map2d, tile, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight;

function init() {
    mPanel = document.getElementById('mainPanel');
    map = document.getElementById('map');
    mPan2d = mPanel.getContext('2d');
    map2d = map.getContext('2d');
    tile = new Image();
    tile.src = 'images/tiles.png';
    sourceX = 1200;
    sourceY = 0;
    sourceWidth = 400;
    sourceHeight = 346;
    destinationX = 0;
    destinationY = 0;
    destinationWidth = 400;
    destinationHeight = 346;
    mPan2d.drawImage(tile, sourceX, sourceY, sourceWidth, sourceHeight,
              destinationX, destinationY, destinationWidth, destinationHeight);
    console.log("testing");
}