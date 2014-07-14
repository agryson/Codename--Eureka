"use strict";
/**
 * Modularized config namespace that instantiates all our initial values
 * @namespace Conf
 */
var Conf = (function(){

    var _INIT = {};
    /**
    * The radius of the map that we want, changing it should change it everywhere except the html
    * @memberof Conf
    * @member {int} radarRad
    */
    _INIT.radarRad = 150;
    //The zoomed in map related things...
    /**
    * @memberof Conf
    * @member {int} destinationWidth
    */
    _INIT.destinationWidth = 120;
    /**
    * @memberof Conf
    * @member {int} destinationHeight
    */
    _INIT.destinationHeight = 140;
    /**
    * Number of tiles to show in x-axis according to <tt>Math.ceil(document.width / 90)</tt>
    * @memberof Conf
    * @member {int} xLimit
    */
    /**
    * Number of tiles to show in the y-axis according <tt>to Math.ceil(document.height / 78)</tt>
    * @memberof Conf
    * @member {int} yLimit
    */
    /**
    * @memberof Conf
    * @member {bool} highlight
    */
    _INIT.highlight = false;
    /**
    * Initial x-position of map on radar (Reticule)
    * @memberof Conf
    * @member {int} retX
    */
    _INIT.retX = _INIT.radarRad;
    /**
    * Initial y-position of map on radar (Reticule)
    * @memberof Conf
    * @member {int} retY
    */
    _INIT.retY = _INIT.radarRad;
    /**
    * Which animation frame we are on for animated tiles
    * @memberof Conf
    * @member {int} animate
    */
    _INIT.animate = 0;
    /**
    * Whether we're animating forwards or backwards in the animation loop
    * @memberof Conf
    * @member {bool} augment
    */
    _INIT.augment = true;
    /**
    * @memberof Conf
    * @member {bool} fresh
    */
    _INIT.fresh = true;
    /**
    * @memberof Conf
    * @member {string} clickedOn
    */
    _INIT.clickedOn = 'none';
    /**
    * The level the player is currently on
    * @memberof Conf
    * @member {int} level
    */
    _INIT.level = 0;
    /**
    * Source Image for the highlight sprite
    * @memberof Conf
    * @member {Object} tileHighlight
    */
    _INIT.tileHighlight = new Image();
    _INIT.tileHighlight.src = 'images/tools.png';
    /**
    * Source Image for the main spritesheet
    * @memberof Conf
    * @member {Object} spritesheet
    */
    _INIT.spritesheet = new Image();
    _INIT.spritesheet.src = 'images/spritesheet.png';
    /**
    * @member {int} mouseX
    * @memberof Conf
    */ 
    /**
    * @memberof Conf
    * @member {int} mouseY
    */
    //General game stuff
    /**
    * Element that displays the turn number
    * @todo This shouldn't need to be stored in the Game object
    * @memberof Conf
    * @member {HTMLElement} turnNum
    */
    _INIT.turnNum = document.getElementById('turnNumber');
    /**
    * Which turn it is
    * @memberof Conf
    * @member {int} turn
    */
    _INIT.turn = 0;
    /**
    * The procedurally generated map, all of it
    * @memberof Conf
    * @member {array} map
    */
    _INIT.map = [];
    /**
    * Anythign that's on the map but wasn't procedurally generated, a cheap way of saving user data
    * @memberof Conf
    * @member {array} mapTiles
    */
    _INIT.mapTiles = [];
    /**
    * Coordinates where the player placed their lander
    * @memberof Conf
    * @member {array} home
    */
    _INIT.home = [150,150];
    /**
    * The list of buildings according to :
    * [id, availableToPlayer, levelType, name]
    * - {string} : id
    * - {bool} : availableToPlayer
    * - {int} : levelType (0=surface, 1=subsurface, 2=both)
    * - {link} : name from the language class
    * @memberof Conf
    * @member {array} buildings
    */
    _INIT.buildings = [
        ["agri", false, 0, TRANS.agri], //
        ["agri2", false, 0, TRANS.agri2],
        ["airport", false, 0, TRANS.airport],
        ["arp", false, 2, TRANS.arp], //
        ["airlift", false, 2, TRANS.airlift], //
        ["barracks", false, 1, TRANS.barracks],
        ["civprot", false, 2, TRANS.civprot],
        ["civprot2", false, 2, TRANS.civprot2],
        ["commarray", false, 0, TRANS.commarray], //
        ["commarray2", false, 0, TRANS.commarray2],
        ["command", false, 2, TRANS.command], //
        ["connector", false, 2, TRANS.connector], //
        ["dronefab", false, 0, TRANS.dronefab],
        ["chernobyl", false, 0, TRANS.chernobyl],
        ["tokamak", false, 0, TRANS.tokamak],
        ["genfab", false, 0, TRANS.genfab], //
        ["geotherm", false, 1, TRANS.geotherm],
        ["hab", false, 1, TRANS.hab], //
        ["hab2", false, 1, TRANS.hab2],
        ["hab3", false, 1, TRANS.hab3],
        ["er", false, 1, TRANS.er],
        ["mine", false, 2, TRANS.mine],
        ["nursery", false, 1, TRANS.nursery],
        ["oreproc", false, 0, TRANS.oreproc], //
        ["rec", false, 1, TRANS.rec],
        ["recycling", false, 0, TRANS.recycling],
        ["clichy", false, 1, TRANS.clichy], //
        ["research", false, 2, TRANS.research], //
        ["research2", false, 2, TRANS.research2],
        ["solar", false, 0, TRANS.solar],
        ["space", false, 0, TRANS.space],
        ["stasis", false, 1, TRANS.stasis],
        ["store", false, 2, TRANS.store], //
        ["uni", false, 1, TRANS.uni],
        ["warehouse", false, 2, TRANS.warehouse], //
        ["windfarm", false, 0, TRANS.windfarm], //
        ["workshop", false, 1, TRANS.workshop], //
        ["lander", true, 0, TRANS.lander]
    ];
    /**
     * List of robots with following syntax:
     * [inUse, totalAvailable, idString, availableToPlayer, levelType]
     * Where the types are:
     * - {int} : inUse
     * - {int} : totalAvailable
     * - {string} : idString
     * - {bool} : availableToPlayer
     * - {int} : levelType (0=surface, 1=subsurface, 2=both)
     * @memberof Conf
     * @member {array} robotsList
     */
    _INIT.robotsList = [
        [0, 5, "dozer", false, 2], //
        [0, 3, "digger", false, 2], //
        [0, 3, "cavernDigger", false, 1], //
        [0, 3, "miner", false, 2], //
        [0, 1, "recycler", false, 2]
    ];
    /**
    * Coordinates of the commtowers on the map
    * @memberof Conf
    * @member {array} commTowers
    */
    _INIT.commTowers = [];
    /**
    * Coordinates of the recyclers on the map
    * @memberof Conf
    * @member {array} recyclerList
    */
    _INIT.recyclerList = [];
    //[[level, y, x]]
    /**
    * Coordinates of the research facilities on the map
    * @memberof Conf
    * @member {array} researchLabs
    */
    _INIT.researchLabs = [];
    /**
    * The current research topic, if any
    * @member {string} currentResearch
    * @memberof Conf
    */
    /**
    * Hierarchical list of the research topics available: 
    * [idString, preReqsCount, subTopicsArray, turnsToComplete, totalTurnsNeeded]
    * - {string} : idString
    * - {int} : preReqsCount
    * - {array} : subTopicsArray
    * - {int} : turnsToComplete
    * - {int} : totalTurnsNeeded
    * @memberof Conf
    * @member {array} researchTopics
    */
    _INIT.researchTopics = ["all", 0, [
        ["engineering", 0, [
            ["agriculturalEngineering", 0, [
                ["hydroponics", 0, [], 5, 5],
                ["noSoilFarming", 0, [], 5, 5],
                ["xtremeTempAgriculture", 0, [], 5, 5]
            ], 5, 5],
            ["electricalEngineering", 0, [
                ["commTech", 0, [], 5, 5],
                ["pcbDesign", 0, [], 5, 5],
                ["processors", 0, [], 5, 5],
                ["robotics", 0, [], 5, 5]
            ], 5, 5],
            ["geneticEngineering", 0, [
                ["animalGenetics", 0, [], 5, 5],
                ["horticulturalGenetics", 0, [], 5, 5],
                ["humanGenetics", 0, [], 5, 5],
                ["longevityResearch", 0, [], 5, 5]
            ], 5, 5],
            ["mechanicalEngineering", 0, [
                ["massProduction", 0, [], 5, 5],
                ["mechatronics", 0, [], 5, 5],
                ["plm", 0, [], 5, 5]
            ], 5, 5],
            ["softwareEngineering", 0, [
                ["ai", 0, [
                    ["culturalSensitivity", 0, [], 5, 5],
                    ["imageProcessing", 0, [], 5, 5],
                    ["naturalLanguage", 0, [], 5, 5],
                    ["neuralNetworks", 0, [], 5, 5]
                ], 5, 5]
            ], 5, 5],
            ["geoEngineering", 0, [
                ["terraforming", 0, [], 5, 5],
                ["weatherControl", 0, [], 5, 5]
            ], 5, 5]
        ], 5, 5],
        ["science", 0, [
            ["physics", 0, [
                ["experimentalPhysics", 0, [], 5, 5],
                ["advancedMaterials", 0, [
                    ["compositieMaterials", 0, [], 5, 5],
                    ["selfHealingMaterials", 0, [], 5, 5],
                    ["conductivePolymers", 0, [], 5, 5],
                    ["opticalMaterials", 0, [], 5, 5]
                ], 5, 5],
                ["nanotech", 0, [
                    ["bioNeutralNano", 0, [], 5, 5],
                    ["ggam", 0, [], 5, 5],
                    ["nanoFab", 0, [], 5, 5]
                ], 5, 5],
                ["theoreticalPhysics", 0, [], 5, 5],
                ["astronomy", 0, [], 5, 5],
                ["meteorology", 0, [], 5, 5],
                ["nuclearPhysics", 0, [], 5, 5]
            ], 5, 5],
            ["chemistry", 0, [
                ["organicChemistry", 0, [
                    ["polymers", 0, [], 5, 5]
                ], 5, 5],
                ["physicalChemistry", 0, [
                    ["oreProcessing", 0, [], 5, 5],
                    ["metallurgy", 0, [], 5, 5]
                ], 5, 5],
                ["pharmaceuticalChemistry", 0, [
                    ["herbicides", 0, [], 5, 5],
                    ["medicines", 0, [], 5, 5]
                ], 5, 5]
            ], 5, 5],
            ["biology", 0, [
                ["anatomy", 0, [], 5, 5],
                ["horticulture", 0, [], 5, 5],
                ["physiology", 0, [
                    ["radiationEffects", 0, [], 5, 5],
                    ["lowGravEffects", 0, [], 5, 5]
                ], 5, 5],
                ["medicine", 0, [
                    ["oncology", 0, [], 5, 5],
                    ["orthopaedics", 0, [], 5, 5],
                    ["paedeatrics", 0, [], 5, 5],
                    ["placebos", 0, [], 5, 5],
                    ["traditional", 0, [], 5, 5]
                ], 5, 5]
            ], 5, 5]
        ], 5, 5],
        ["arts", 0, [
            ["sociology", 0, [
                ["socialPolicy", 0, [], 5, 5],
                ["politicalScience", 0, [], 5, 5],
                ["culturalRelations", 0, [], 5, 5]
            ], 5, 5],
            ["philosophy", 0, [
                ["ethics", 0, [], 5, 5],
                ["scientificTheory", 0, [], 5, 5],
                ["classicalPhilosophy", 0, [], 5, 5]
            ], 5, 5]
        ], 5, 5]
    ], 0];
    /**
    * The ores that have been mined (but not processed)
    * @memberof Conf
    * @member {array} ores
    */
    _INIT.ores = [];
    /**
    * List associating the orenames to their processed mineral name
    * [ORENAME,PRODUCTNAME]
    * @memberof Conf
    * @member {array} resourceArray
    */
    _INIT.resourceArray = [  
        [TRANS.bauxite, TRANS.aluminium],
        [TRANS.corundum, TRANS.aluminium],
        [TRANS.kryolite, TRANS.aluminium],
        [TRANS.limestone, TRANS.calcium],
        [TRANS.copperPyrite, TRANS.copper],
        [TRANS.copperGlance, TRANS.copper],
        [TRANS.malachite, TRANS.copper],
        [TRANS.calverite, TRANS.gold],
        [TRANS.sylvanite, TRANS.gold],
        [TRANS.haematite, TRANS.iron],
        [TRANS.magnetite, TRANS.iron],
        [TRANS.ironPyrite, TRANS.iron],
        [TRANS.siderite, TRANS.iron],
        [TRANS.galena, TRANS.lead],
        [TRANS.anglesite, TRANS.lead],
        [TRANS.dolomite, TRANS.magnesium],
        [TRANS.karnalite, TRANS.magnesium],
        [TRANS.cinnabar, TRANS.mercury],
        [TRANS.calomel, TRANS.mercury],
        [TRANS.phosphorite, TRANS.phosphorous],
        [TRANS.floreapetite, TRANS.phosphorous],
        [TRANS.saltPeter, TRANS.potassium],
        [TRANS.karnalite, TRANS.potassium],
        [TRANS.silverGlance, TRANS.silver],
        [TRANS.sodiumCarbonate, TRANS.sodium],
        [TRANS.rockSalt, TRANS.sodium],
        [TRANS.tinPyrites, TRANS.tin],
        [TRANS.cassiterite, TRANS.tin],
        [TRANS.zincBlende, TRANS.zinc],
        [TRANS.calamine, TRANS.zinc]
    ];

    /**
    * List of booleans to see whether or not to display this resource on the radar. 
    * Order, with indexes, is: 0 Aluminium, 1 Calcium, 2 Copper, 3 Gold, 4 Iron, 5 Lead, 6 Magnesium, 7 Mercury,
    * 8 Phosphorous, 9 Potassium, 10 Silver, 11 Sodium, 12 Tin, 13 Zinc
    * @memberof Conf
    * @member {array} procOresRadarOpt
    */
    _INIT.procOresRadarOpt = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    /**
    * The ores that have been processed. The total sum should not exceed the colony's total storage capacity. 
    * Order, with indexes, is: 0 Aluminium, 1 Calcium, 2 Copper, 3 Gold, 4 Iron, 5 Lead, 6 Magnesium, 7 Mercury,
    * 8 Phosphorous, 9 Potassium, 10 Silver, 11 Sodium, 12 Tin, 13 Zinc
    * @memberof Conf
    * @member {array} procOres
    */
    _INIT.procOres = [15, 2, 10, 1, 15, 5, 1, 1, 1, 4, 1, 4, 5, 5];
    /**
    * The language strings for each resource, recovered from the Language Class
    * Order, with indexes, is: 0 Aluminium, 1 Calcium, 2 Copper, 3 Gold, 4 Iron, 5 Lead, 6 Magnesium, 7 Mercury,
    * 8 Phosphorous, 9 Potassium, 10 Silver, 11 Sodium, 12 Tin, 13 Zinc
    * @memberof Conf
    * @member {array} resourceNames
    */
    _INIT.resourceNames = [TRANS.aluminium, TRANS.calcium, TRANS.copper, TRANS.gold, TRANS.iron, TRANS.lead, TRANS.magnesium, TRANS.mercury, TRANS.phosphorous, TRANS.potassium, TRANS.silver, TRANS.sodium, TRANS.tin, TRANS.zinc];
    //Map generation vars
    /**
    * The string from which to seed the map
    * @memberof Conf
    * @member {string} inputSeed
    */
    _INIT.inputSeed = '';
    /**
    * @member {float} rng
    * @memberof Conf
    */
    /**
    * @member {float} noise
    * @memberof Conf
    */
    /**
    * @member {float} noise2
    * @memberof Conf
    */
    /**
    * @memberof Conf
    * @member {float} noise3
    */
    //General canvas vars...
    /**
    * @memberof Conf
    * @member {HTMLElement} mPanCanvas
    */
    _INIT.mPanCanvas = document.getElementById('mPanOverlay');
    /**
    * @memberof Conf
    * @member {CanvasContext} mPanLoc
    */
    _INIT.mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    /**
    * @memberof Conf
    * @member {HTMLElement} mPanelCanvas
    */
    _INIT.mPanelCanvas = document.getElementById('mainPanel');
    /**
    * @memberof Conf
    * @member {CanvasContext} mPanel
    */
    _INIT.mPanel = document.getElementById('mainPanel').getContext('2d');
    /**
    * @memberof Conf
    * @member {HTMLElement} radarCanvas
    */
    _INIT.radarCanvas = document.getElementById('mapOverlay');
    /**
    * @memberof Conf
    * @member {CanvasContext} radar
    */
    _INIT.radar = document.getElementById('map').getContext('2d');
    /**
    * @memberof Conf
    * @member {CanvasContext} radarLoc
    */
    _INIT.radarLoc = document.getElementById('mapOverlay').getContext('2d');
    /**
    * Accounts for the fact that hexagonal grids, when scrolled up, aren't in line
    * @name yShift
    * @memberof Conf
    * @member {int} ts
    */
    //Stats
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} housing
    */
    _INIT.housing = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} pop
    */
    _INIT.pop = [150];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} tossPop
    */
    _INIT.tossPop = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} tossBabies
    */
    _INIT.tossBabies = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} tossStudents
    */
    _INIT.tossStudents = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} tossAdults
    */
    _INIT.tossAdults = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} hipPop
    */
    _INIT.hipPop = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} hipBabies
    */
    _INIT.hipBabies = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} hipStudents
    */
    _INIT.hipStudents = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} hipAdults
    */
    _INIT.hipAdults = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} artPop
    */
    _INIT.artPop = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} artBabies
    */
    _INIT.artBabies = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} artStudents
    */
    _INIT.artStudents = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} artAdults
    */
    _INIT.artAdults = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} employed
    */
    _INIT.employed = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} sdf
    */
    _INIT.sdf = [150];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} tossMorale
    */
    _INIT.tossMorale = [500];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} hipMorale
    */
    _INIT.hipMorale = [500];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} artMorale
    */
    _INIT.artMorale = [500];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} crime
    */
    _INIT.crime = [0];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} storageCap
    */
    _INIT.storageCap = [70 + 50]; //Resources + food + lander capacity
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} inStorage
    */
    _INIT.inStorage = [70 + 50]; //Resources + food
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} food
    */
    _INIT.food = [50];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} energy
    */
    _INIT.energy = [60];
    /**
    * Stores values for statistics
    * @memberof Conf
    * @member {array} air
    */
    _INIT.air = [50];

    //modifiers
    /**
    * Modifier for Power Outages
    * @memberof Conf
    * @member {int} blackout
    */
    _INIT.blackout = 0;
    /**
    * Modifier for Air Shortages
    * @memberof Conf
    * @member {int} noAir
    */
    _INIT.noAir = 0;
    /**
    * Modifier for Birth to preschool
    * @memberof Conf
    * @member {int} creche
    */
    _INIT.creche = 0;
    /**
    * Modifier for Education length
    * @memberof Conf
    * @member {int} uni
    */
    _INIT.uni = 0;
    /**
    * Modifier for Bot training & testing
    * @memberof Conf
    * @member {int} botAging
    */
    _INIT.botAging = 0;
    /**
    * Modifier for Recreation
    * @memberof Conf
    * @member {int} leisure
    */
    _INIT.leisure = 0;

    /**
    * Handles save and load data (managaing what needs to be saved)
    * @memberof Conf
    * @method saveData
    * @param {array} [dataIn] If loading, this is the data to load
    */
    _INIT.saveData = function(dataIn){
        var thingsToSave = [
                "turn",
                "mapTiles",
                "home",
                "buildings",
                "robotsList",
                "commTowers",
                "recyclerList",
                "researchLabs",
                "researchTopics",
                "ores",
                "procOres",
                "inputSeed",
                "housing",
                "pop",
                "tossPop",
                "tossBabies",
                "tossStudents",
                "tossAdults",
                "hipPop",
                "hipBabies",
                "hipStudents",
                "hipAdults",
                "artPop",
                "artBabies",
                "artStudents",
                "artAdults",
                "employed",
                "sdf",
                "tossMorale",
                "hipMorale",
                "artMorale",
                "crime",
                "storageCap",
                "inStorage",
                "food",
                "energy",
                "air",
                "blackout",
                "noAir",
                "creche",
                "uni",
                "botAging",
                "leisure"
            ];
        if(dataIn === undefined){
            var saveData = [];
            for (var i = thingsToSave.length - 1; i >= 0; i--) {
                saveData.push(Conf[thingsToSave[i]]);
            };
            return saveData;
        } else {
            for(var i = thingsToSave.length - 1; i >= 0; i--) {
                Conf[thingsToSave[i]] = dataIn[thingsToSave.length - (i + 1)];
            };
            Conf.buildings[37][1] = false;
            CneTools.checkBuildings();
            CneTools.checkRobots();
            Menu.recount('all');
            Stats.executiveReview();
            Research.refreshMenu();
            Display.drawRadar();
            Conf.turnNum.innerHTML = TRANS.weekCounter + Conf.turn;
            Tools.flush(document.getElementById('consoleContent'));
            Terminal.print(TRANS.itIsNow + ' ' + TRANS.week + ' ' + Conf.turn);
            CneTools.moveTo(true, Conf.home[0], Conf.home[1], 0);
        }
    }

    /**
    * Reinitializes Conf
    * @memberof Conf
    * @method reset
    */
    _INIT.reset = function(){
        Conf = Object.create(_INIT);
    }


    /**
    * Returns a copy of _INIT
    */
    return Object.create(_INIT);
})();
