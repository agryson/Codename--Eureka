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
    document.getElementById('thumb').style.WebkitTransform = 'translate(' + (-220 + incrementer * 44) + 'px, 0)';
    incrementer += 1;
  }
  var message = document.getElementById('loadMessage');
  switch(incrementer) {
  case 1:
    message.innerHTML = 'Engage!   ';
    break;
  case 2:
    message.innerHTML = 'Going to Warp 11';
    break;
  case 3:
    message.innerHTML = 'Entering Orbit';
    break;
  case 4:
    message.innerHTML = 'Dropping probes';
    break;
  case 5:
    message.innerHTML = 'Calling Houston';
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
  var map = returnLevel(Game.level);

  for(var y = 0; y < Game.radarRad * 2; y++) {
    map[y] = new Array(Game.radarRad * 2); //create an array to hold the x cell, we now have a 200x200 2d array
    for(var x = 0; x < Game.radarRad * 2; x++) {
      map[y][x] = new Array(2); //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
      map[y][x][0] = true; //invert axes because referencing the array is not like referencing a graph
      map[y][x][1] = new Terrain(); //if we're in the circle, assign a tile value
      map[y][x][1].ref = '#' + Game.level + ':' + ((x - 150)) + ':' + ((y - 150) * (-1));
      map[y][x][1].altitude = altitude(x, y, Game.level);
      setType(x, y, Game.level);
      //map[y][x][1].resources = new Array(2); //insert the number of resources we'll be looking for
    }
  }
  if(Game.level === 0) {
    generateRivers(40);
  }
  generateResources(map);
  Game.level += 1;
  if(Game.level < 5) {
    increment();
    console.log(Game.level);
    setTimeout(createMap, 450);
  } else {
    Game.level = 0; /*draw the radar background & map once on load*/
    drawRadar();
    drawLoc();
    mapFit(true);
    drawZoomMap();
    //start mainloop
    popup.style.opacity = '0';
    document.getElementById('login').onclick = null;
    document.getElementById('newSession').onclick = null;
    popup.addEventListener('webkitTransitionEnd', function() {
      popup.style.zIndex = '-1';
    }, false);
    //Sounds
    Game.music.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    music();
    //!Sounds
  }
}

function generateRivers(iterations) {
  var x, y;
  for(var i = 0; i < iterations; i++) {
    x = randGen(Game.radarRad * 2, 0);
    y = randGen(Game.radarRad * 2, 0);
    if(Game.map[y][x][1].kind === 2 || Game.map[y][x][1].kind === 1) {
      slide(x, y);
    } else {
      iterations += 1;
    }
  }
}

function slide(x, y) {
  //console.log('x: ' + x + ' y: '+ y);
  var randIndex = Math.floor(Math.random() * 6);
  while(x > 0 && x < Game.radarRad * 2 && y < Game.radarRad * 2 && y > 0 && Game.map[y][x][1].kind !== 4) {
    Game.map[y][x][1].kind = 4;
    Game.map[y][x][1].diggable = false;
    Game.map[y][x][1].ref = changeName(Lang.water, Game.map[y][x][1].ref);
    var lowest = [adjacent(x, y, randIndex)[1], adjacent(x, y, randIndex)[0]]; //x, y
    for(var j = 0; j < 6; j++) {
      if(x > 1 && x < (Game.radarRad * 2) - 1 && y < (Game.radarRad * 2) - 1 && y > 1 && Game.map[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].altitude < Game.map[lowest[1]][lowest[0]][1].altitude && Game.map[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].kind !== 4) {
        lowest[1] = adjacent(x, y, j)[0];
        lowest[0] = adjacent(x, y, j)[1];
      }
    }
    slide(lowest[0], lowest[1]);
  }
  //generateRivers(iterations-1);
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
    map.ref = map.ref.insert(0, Lang.mountaineous + ' ');
  } else if(altitude >= med) {
    map.kind = 1 + increment;
    map.ref = map.ref.insert(0, Lang.rough + ' ');
  } else if(altitude >= low) {
    map.kind = 0 + increment;
    map.ref = map.ref.insert(0, Lang.smooth + ' ');
  } else {
    map.kind = 4;
    map.ref = map.ref.insert(0, Lang.water + ' ');
  }
  level === 0 && map.kind !== 4 ? map.diggable = true : map.diggable = false;
  level === 0 ? map.UG = false : map.UG = true;
}

function generateResources(map) {
  var resourceArray = [ //[MAXALT,MINALT,DENSITY,SPREAD]
  [190, 160, 40, 60],//Bauxite", "Aluminium (Al)"
  [190, 160, 20, 10],//Corundum", "Aluminium (Al)"
  [220, 160, 10, 10],//Kryolite", "Aluminium (Al)"
  [220, 150, 60, 130],//Haematite", "Iron (Fe)"
  [200, 160, 30, 60],//Magnetite", "Iron (Fe)"
  [230, 170, 40, 150],//Iron Pyrite", "Iron (Fe)"
  [220, 160, 20, 40],//Siderite", "Iron (Fe)"
  [200, 100, 50, 130],//Copper Pyrite", "Copper (Cu)"
  [180, 100, 30, 120],//Copper Glance", "Copper (Cu)"
  [200, 90, 40, 80],//Malachite", "Copper (Cu)"
  [120, 90, 30, 90],//Zinc Blende", "Zinc (Zn)"
  [150, 90, 20, 40],//Calamine", "Zinc (Zn)"
  [100, 90, 10, 100],//Rock Salt", "Sodium (Na)"
  [130, 90, 20, 60],//Sodium Carbonate", "Sodium (Na)"
  [110, 90, 10, 30],//Karnalite", "Potassium (K)"
  [130, 90, 20, 80],//Salt Petre", "Potassium (K)"
  [150, 130, 20, 20],//Galena", "Lead (Pb)"
  [160, 130, 10, 10],//Anglesite", "Lead (Pb)"
  [140, 100, 30, 100],//Tin Pyrites", "Tin (Sn)"
  [130, 120, 20, 40],//Cassiterite", "Tin (Sn)"
  [180, 170, 10, 20],//"Silver Glance", "Silver"
  [100, 90, 10, 5],//Calverite", "Gold (Au)"
  [110, 90, 3, 3],//Syvanite", "Gold (Au)"
  [160, 130, 10, 20],//Cinnabar", "Mercury (Hg)"
  [150, 140, 5, 5],//Calomel", "Mercury (Hg)"
  [130, 90, 50, 80],//Dolomite", "Magnesium (Mg)"
  [200, 160, 20, 40],//Karnalite", "Magnesium (Mg)"
  [200, 90, 90, 200],//Limestone", "Calcium (Ca)"
  [170, 140, 30, 40],//Phosphorite", "Phosphorous (P)"
  [180, 130, 10, 20]//Floreapetite", "Phosphorous (P)"
    ];
  var limit = (Game.radarRad * 2) - 1;
  var x = randGen(Game.radarRad * 2, 0);
  var y = randGen(Game.radarRad * 2, 0);
  var sameAbove = false;
  for(var i = 0; i < resourceArray.length; i++) {
    if(Game.level === 0 || returnLevel(Game.level - 1)[y][x][1].resources[i]){
    for(var iter = 0; iter < resourceArray[i][3]; iter++) {
        var testAltitude = map[y][x][1].altitude;
        if(testAltitude < (resourceArray[i][0] + (Game.level*6)) && testAltitude > resourceArray[i][1] && x > 0 && x < limit && y < limit && y > 0 && map[y][x][1].kind !== 4) {
          map[y][x][1].resources[i] = randGen(resourceArray[i][2], 1);
          map[y][x][1].mineable = true;
          map[y][x][1].kind = 8; //tester
          var check = sameLevel(map, x, y, i);
          for(var count = 0; count < 6; count++) {
            var tempX = adjacent(x, y, count)[1];
            var tempY = adjacent(x, y, count)[0];
            if(map[tempY][tempX][1].kind !== 4 && (tempY != check[0] && tempX != check[1])) {
              map[tempY][tempX][1].resources[i] = randGen(resourceArray[i][2], 1);
              map[tempY][tempX][1].mineable = true;
              map[tempY][tempX][1].kind = 8; //This is just so that we can see it until I get the radar sorted...
            }
          }
          x < Game.radarRad * 2 - 1 && x > 0 ? x = check[1] : x = randGen(Game.radarRad * 2, 0);
          y < Game.radarRad * 2 - 1 && y > 0 ? y = check[0] : y = randGen(Game.radarRad * 2, 0);
        } else {
          iter -= 1;
          x = randGen(Game.radarRad * 2, 0);
          y = randGen(Game.radarRad * 2, 0);
        }
      }
      } else {
        i -= 1;
        x = randGen(Game.radarRad * 2, 0);
        y = randGen(Game.radarRad * 2, 0);
      }
  }

}

function sameLevel(map, x, y, i) {
  var current = map[y][x][1].altitude;
  var randIndex = Math.floor(Math.random() * 6);
  var closest = [adjacent(x, y, randIndex)[0], adjacent(x, y, randIndex)[1]];
  var next = map[adjacent(x, y, randIndex)[0]][adjacent(x, y, randIndex)[1]][1].altitude;
  for(var count = 0; count < 6; count++) {
    var nextTest = map[adjacent(x, y, count)[0]][adjacent(x, y, count)[1]][1].altitude;
    if(Math.abs(next - current) > Math.abs(nextTest - current) && !map[adjacent(x, y, count)[0]][adjacent(x, y, count)[1]][1].resources[i]) {
      next = nextTest;
      closest = [adjacent(x, y, count)[0], adjacent(x, y, count)[1]];
    }
  }
  return closest;
}