//WORLD GENERATION****************************************************************
/**
 * Accepts and parses the seed before passing it to the world generator
 * @param  {boolean} newGame Is this a new game or not?
 * @return {nothing}
 */
function getSeed(newGame) {
  var input = document.getElementById('seed').value;
  var popup = document.getElementById("popupContainer");
  var seedString = '';
  document.getElementById('login').disabled = true;
  document.getElementById('newSession').disabled = true;
  console.log('called getSeed');
  if(!newGame && input !== '') { //If I've entered a seed
    console.log('called');
    input = input.split(' ').join('');
    for(var i = 0; i < input.length; i++) {
      seedString += input.charCodeAt(i);
    }
    console.log(seedString);
    seedString = parseInt(seedString, 10) / Math.pow(10, input.length);
    Game.seeder = seedString;
  } else if(!newGame && input === '') {
    alert('Please enter your dashboard password or start a new session...');
    document.getElementById('login').disabled = false;
    document.getElementById('newSession').disabled = false;
  } else if(newGame) {
    Game.seeder = new Date().getTime();
  }

  if(Game.seeder !== '') {
    document.getElementById('loader').style.height = 3 + 'px';
    increment();
    document.onkeydown = keypressed; //keyboard listener
    setTimeout(function() {
      Game.rng = new MersenneTwister(Game.seeder);
      Game.noise = new ClassicalNoise(Game.rng);
      Game.noise2 = new ClassicalNoise(Game.rng);
      Game.noise3 = new ClassicalNoise(Game.rng);
      createMap();
    }, 50);
  }
}
/**
 * Sets altitude according to the world generator results
 * @param  {int} x     X coordinate for the tie we're getting altitude for
 * @param  {int} y     Y coordinate for the tile we're gettign altitude for
 * @param  {int} level What level are we workign on?
 * @return {int}       The altitude for the tile
 */
function altitude(x, y, level) {
  if(level === 0) {
    var gridSize = 75;
    var n = (Game.noise.noise(x / gridSize, y / gridSize, 0) + 1) * 127;
    var n2 = (Game.noise2.noise(x / (gridSize / 2), y / (gridSize / 2), 0) + 1) * 127;
    var n3 = (Game.noise3.noise(x / (gridSize / 4), y / (gridSize / 4), 0) + 1) * 127;
    return Math.round((n + n2 + n3) / 3);
  } else {
    return Game.map[y][x][1].altitude + level * 5;
  }
}
/**
 * A global var for the incrementer function to keep track of where it is
 * @type {Number}
 */
var incrementer = 1;

/**
 * Increments the loader bar
 * @return {nothing}
 */
function increment() {
  if(incrementer < 6) {
    document.getElementById('thumb').style.width = incrementer * 20 + '%';
    incrementer += 1;
  }
  var mess = document.getElementById('loadMessage');
  switch(incrementer) {
  case 1:
    mess.innerHTML = 'Engage!   ';
    break;
  case 2:
    mess.innerHTML = 'Going to Warp 11';
    break;
  case 3:
    mess.innerHTML = 'Entering Orbit';
    break;
  case 4:
    mess.innerHTML = 'Dropping probes';
    break;
  case 5:
    mess.innerHTML = 'Calling Houston';
    break;
  default:
    //Do nothing
  }
}

/*creates the map*/
/**
 * Creates the map Array
 * @return {nothing}
 */
function createMap() {
  var popup = document.getElementById("popupContainer");
  var map = [];

  switch(Game.level) {
  case 0:
    map = Game.map;
    Game.level = 0;
    break;
  case 1:
    map = Game.map1;
    Game.level = 1;
    break;
  case 2:
    map = Game.map2;
    Game.level = 2;
    break;
  case 3:
    map = Game.map3;
    Game.level = 3;
    break;
  case 4:
    map = Game.map4;
    Game.level = 4;
    break;
  default:
    console.log('There was a problem with creating level... ' + Game.level);
  }

  for(var y = 0; y < Game.radarRad * 2; y++) {
    map[y] = new Array(Game.radarRad * 2); //create an array to hold the x cell, we now have a 200x200 2d array
    for(var x = 0; x < Game.radarRad * 2; x++) {
      map[y][x] = new Array(2); //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
      if(distance(x, y, Game.radarRad, Game.radarRad) <= Game.radarRad) { //check the radius, mark true if it's mapped, mark false if it's not in the circle
        map[y][x][0] = true; //invert axes because referencing the array is not like referencing a graph
        map[y][x][1] = new Terrain(); //if we're in the circle, assign a tile value
        map[y][x][1].altitude = altitude(x, y, Game.level);
        setType(x, y, Game.level);
        map[y][x][1].resources = new Array(2); //insert the number of resources we'll be looking for
        generateResources(x, y, map[y][x][1].kind, Game.level);
      } else {
        map[y][x][0] = false;
      }
    }
  }
  Game.level += 1;
  if(Game.level < 5) {
    increment();
    setTimeout(createMap, 450);
  } else {
    Game.level = 0; /*draw the radar background & map once on load*/
    drawRadar();
    drawLoc();
    drawZoomMap();
    //start mainloop
    mainLoop();
    popup.style.opacity = '0';
    popup.addEventListener('webkitTransitionEnd', function() {
      popup.style.zIndex = '-1';
    }, false);
  }
}


/**
 * Sets the tile type as a function of altitude
 * @param {int} x     X coordinate of the tile we're at
 * @param {int} y     Y coordiante of the tile we're at
 * @param {int} level The Level we're working with
 */
function setType(x, y, level) {
  var high = 160;
  var med = 130;
  var low = 90;
  var map = returnLevel(level)[y][x][1];
  var altitude = map.altitude;
  var increment;
  level > 0 ? increment = 5 : increment = 0;

  if(altitude >= high) {
    map.kind = 2 + increment;
  } else if(altitude >= med) {
    map.kind = 1 + increment;
  } else if(altitude >= low) {
    map.kind = 0 + increment;
  } else {
    map.kind = 4;
  }
  level === 0 && map.kind !== 4 ? map.diggable = true : map.diggable = false;
  level === 0 ? map.UG = false : map.UG = true;
}


/**
 * sets the resources appropriately for the terrain type at x,y
 * @param  {int} x       X coordinate fo rthe tile we're at
 * @param  {int} y       Y coordiante for the tile we're at
 * @param  {int} terrain Kind of terrain we're on
 * @param  {int} level   The level we're working on
 * @return {nothing}
 */
function generateResources(x, y, terrain, level) {
  var map;
  level === 0 ? map = returnLevel(level)[y][x][1] : map = Game.map[y][x][1];

  switch(terrain) {
  case 0:
    map.resources[0] = randGen(2, 0);
    map.resources[1] = randGen(2, 0);
    break;
  case 1:
    map.resources[0] = randGen(5, 10);
    map.resources[1] = randGen(5, 10);
    break;
  case 2:
    map.resources[0] = randGen(5, 20);
    map.resources[1] = randGen(5, 20);
    break;
  default:
    //do nothing
  }
}