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
    * Position on the map
    * @memberof Construction
    * @member {array} Position [y, x]
    */
    this.position = [150, 150];
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
    * Waste produced or removed by ths construction
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
    * The future type of this construction (will overwrite {@link Construction#kind})
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
}
