//WORLD GENERATION****************************************************************
function NewGame(){
/**
 * Accepts and parses the seed before passing it to the world generator
 * @param  {boolean} newGame Is this a new game or not?
 * @return {nothing}
 */
  this.getSeed = function() {
    var input = document.getElementById('seed').value;
    Lang = new Language(input);
    var popup = document.getElementById("popupContainer");
    var seedString = '';
    var seeder;
    if(input !== '') { //If I've entered a seed
      document.getElementById('login').disabled = true;
      Game.inputSeed = input;
      input = input.split(' ').join('');
      for(var i = 0; i < input.length; i++) {
        seedString += input.charCodeAt(i);
      }
      seeder = parseInt(seedString, 10) / Math.pow(10, input.length);
    } else if(input === '') {
        document.getElementById('seed').focus();
    }

    if(typeof seeder === 'number') {
      document.onkeydown = keypressed; //keyboard listener
      setTimeout(function() {
        Game.rng = new MersenneTwister(seeder);
        Game.noise = new ClassicalNoise(Game.rng);
        Game.noise2 = new ClassicalNoise(Game.rng);
        Game.noise3 = new ClassicalNoise(Game.rng);
        createMap(0);
      }, 30);
    }
  };

  var createMap = function(l) {
    /**
     * Sets altitude according to the world generator results
     * @param  {int} x     X coordinate for the tie we're getting altitude for
     * @param  {int} y     Y coordinate for the tile we're gettign altitude for
     * @param  {int} level What level are we workign on?
     * @return {int}       The altitude for the tile
     */
    var increment = function(incrementer) {
      document.getElementById('thumb').style.WebkitTransform = 'translate(' + (-220 + incrementer * 44) + 'px, 0)';
      var message = document.getElementById('loadMessage');
      switch(incrementer) {
      case 1:
        message.innerHTML = Lang.engage;
        break;
      case 2:
        message.innerHTML = Lang.warp11;
        break;
      case 3:
        message.innerHTML = Lang.orbit;
        break;
      case 4:
        message.innerHTML = Lang.probes;
        break;
      case 5:
        message.innerHTML = Lang.houston;
        break;
      default:
        message.innerHTML = '';
      }
    };
    var altitude = function(x, y, level) {
      if(level === 0) {
        var gridSize = 75;
        var n = (Game.noise.noise(x / gridSize, y / gridSize, 0) + 1) * 127;
        var n2 = (Game.noise2.noise(x / (gridSize / 2), y / (gridSize / 2), 0) + 1) * 127;
        var n3 = (Game.noise3.noise(x / (gridSize / 4), y / (gridSize / 4), 0) + 1) * 127;
        return Math.round((n + n2 + n3) / 3);
      } else {
        return Game.map[0][y][x].altitude + (level * 5);
      }
    };

    /**
     * Increments the loader bar
     * @return {nothing}
     */

    var generateRivers = function(iterations) {
      var x, y;
      for(var i = 0; i < iterations; i++) {
        x = randGen(Game.radarRad * 2, 0, true);
        y = randGen(Game.radarRad * 2, 0, true);
        if(Game.map[0][y][x].kind === 2 || Game.map[0][y][x].kind === 1) {
          slide(x, y);
        } else {
          iterations += 1;
        }
      }
    };

    var slide = function(x, y) {
      var randIndex = Math.floor(Game.rng.random() * 6);
      while(x > 0 && x < Game.radarRad * 2 && y < Game.radarRad * 2 && y > 0 && Game.map[0][y][x].kind !== 4) {
        Game.map[0][y][x].kind = 4;
        Game.map[0][y][x].diggable = false;
        Game.map[0][y][x].ref = changeName(Lang.water, Game.map[0][y][x].ref);
        var lowest = [adjacent(x, y, randIndex)[1], adjacent(x, y, randIndex)[0]]; //x, y
        for(var j = 0; j < 6; j++) {
          if(x > 1 && x < (Game.radarRad * 2) - 1 && y < (Game.radarRad * 2) - 1 && y > 1 && Game.map[0][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].altitude < Game.map[0][lowest[1]][lowest[0]].altitude) {
            lowest[1] = adjacent(x, y, j)[0];
            lowest[0] = adjacent(x, y, j)[1];
          }
        }
        slide(lowest[0], lowest[1]);
      }
    };

    /**
    * Sets the tile type as a function of altitude
    * @param {int} x     X coordinate of the tile we're at
    * @param {int} y     Y coordiante of the tile we're at
    * @param {int} level The Level we're working with
    */
    var setType = function(x, y, level) {
      var high = 160;
      var med = 130;
      var low = 90;
      var map = Game.map[level][y][x];
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
    };

    var generateResources = function(map) {
      var resourceArray = [ //[MAXALT,MINALT,DENSITY,SPREAD]
      [190, 160, 40, 60],//Bauxite", "Aluminium (Al)"
      [190, 160, 20, 10],//Corundum", "Aluminium (Al)"
      [220, 160, 10, 10],//Kryolite", "Aluminium (Al)"
      [200, 90, 90, 200],//Limestone", "Calcium (Ca)"
      [200, 100, 50, 130],//Copper Pyrite", "Copper (Cu)"
      [180, 100, 30, 120],//Copper Glance", "Copper (Cu)"
      [200, 90, 40, 80],//Malachite", "Copper (Cu)"
      [100, 90, 10, 5],//Calverite", "Gold (Au)"
      [110, 90, 3, 3],//Syvanite", "Gold (Au)"
      [220, 150, 60, 130],//Haematite", "Iron (Fe)"
      [200, 160, 30, 60],//Magnetite", "Iron (Fe)"
      [230, 170, 40, 150],//Iron Pyrite", "Iron (Fe)"
      [220, 160, 20, 40],//Siderite", "Iron (Fe)"
      [150, 130, 20, 20],//Galena", "Lead (Pb)"
      [160, 130, 10, 10],//Anglesite", "Lead (Pb)"
      [130, 90, 50, 80],//Dolomite", "Magnesium (Mg)"
      [200, 160, 20, 40],//Karnalite", "Magnesium (Mg)"
      [160, 130, 10, 20],//Cinnabar", "Mercury (Hg)"
      [150, 140, 5, 5],//Calomel", "Mercury (Hg)"
      [170, 140, 30, 40],//Phosphorite", "Phosphorous (P)"
      [180, 130, 10, 20],//Floreapetite", "Phosphorous (P)"
      [130, 90, 20, 80],//Salt Petre", "Potassium (K)"
      [110, 90, 10, 30],//Karnalite", "Potassium (K)"
      [180, 170, 10, 20],//"Silver Glance", "Silver"
      [130, 90, 20, 60],//Sodium Carbonate", "Sodium (Na)"
      [100, 90, 10, 100],//Rock Salt", "Sodium (Na)"
      [140, 100, 30, 100],//Tin Pyrites", "Tin (Sn)"
      [130, 120, 20, 40],//Cassiterite", "Tin (Sn)"
      [120, 90, 30, 90],//Zinc Blende", "Zinc (Zn)"
      [150, 90, 20, 40]//Calamine", "Zinc (Zn)"
        ];
      var limit = (Game.radarRad * 2) - 1;
      var x = randGen(Game.radarRad * 2, 0, true);
      var y = randGen(Game.radarRad * 2, 0, true);
      var sameAbove = false;
      for(var i = 0; i < resourceArray.length; i++) {
        if(Game.level === 0 || Game.map[Game.level - 1][y][x].resources[i]){
        for(var iter = 0; iter < resourceArray[i][3]; iter++) {
            var testAltitude = map[y][x].altitude;
            if(testAltitude < (resourceArray[i][0] + (Game.level*6)) && testAltitude > resourceArray[i][1] && x > 0 && x < limit && y < limit && y > 0 && map[y][x].kind !== 4) {
              map[y][x].resources[i] = randGen(resourceArray[i][2], 1, true);
              map[y][x].mineable = true;
              //if we haven't already, update the texture to show resources
              if(map[y][x].kind < 8){
                map[y][x].kind += 9;
              }
              var check = sameLevel(map, x, y, i);
              for(var count = 0; count < 6; count++) {
                var tempX = adjacent(x, y, count)[1];
                var tempY = adjacent(x, y, count)[0];
                if(map[tempY][tempX].kind !== 4 && (tempY != check[0] && tempX != check[1])) {
                  map[tempY][tempX].resources[i] = randGen(resourceArray[i][2], 1, true);
                  map[tempY][tempX].mineable = true;
                  //if we haven't already, update the texture to show resources
                  if(map[tempY][tempX].kind < 8){
                    map[tempY][tempX].kind += 9; //This is just so that we can see it until I get the radar sorted...
                  }
                }
              }
              x < Game.radarRad * 2 - 1 && x > 0 ? x = check[1] : x = randGen(Game.radarRad * 2, 0, true);
              y < Game.radarRad * 2 - 1 && y > 0 ? y = check[0] : y = randGen(Game.radarRad * 2, 0, true);
            } else {
              iter -= 1;
              x = randGen(Game.radarRad * 2, 0, true);
              y = randGen(Game.radarRad * 2, 0, true);
            }
          }
          } else {
            i -= 1;
            x = randGen(Game.radarRad * 2, 0, true);
            y = randGen(Game.radarRad * 2, 0, true);
          }
      }
    };

    var sameLevel = function(map, x, y, i) {
      var current = map[y][x].altitude;
      var randIndex = Math.floor(Game.rng.random() * 6);
      var closest = [adjacent(x, y, randIndex)[0], adjacent(x, y, randIndex)[1]];
      var next = map[adjacent(x, y, randIndex)[0]][adjacent(x, y, randIndex)[1]].altitude;
      for(var count = 0; count < 6; count++) {
        var nextTest = map[adjacent(x, y, count)[0]][adjacent(x, y, count)[1]].altitude;
        if(Math.abs(next - current) > Math.abs(nextTest - current) && !map[adjacent(x, y, count)[0]][adjacent(x, y, count)[1]].resources[i]) {
          next = nextTest;
          closest = [adjacent(x, y, count)[0], adjacent(x, y, count)[1]];
        }
      }
      return closest;
    };

    /*creates the map (Finally)*/
    /**
     * Creates the map Array
     * @return {nothing}
     */
    if(l < 5){
        Game.map[l] = [];
        Game.mapTiles[l] = [];
        for(var y = 0; y < Game.radarRad * 2; y++) {
          Game.map[l][y] = []; //create an array to hold the x cell, we now have a 200x200 2d array
          Game.mapTiles[l][y] = [];
          for(var x = 0; x < Game.radarRad * 2; x++) {
            Game.map[l][y][x] = []; //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
            Game.mapTiles[l][y][x] = [];
            Game.map[l][y][x] = new Terrain(); //if we're in the circle, assign a tile value
            Game.map[l][y][x].ref = '#' + l + ':' + ((x - 150)) + ':' + ((y - 150) * (-1));
            Game.map[l][y][x].altitude = altitude(x, y, l);
            setType(x, y, l);
          }
        }
        generateResources(Game.map[l]);
        increment(l + 1);
        setTimeout(function(){
            createMap(l + 1);
        }, 200);
    } else {
        Disk.loadGame(Game.inputSeed);
        generateRivers(40);
        mapFit(true);
        drawZoomMap();
        drawRadar();
        drawLoc();
        document.getElementById("popupContainer").classList.add('popup_container_invisible');
        setTimeout(function(){
          document.getElementById("popupContainer").classList.add('popup_container_hidden');
        }, 1000);
    }
  };
}