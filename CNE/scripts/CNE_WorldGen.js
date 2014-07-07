//WORLD GENERATION****************************************************************
/**
* One big wrapper for everything needed to create the maps, resources rivers etc.
* or to load them and regenerate from the seed (we save memory through 
* procedural generation)
* @constructor
*/
function NewGame(){

/**
 * Parses the seed before passing it to the world generator
 * @todo The generated noises shouldn't need to be stored in the Game Object
 */
  this.getSeed = function() {
    var input = document.getElementById('seed').value;
    planetName = input;
    var popup = document.getElementById("popupContainer");
    var seedString = '';
    var seeder;
    if(input !== '') { //If I've entered a seed
      document.getElementById('login').disabled = true;
      Conf.inputSeed = input;
      input = input.split(' ').join('');
      for(var i = 0; i < input.length; i++) {
        seedString += input.charCodeAt(i);
      }
      seeder = parseInt(seedString, 10) / Math.pow(10, input.length);
    } else if(input === '') {
        document.getElementById('seed').focus();
    }

    if(typeof seeder === 'number') {
      document.onkeydown = Interface.keydown;
      setTimeout(function() {
        Conf.rng = new MersenneTwister(seeder);
        Conf.noise = new ClassicalNoise(Conf.rng);
        Conf.noise2 = new ClassicalNoise(Conf.rng);
        Conf.noise3 = new ClassicalNoise(Conf.rng);
        createMap(0);
      }, 30);
    }
  };



  /**
  * Creates a map for the provided level, inserting it into the Conf.map
  * @param {int} l Level for which a map (2D) should be generated
  * @todo the dependancy on Conf.map, rather than returning the array to it is
  * probably something we should have a look at
  */
  var createMap = function(l) {



    /**
     * Increments the loader bar, and displays appropriate message
     * @param {int} incrementer Value from 1 to 5 (the step we shoudl go to)
     */
    var increment = function(incrementer) {
      document.getElementById('thumb').style.WebkitTransform = 'translate(' + (-220 + incrementer * 44) + 'px, 0)';
      var message = document.getElementById('loadMessage');
      switch(incrementer) {
      case 1:
        message.innerHTML = TRANS.engage;
        break;
      case 2:
        message.innerHTML = TRANS.warp11;
        break;
      case 3:
        message.innerHTML = TRANS.orbit;
        break;
      case 4:
        message.innerHTML = TRANS.probes;
        break;
      case 5:
        message.innerHTML = TRANS.houston;
        break;
      default:
        message.innerHTML = '';
      }
    };



    /**
     * Sets altitude according to the world generator results
     * @param  {int} x     X coordinate for the tile we're getting altitude for
     * @param  {int} y     Y coordinate for the tile we're getting altitude for
     * @param  {int} level What level are we working on?
     * @return {int}       The altitude for the tile
     */
    var altitude = function(x, y, level) {
      if(level === 0) {
        var gridSize = 75;
        var n = (Conf.noise.noise(x / gridSize, y / gridSize, 0) + 1) * 127;
        var n2 = (Conf.noise2.noise(x / (gridSize / 2), y / (gridSize / 2), 0) + 1) * 127;
        var n3 = (Conf.noise3.noise(x / (gridSize / 4), y / (gridSize / 4), 0) + 1) * 127;
        return Math.round((n + n2 + n3) / 3);
      } else {
        return Conf.map[0][y][x].altitude + (level * 5);
      }
    };



    /**
    * Picks the locations at which rivers will be seeded, passing the work of 
    * actually creating the rivers to slide()
    * @param {int} iterations The number of iterations to go through 
    *    (i.e. the number of rivers to generate)
    */
    var generateRivers = function(iterations) {
      var x, y;
      for(var i = 0; i < iterations; i++) {
        x = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
        y = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
        if(Conf.map[0][y][x].kind === 2 || Conf.map[0][y][x].kind === 1) {
          slide(x, y);
        } else {
          iterations += 1;
        }
      }
    };



    /**
    * Creates rivers: moves recursively from the provided coordinates, avoiding 
    * water, seeking the lowest local altitude and turning it into water
    * @param {int} x     X coordinate of the tile we're at
    * @param {int} y     Y coordiante of the tile we're at
    * @param {int} level The Level we're working with
    */
    var slide = function(x, y) {
      var randIndex = Math.floor(Conf.rng.random() * 6);
      while(x > 0 && x < Conf.radarRad * 2 && 
          y < Conf.radarRad * 2 && y > 0 && 
          Conf.map[0][y][x].kind !== 4) {
        Conf.map[0][y][x].kind = 4;
        Conf.map[0][y][x].diggable = false;
        Conf.map[0][y][x].ref = CneTools.changeName(TRANS.water, Conf.map[0][y][x].ref);
        var lowest = [CneTools.adjacent(x, y, randIndex)[1], CneTools.adjacent(x, y, randIndex)[0]]; //x, y
        for(var j = 0; j < 6; j++) {
          if(x > 1 && x < (Conf.radarRad * 2) - 1 && 
              y < (Conf.radarRad * 2) - 1 && 
              y > 1 && 
              Conf.map[0][CneTools.adjacent(x, y, j)[0]][CneTools.adjacent(x, y, j)[1]].altitude < Conf.map[0][lowest[1]][lowest[0]].altitude) {
            lowest[1] = CneTools.adjacent(x, y, j)[0];
            lowest[0] = CneTools.adjacent(x, y, j)[1];
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
      var map = Conf.map[level][y][x];
      var altitude = map.altitude;
      var increment;
      level > 0 ? increment = 5 : increment = 0;

      if(altitude >= high) {
        map.kind = 2 + increment;
        map.ref = map.ref.insert(0, TRANS.mountaineous + ' ');
      } else if(altitude >= med) {
        map.kind = 1 + increment;
        map.ref = map.ref.insert(0, TRANS.rough + ' ');
      } else if(altitude >= low) {
        map.kind = 0 + increment;
        map.ref = map.ref.insert(0, TRANS.smooth + ' ');
      } else {
        map.kind = 4;
        map.ref = map.ref.insert(0, TRANS.water + ' ');
      }
      level === 0 && map.kind !== 4 ? map.diggable = true : map.diggable = false;
      level === 0 ? map.UG = false : map.UG = true;
    };



    /**
    * Generates resources on the provided map
    * @param {array} map Map to add resources to
    */
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
      var limit = (Conf.radarRad * 2) - 1;
      var x = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
      var y = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
      var sameAbove = false;
      for(var i = 0; i < resourceArray.length; i++) {
        if(Conf.level === 0 || Conf.map[Conf.level - 1][y][x].resources[i]){
        for(var iter = 0; iter < resourceArray[i][3]; iter++) {
            var testAltitude = map[y][x].altitude;
            if(testAltitude < (resourceArray[i][0] + (Conf.level*6)) && testAltitude > resourceArray[i][1] && x > 0 && x < limit && y < limit && y > 0 && map[y][x].kind !== 4) {
              map[y][x].resources[i] = Tools.randomGenerator(resourceArray[i][2], 1, true);
              map[y][x].mineable = true;
              //if we haven't already, update the texture to show resources
              if(map[y][x].kind < 8){
                map[y][x].kind += 9;
              }
              var check = sameLevel(map, x, y, i);
              for(var count = 0; count < 6; count++) {
                var tempX = CneTools.adjacent(x, y, count)[1];
                var tempY = CneTools.adjacent(x, y, count)[0];
                if(map[tempY][tempX].kind !== 4 && (tempY != check[0] && tempX != check[1])) {
                  map[tempY][tempX].resources[i] = Tools.randomGenerator(resourceArray[i][2], 1, true);
                  map[tempY][tempX].mineable = true;
                  //if we haven't already, update the texture to show resources
                  if(map[tempY][tempX].kind < 8){
                    map[tempY][tempX].kind += 9; //This is just so that we can see it until I get the radar sorted...
                  }
                }
              }
              x < Conf.radarRad * 2 - 1 && x > 0 ? x = check[1] : x = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
              y < Conf.radarRad * 2 - 1 && y > 0 ? y = check[0] : y = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
            } else {
              iter -= 1;
              x = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
              y = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
            }
          }
          } else {
            i -= 1;
            x = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
            y = Tools.randomGenerator(Conf.radarRad * 2, 0, true);
          }
      }
    };



    /**
    * Will give the adjacent tile that is _closest_ in altitude to the one at
    * the coordinates provided, this simulates 'seams' of resources that flow 
    * around the map's topography
    * @param {array} map The map array to crawl
    * @param {int} x X coordinate of tile to test
    * @param {int} y Y coordinate of tile to test
    * @param {int} i Index of the resource to be filled in
    */
    var sameLevel = function(map, x, y, i) {
      var current = map[y][x].altitude;
      var randIndex = Math.floor(Conf.rng.random() * 6);
      var closest = [CneTools.adjacent(x, y, randIndex)[0], CneTools.adjacent(x, y, randIndex)[1]];
      var next = map[CneTools.adjacent(x, y, randIndex)[0]][CneTools.adjacent(x, y, randIndex)[1]].altitude;
      for(var count = 0; count < 6; count++) {
        var nextTest = map[CneTools.adjacent(x, y, count)[0]][CneTools.adjacent(x, y, count)[1]].altitude;
        if(Math.abs(next - current) > Math.abs(nextTest - current) &&
             !map[CneTools.adjacent(x, y, count)[0]][CneTools.adjacent(x, y, count)[1]].resources[i]) {
          next = nextTest;
          closest = [CneTools.adjacent(x, y, count)[0], CneTools.adjacent(x, y, count)[1]];
        }
      }
      return closest;
    };



    /*creates the map (Finally)*/
    if(l < 5){
        Conf.map[l] = [];
        Conf.mapTiles[l] = [];
        for(var y = 0; y < Conf.radarRad * 2; y++) {
          Conf.map[l][y] = []; //create an array to hold the x cell, we now have a 200x200 2d array
          Conf.mapTiles[l][y] = [];
          for(var x = 0; x < Conf.radarRad * 2; x++) {
            Conf.map[l][y][x] = []; //each cell needs to hold its own array of the specific tile's values, so we're working with a 3 dimensional array - this will change when I set tiles as objects
            Conf.mapTiles[l][y][x] = [];
            Conf.map[l][y][x] = new Terrain(); //if we're in the circle, assign a tile value
            Conf.map[l][y][x].ref = '#' + l + ':' + ((x - 150)) + ':' + ((y - 150) * (-1));
            Conf.map[l][y][x].altitude = altitude(x, y, l);
            setType(x, y, l);
          }
        }
        generateResources(Conf.map[l]);
        increment(l + 1);
        setTimeout(function(){
            createMap(l + 1);
        }, 200);
    } else {
        FileIO.loadGame(Conf);
        generateRivers(40);
        Display.resizeMap(true);
        Display.drawMap();
        Display.drawRadar();
        Display.drawReticule();
        document.getElementById("popupContainer").classList.add('popup_container_invisible');
        setTimeout(function(){
          document.getElementById("popupContainer").classList.add('popup_container_hidden');
        }, 1000);
    }
  };
}