/**
* The main object for a tile, tracking its kind, and state, initially empty 
* apart from resources
* @constructor
*/
function Terrain() {
    /**
    * Array that stores the list of resources. This is the only instantiated 
    * property to save on memory
    * @memberof Terrain
    * @member {array} resources
    */
    this.resources = [];
    /**
    * Kind of tile. Possible values are: 
    * - 0=Smooth
    * - 1=Rough
    * - 2=Mountainous
    * - 3=Prepared/MinedOut
    * - 4=Water
    * - 5=constructionAnimation
    *
    * @memberof Terrain 
    * @member {int} kind
    */
    /**
    * @memberof Terrain 
    * @member {int} altitude 
    */
    /**
    * Helper variable that tells us if the tile is subterranean or not
    * @memberof Terrain 
    * @member {bool} UG
    */
    /**
    * Stores the number of turns that are left to become a tile of the desired kind
    * @memberof Terrain 
    * @member {int} turns
    */
    /**
    * @memberof Terrain 
    * @member {bool} diggable
    */
    /**
    * @memberof Terrain 
    * @member {string} ref
    */
}

/**
* Constructor for constructions! Any building that is placed on the map will 
* have these variables at its disposal
* @constructor
* @todo Move functions like nextTurn and recycle into this constructor
*/
function Construction() {
    /**
    * @memberof Construction
    * @member {string} ref
    */
    this.ref = "";
    /**
    * Position on the map: Level, x-position, y-position
    * @memberof Construction
    * @member {array} Position [level, x, y]
    */
    this.position = [0, 150, 150];
    /**
    * The construction type
    * @memberof Construction
    * @member {int} kind
    */
    this.kind = 3;
    /**
    * Does the building exist yet or not
    * @memberof Construction
    * @member {bool} exists
    */
    this.exists = false;
    /**
    * Time necessary to build this construction
    * @memberof Construction
    * @member {int} buildTime
    */
    this.buildTime = -1;
    /**
    * Age of the building (increments each turn)
    * @todo Incrementer function should be in this construction
    * @memberof Construction
    * @member {int} age
    */
    this.age = 0;
    /**
    * Health of the construction (level of maintenance) from 0 to 100
    * @memberof Construction
    * @member {int} health
    */
    this.health = 0;
    /**
    * Energy the construction generates or consumes
    * @memberof Construction
    * @member {int} energy
    */
    this.energy = 0;
    /**
    * Food the construction generates or consumes
    * @memberof Construction
    * @member {int} food
    */
    this.food = 0;
    /**
    * Effect on TOSSer morale
    * @memberof Construction
    * @member {int} tossMorale
    */
    this.tossMorale = 0;
    /**
    * Effect on Hipstie morale
    * @memberof Construction
    * @member {int} hipMorale
    */
    this.hipMorale = 0;
    /**
    * Effect on Artie morale
    * @memberof Construction
    * @member {int} artMorale
    */
    this.artMorale = 0;
    /**
    * Air produced or consumed by this construction
    * @memberof Construction
    * @member {int} air
    */
    this.air = 0;
    /**
    * Construction's effect on crime rate
    * @memberof Construction
    * @member {int} crime
    */
    this.crime = 0;
    /**
    * Waste produced or removed by this construction
    * @memberof Construction
    * @member {int} waste
    */
    this.waste = 0;
    /**
    * Storage space provided by this construction
    * @memberof Construction
    * @member {int} storage
    */
    this.storage = 0;
    /**
    * Construction's effect on Tosser population
    * @memberof Construction
    * @member {int} tossPop
    */
    this.tossPop = 0;
    /**
    * Construction's effect on Hipstie population
    * @memberof Construction
    * @member {int} hipPop
    */
    this.hipPop = 0;
    /**
    * Construction's effect on Artie population
    * @memberof Construction
    * @member {int} artPop
    */
    this.artPop = 0;
    /**
    * Housing provided by this construction
    * @memberof Construction
    * @member {int} housing
    */
    this.housing = 0;
    /**
    * Employee's required for this construction
    * @memberof Construction
    * @member {int} employees
    */
    this.employees = 0;
    /**
    * Ores required by this construction
    * @memberof Construction
    * @member {array} ores
    */
    this.ores = [];
    /**
    * The future type of this construction (will overwrite {@link Construction.kind})
    * @memberof Construction
    * @member {array} future
    */
    this.future = [3, TRANS.prepared];
    /**
    * @memberof Construction
    * @member {int} robot
    */
    this.robot = -1;
    /**
    * @memberof Construction
    * @member {bool} mining
    */
    this.mining = false;
    /**
    * Whether this construction is vital to colony survival or not 
    * (used to prioritize building shutdown in the event of energy or employee shortages)
    * @memberof Construction
    * @member {bool} vital
    */
    this.vital = false;
    /**
    * Whether or not the construction has been shut down or not
    * @memberof Construction
    * @member {bool} shutdown
    */
    this.shutdown = false;
    /**
    * The current research topic in this cosntruction
    * @memberof Construction
    * @member {string} researchTopic
    */
    this.researchTopic = 'noResearch';

    /**
    * Recycles the provided tile, recovering the resources if any recycler buildings
    * are available, printing status to the in game console
    */
    this.recycle = function(){
        var level = this.position[0];
        var x = this.position[1];
        var y = this.position[2];
        var recycled = false;
        for(var i = 0; i < Conf.recyclerList.length; i++){
            if(!Conf.mapTiles[Conf.recyclerList[i][2]][Conf.recyclerList[i][1]][Conf.recyclerList[i][0]][1].shutdown && !recycled){
                recycled = true;
                Conf.mapTiles[level][y][x][1] = bobTheBuilder(103, x, y, level);
                var recovered = Resources.required(this.kind, false, true);
                for(var j = 0; j < recovered.length; j++){
                    if(Conf.storageCap[Conf.storageCap.length - 1] - Conf.inStorage[Conf.inStorage.length - 1] >= recovered[j][1]){
                        Conf.procOres[recovered[j][0]] += recovered[j][1];
                    } else {
                        Terminal.print(TRANS.recycleFailure);
                    }
                }
            }
        }
        if(!recycled){
            Terminal.print(TRANS.noRecyclers);
        }
        execReview();
    }
}
