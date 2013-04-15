/*jslint node: true */
"use strict"; //this will break everything if there's any errors... that's a good thing
var Game; //Global so I can get at it from other scripts...
var Lang = new Language('Gliese 581d');
var Music = new Playlist();
var Disk = new GameDisk();
//var saveList = [];

//Nice map: 1363032002367
//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/

function Construction() {
    /*
    Notes: I got rid of food because why would one building use more than another?! So it should become a global variable.
    Think about making tile[x][y][0] the terrain and tile[x][y][1] the construction
     */
    this.ref = "";
    this.position = [150, 150];
    this.kind = 3;
    this.exists = false;
    this.buildTime = -1;
    this.age = 0;
    this.health = 0;
    this.energy = 0;
    this.food = 0;
    this.tossMorale = 0;
    this.hipMorale = 0;
    this.artMorale = 0;
    this.air = 0;
    this.crime = 0;
    this.waste = 0;
    this.storage = 0;
    this.tossPop = 0;
    this.hipPop = 0;
    this.artPop = 0;
    this.housing = 0;
    this.employees = 0;

    this.ores = [];

    this.future = [3, Lang.prepared];
    this.robot = -1;
    this.mining = false;
    this.vital = false;
    this.shutdown = false;
    this.researchTopic = 'noResearch';
}

function nextTurn(x, y, level) {
    var tile = Game.mapTiles[level][y][x];

    var checkMine = function(xIn, yIn, levelIn) {
        for(var i = 0; i < 6; i++) {
            if(Game.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]] && Game.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]].kind === 221 && !Game.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]].shutdown) {
                return true;
            }
        }
        return false;
    };

    if(typeof tile.kind === "number") {

        //GENERAL ADVANCEMENT OF THE GAME
        if(tile.exists) {
            tile.age += 1;
            //If power is back, FLAME ON!
            if(Game.energy[Game.energy.length - 1] > 10 && tile.shutdown) {
                Game.energy[Game.energy.length - 1] += tile.energy;
                tile.shutdown = false;
            }
            //Provided everything is good, rock and roll
            if((Game.energy[Game.energy.length - 1] <= 10 && tile.vital) || Game.energy[Game.energy.length - 1] > 10) {
                Game.tossBabies[Game.tossBabies.length - 1] += tile.tossPop;
                Game.hipBabies[Game.hipBabies.length - 1] += tile.hipPop;
                Game.artBabies[Game.artBabies.length - 1] += tile.artPop;
                Game.housing[Game.housing.length - 1] += tile.housing;
                Game.tossMorale[Game.tossMorale.length - 1] += tile.tossMorale;
                Game.hipMorale[Game.hipMorale.length - 1] += tile.hipMorale;
                Game.artMorale[Game.artMorale.length - 1] += tile.artMorale;
                Game.crime[Game.crime.length - 1] += tile.crime;
                if(Game.storageCap[Game.storageCap.length - 1] - Game.inStorage[Game.inStorage.length - 1] >= tile.food) {
                    Game.food[Game.food.length - 1] += tile.food;
                    Game.inStorage[Game.inStorage.length - 1] += tile.food;
                }
            } else if(Game.energy[Game.energy.length - 1] <= 10 && !tile.vital) {
                //Otherwise shutdown for a turn
                Game.energy[Game.energy.length - 1] -= tile.energy;
                tile.shutdown = true;
                Game.blackout = 1;
            }
        }

        //BUILDING
        if(tile.buildTime > 0) {
            tile.buildTime -= 1;
        } else if(tile.buildTime === 0) {
            tile.ores = Game.map[level][y][x].resources;
            tile.buildTime = -1;
            Game.mapTiles[level][y][x].ref = changeName(tile.future[1], Game.map[level][y][x].ref);
            tile.exists = true;
            Game.storageCap[Game.storageCap.length - 1] += tile.storage;
            Game.energy[Game.energy.length - 1] += tile.energy;
            Game.employed[Game.employed.length - 1] += tile.employees;
            if(tile.robot >= 0) {
                Game.robotsList[tile.robot][0] -= 1;
                tile.robot = -1;
            }
            if((tile.kind === 101 && tile.future[0] === 204) || (tile.kind === 102 && tile.future[0] === 221)) {
                Game.mapTiles[level][y][x] = bobTheBuilder(tile.future[0], x, y, level, false);
            } else {
                tile.kind = tile.future[0];
                nextTurn(x, y, level);
            }
            if(tile.kind === 203){
                Game.air[Game.air.length - 1] += tile.air;
            }else if(tile.kind >= 208 && tile.kind <= 210){
                Game.commTowers.push([x, y]);
            } else if(tile.kind === 222){
                if(Game.creche <= 12){
                    Game.creche += 1;
                }
            } else if(tile.kind === 224){
                Game.leisure += 1;
            } else if(tile.kind === 225){
                Game.recyclerList.push([x,y,level]);
            } else if(tile.kind === 227 || tile.kind === 228){
                console.log('x: ' + x + ' y: ' + y + ' level: '+ level +  tile.researchTopic);
                Game.researchLabs.push([level, y, x]);
            } else if(tile.kind === 233){
                if(Game.uni <= 24){
                    Game.uni += 1;
                }
            }
        }

        //MINING
        if(tile.mining && (tile.kind === 221 || checkMine(x, y, level))) {
            var stillMining = false;
            for(var ore = 0; ore < tile.ores.length; ore++) {
                if(tile.ores.length > 0 && tile.ores[ore] > 0) {
                    stillMining = true;
                    var mined = Math.floor(Math.random() + 0.5);
                    if(Game.storageCap[Game.storageCap.length - 1] - Game.inStorage[Game.inStorage.length - 1] >= mined) {
                        tile.ores[ore] -= mined;
                        Game.inStorage[Game.inStorage.length - 1] += mined;
                        Game.ores[ore] ? Game.ores[ore] += mined : Game.ores[ore] = mined;
                    }
                }
            }
            if(!stillMining) {
                tile.mining = false;
                Game.mapTiles[level][y][x].ref = changeName(Lang.minedOut, Game.mapTiles[level][y][x].ref);
            }
        }
        //TODO: will surely need to fix this after ...
        //Research
        if(tile.researchTopic !== 'noResearch'){
            console.log(tile.researchTopic);
            var topic = tile.researchTopic;
            var labRef = researchTopicRef(topic);
            if(labRef[3] > 1){
                labRef[3] -= 1;
            } else if(labRef[3] === 1) {
                labRef[3] = 0;
                tile.researchTopic = 'noResearch';
                //Set the research results here
                switch(topic){
                    case "engineering":
                        console.log('Just finished studying Engineering! :-D');
                    break;
                    case "agriculturalEngineering":
                    break;
                    case "hydroponics":
                    break;
                    case "noSoilFarming":
                    break;
                    case "xtremeTempAgriculture":
                    break;
                    case "electricalEngineering":
                    break;
                    case "commTech":
                    break;
                    case "pcbDesign":
                    break;
                    case "processors":
                    break;
                    case "robotics":
                    break;
                    case "geneticEngineering":
                    break;
                    case "animalGenetics":
                    break;
                    case "horticulturalGenetics":
                    break;
                    case "humanGenetics":
                    break;
                    case "longevityResearch":
                    break;
                    case "mechanicalEngineering":
                    break;
                    case "massProduction":
                    break;
                    case "mechatronics":
                    break;
                    case "plm":
                    break;
                    case "softwareEngineering":
                    break;
                    case "ai":
                    break;
                    case "culturalSensitivity":
                    break;
                    case "imageProcessing":
                    break;
                    case "naturalLanguage":
                    break;
                    case "neuralNetworks":
                    break;
                    case "geoEngineering":
                    break;
                    case "terraforming":
                    break;
                    case "weatherControl":
                    break;
                    case "science":
                    break;
                    case "physics":
                    break;
                    case "experimentalPhysics":
                    break;
                    case "advancedMaterials":
                    break;
                    case "compositieMaterials":
                    break;
                    case "selfHealingMaterials":
                    break;
                    case "conductivePolymers":
                    break;
                    case "opticalMaterials":
                    break;
                    case "nanotech":
                    break;
                    case "bioNeutralNano":
                    break;
                    case "ggam":
                    break;
                    case "nanoFab":
                    break;
                    case "theoreticalPhysics":
                    break;
                    case "astronomy":
                    break;
                    case "meteorology":
                    break;
                    case "nuclearPhysics":
                    break;
                    case "chemistry":
                    break;
                    case "organicChemistry":
                    break;
                    case "polymers":
                    break;
                    case "physicalChemistry":
                    break;
                    case "oreProcessing":
                    break;
                    case "metallurgy":
                    break;
                    case "pharmaceuticalChemistry":
                    break;
                    case "herbicides":
                    break;
                    case "medicines":
                    break;
                    case "biology":
                    break;
                    case "anatomy":
                    break;
                    case "horticulture":
                    break;
                    case "physiology":
                    break;
                    case "radiationEffects":
                    break;
                    case "lowGravEffects":
                    break;
                    case "medicine":
                    break;
                    case "oncology":
                    break;
                    case "orthopaedics":
                    break;
                    case "paedeatrics":
                    break;
                    case "placebos":
                    break;
                    case "traditional":
                        //Do Nothing... har har har
                    break;
                    case "arts":
                    break;
                    case "sociology":
                    break;
                    case "socialPolicy":
                    break;
                    case "politicalScience":
                    break;
                    case "culturalRelations":
                    break;
                    case "philosophy":
                    break;
                    case "ethics":
                    break;
                    case "scientificTheory":
                    break;
                    case "classicalPhilosophy":
                    break;
                    default:
                        console.log("What did you say you studied? " + topic);
                }
            }
        }

        //Processing
        if(tile.kind === 223 && !tile.shutdown) {
            //create a list of ores ready for processing
            var available = [];
            var count = 0;
            var processingLimit = 10;
            for(var check = 0; check < Game.ores.length; check++) {
                if(Game.ores[check] && Game.ores[check] > 0) {
                    available.push(check);
                    count += Game.ores[check];
                }
            }
            //go through it, moving a tonne from ore to processed, this is the processing limit of the processor
            if(count > processingLimit) {
                count = processingLimit;
            }
            while(count > 0) {
                var pick = randGen(available.length, 0);
                if(Game.ores[available[pick]] > 0) {
                    Game.ores[available[pick]] -= 1;
                    switch(available[pick]) {
                        //direct ores to the right index of the processed array
                    case 0:
                    case 1:
                    case 2:
                        Game.procOres[0] += 1;
                        break;
                    case 3:
                        Game.procOres[1] += 1;
                        break;
                    case 4:
                    case 5:
                    case 6:
                        Game.procOres[2] += 1;
                        break;
                    case 7:
                    case 8:
                        Game.procOres[3] += 1;
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        Game.procOres[4] += 1;
                        break;
                    case 13:
                    case 14:
                        Game.procOres[5] += 1;
                        break;
                    case 15:
                    case 16:
                        Game.procOres[6] += 1;
                        break;
                    case 17:
                    case 18:
                        Game.procOres[7] += 1;
                        break;
                    case 19:
                    case 20:
                        Game.procOres[8] += 1;
                        break;
                    case 21:
                    case 22:
                        Game.procOres[9] += 1;
                        break;
                    case 23:
                        Game.procOres[10] += 1;
                        break;
                    case 24:
                    case 25:
                        Game.procOres[11] += 1;
                        break;
                    case 26:
                    case 27:
                        Game.procOres[12] += 1;
                        break;
                    case 28:
                    case 29:
                        Game.procOres[13] += 1;
                        break;
                    default:
                        console.log("Whoah Timmy! You don't wanna stick that in the furnace! " + available[pick]);
                    }
                    count -= 1;
                }
            }
        }
    }
}

function bobTheBuilder(kind, x, y, level, builderBot) {
    console.log(kind);
    var eta = function(turns) {
            if(Game.map[level][y][x].kind === 1 || Game.map[level][y][x].kind === 6) {
                return Math.floor(turns * 1.5);
            } else if(Game.map[level][y][x].kind === 2 || Game.map[level][y][x].kind === 7) {
                return Math.floor(turns * 2.4);
            } else {
                return turns;
            }
        };

    if(Game.map[level][y][x].kind !== 4) {
        var o = new Construction();
        o.kind = 100;
        o.position = [level, x, y];
        if(kind >= 200 && kind < 300) {
            o.ref = changeName(Lang.building + Game.buildings[kind - 200][3], Game.map[level][y][x].ref);
        }


            console.log(kind);
        switch(kind) {
            //Bots
        case 100:
            o.vital = true;
            o.buildTime = eta(2);
            o.future = [3, Lang.prepared];
            o.ref = changeName(Lang.preparing, Game.map[level][y][x].ref);
            o.robot = 0;
            Game.robotsList[0][0] += 1;
            reCount('dozer');
            break;
        case 101:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(2);
            if(builderBot) {
                o.future = [204, Lang.building];
            }
            o.ref = changeName(Lang.digging, Game.map[level][y][x].ref);
            o.robot = 1;
            Game.robotsList[1][0] += 1;
            reCount('digger');
            break;
        case 101101:
            o.vital = true;
            o.kind = 8;
            o.buildTime = eta(3);
            o.future = [Game.map[level][y][x].kind - 5, Lang.cavern];
            o.kind = 8;
            o.ref = changeName(Lang.diggingCavern, Game.map[level][y][x].ref);
            reCount('cavernDigger');
            break;

        case 102:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(3);
            if(builderBot) {
                o.future = [221, Lang.building];
            }
            o.ref = changeName(Lang.mining, Game.map[level][y][x].ref);
            o.mining = true;
            o.robot = 3;
            Game.robotsList[3][0] += 1;
            reCount('miner');
            break;
        case 102102:
            o.vital = true;
            o.buildTime = 2;
            o.kind = Game.map[level][y][x].kind;
            if(Game.map[level][y][x].kind > 8 || builderBot) {
                if(builderBot) {
                    o.future = [221, Lang.building];
                } else {
                    o.future = [o.kind, Lang.mining];
                }
                o.ref = changeName(Lang.mining, Game.map[level][y][x].ref);
                o.mining = true;
            } else if(level > 0) {
                o.future = [Game.map[level][y][x].kind - 5, Lang.cavern];
                o.kind = Game.map[level][y][x].kind - 5;
            }
            break;
        case 103:
            //TODO recycler code
            break;

            //Buildings
        case 200:
            //agridome
            o.vital = true;
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -20;
            o.tossMorale = 1;
            o.hipMorale = 2;
            o.food = 3;
            o.crime = 2;
            o.waste = 2;
            o.storage = 15;
            o.future = [kind, Lang.agri];
            o.employees = 2;
            break;
        case 201:
            //advanced agridome
            o.buildTime = eta(3);
            o.health = 90;
            o.energy = -25;
            o.tossMorale = 2;
            o.hipMorale = 4;
            o.artMorale = 1;
            o.food = 6;
            o.crime = 1;
            o.waste = 1;
            o.storage = 20;
            o.future = [kind, Lang.agri2];
            o.employees = 1;
            break;
        case 202:
            //airport
            o.buildTime = eta(3);
            o.health = 60;
            o.energy = -15;
            o.tossMorale = -1;
            o.hipMorale = -2;
            o.crime = 3;
            o.waste = 1;
            o.storage = 15;
            o.future = [kind, Lang.airport];
            o.employees = 1;
            break;
        case 203:
            //arp
            o.vital = true;
            o.buildTime = eta(3);
            o.health = 80;
            o.energy = -60;
            o.tossMorale = 5;
            o.hipMorale = 5;
            o.crime = 2;
            o.storage = 2;
            o.air = 100;
            o.future = [kind, Lang.arp];
            o.employees = 2;
            break;
        case 204:
            //airshaft
            o.vital = true;
            o.buildTime = 2;
            o.health = 50;
            o.energy = -5;
            o.storage = 1;
            o.future = [kind, Lang.airlift];
            break;
        case 205:
            //barracks
            o.buildTime = eta(2);
            o.health = 90;
            o.energy = -15;
            o.tossMorale = -5;
            o.hipMorale = -10;
            o.crime = -5;
            o.waste = 5;
            o.storage = 5;
            o.future = [kind, Lang.barracks];
            o.employees = 2;
            break;
        case 206:
            //civil protection
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -10;
            o.tossMorale = 1;
            o.hipMorale = 1;
            o.artMorale = 1;
            o.crime = -15;
            o.waste = 2;
            o.storage = 2;
            o.future = [kind, Lang.civprot];
            o.employees = 3;
            break;
        case 207:
            //civil protection 2
            o.buildTime = eta(3);
            o.health = 90;
            o.energy = -15;
            o.tossMorale = 2;
            o.hipMorale = 2;
            o.artMorale = 2;
            o.crime = -30;
            o.waste = 1;
            o.storage = 3;
            o.future = [kind, Lang.civprot2];
            o.employees = 1;
            break;
        case 208:
            //comm array
            o.buildTime = eta(1);
            o.health = 60;
            o.energy = -10;
            o.hipMorale = -3;
            o.crime = 1;
            o.storage = 2;
            o.future = [kind, Lang.commarray];
            break;
        case 209:
            //comm array 2
            o.buildTime = eta(2);
            o.health = 80;
            o.energy = -15;
            o.tossMorale = -1;
            o.hipMorale = -5;
            o.artMorale = 1;
            o.artMorale = 2;
            o.crime = 2;
            o.storage = 2;
            o.future = [kind, Lang.commarray2];
            break;
        case 210:
            //command
            o.vital = true;
            o.buildTime = eta(2);
            o.health = 100;
            o.energy = -30;
            o.tossMorale = 5;
            o.hipMorale = 5;
            o.artMorale = 5;
            o.crime = -3;
            o.waste = 1;
            o.storage = 10;
            o.future = [kind, Lang.command];
            o.employees = 3;
            break;
        case 211:
            // connector
            o.vital = true;
            o.buildTime = eta(1);
            o.health = 20;
            o.energy = -1;
            o.storage = 1;
            o.future = [kind, Lang.connector];
            break;
        case 212:
            // drone factory
            o.buildTime = eta(4);
            o.health = 80;
            o.energy = -100;
            o.tossMorale = -5;
            o.hipMorale = -10;
            o.artMorale = 5;
            o.artPop = 0.5;
            o.crime = 2;
            o.waste = 5;
            o.storage = 30;
            o.future = [kind, Lang.dronefab];
            o.employees = 3;
            break;
        case 213:
            // fission
            o.vital = true;
            o.buildTime = eta(4);
            o.health = 70;
            o.energy = 1500;
            o.tossMorale = -10;
            o.hipMorale = -20;
            o.artMorale = -5;
            o.crime = 3;
            o.waste = 8;
            o.storage = 5;
            o.future = [kind, Lang.chernobyl];
            o.employees = 3;
            break;
        case 214:
            // fusion
            o.vital = true;
            o.buildTime = eta(5);
            o.health = 90;
            o.energy = 2500;
            o.tossMorale = 5;
            o.hipMorale = 5;
            o.artMorale = 5;
            o.waste = 3;
            o.storage = 5;
            o.future = [kind, Lang.tokamak];
            o.employees = 2;
            break;
        case 215:
            // factory
            o.buildTime = eta(3);
            o.health = 70;
            o.energy = -100;
            o.tossMorale = -5;
            o.hipMorale = -10;
            o.artMorale = 0;
            o.artPop = 0.2;
            o.crime = 3;
            o.waste = 5;
            o.storage = 30;
            o.future = [kind, Lang.genfab];
            o.employees = 3;
            break;
        case 216:
            // geothermal
            o.vital = true;
            o.buildTime = eta(4);
            o.health = 70;
            o.energy = 200;
            o.tossMorale = 5;
            o.hipMorale = 5;
            o.artMorale = 5;
            o.storage = 2;
            o.future = [kind, Lang.geotherm];
            o.employees = 2;
            break;
        case 217:
            // habitat
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -15;
            o.tossMorale = 2;
            o.hipMorale = 2;
            o.artMorale = 2;
            o.hipPop = 0.1;
            o.tossPop = 0.1;
            o.crime = 3;
            o.waste = 3;
            o.storage = 10;
            o.housing = 30;
            o.future = [kind, Lang.hab];
            o.employees = 1;
            break;
        case 218:
            // habitat 2
            o.buildTime = eta(3);
            o.health = 80;
            o.energy = -20;
            o.tossMorale = 4;
            o.hipMorale = 4;
            o.artMorale = 4;
            o.hipPop = 0.2;
            o.tossPop = 0.2;
            o.crime = 2;
            o.waste = 2;
            o.storage = 10;
            o.housing = 40;
            o.future = [kind, Lang.hab2];
            o.employees = 1;
            break;
        case 219:
            // habitat 3
            o.buildTime = eta(4);
            o.health = 90;
            o.energy = -25;
            o.tossMorale = 6;
            o.hipMorale = 6;
            o.artMorale = 6;
            o.hipPop = 0.3;
            o.tossPop = 0.3;
            o.crime = 1;
            o.waste = 1;
            o.storage = 15;
            o.housing = 50;
            o.future = [kind, Lang.hab3];
            o.employees = 1;
            break;
        case 220:
            // hospital
            o.buildTime = eta(3);
            o.health = 80;
            o.energy = -40;
            o.tossMorale = 10;
            o.hipMorale = 10;
            o.artMorale = 0;
            o.crime = 2;
            o.waste = 5;
            o.storage = 5;
            o.future = [kind, Lang.er];
            o.employees = 3;
            break;
        case 221:
            // mine
            o.buildTime = 2;
            o.health = 80;
            o.energy = -40;
            o.tossMorale = -2;
            o.hipMorale = -2;
            o.artMorale = -2;
            o.crime = 5;
            o.waste = 1;
            o.mining = true;
            o.storage = 20;
            o.future = [kind, Lang.mine];
            break;
        case 222:
            // nursery
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -30;
            o.tossMorale = 5;
            o.hipMorale = 5;
            o.artMorale = 0;
            o.hipPop = 0.2;
            o.tossPop = 0.2;
            o.crime = 2;
            o.waste = 3;
            o.storage = 2;
            o.future = [kind, Lang.nursery];
            o.employees = 1;
            break;
        case 223:
            // ore processor
            o.buildTime = eta(2);
            o.health = 80;
            o.energy = -120;
            o.tossMorale = -15;
            o.hipMorale = -15;
            o.artMorale = -15;
            o.crime = 5;
            o.waste = 2;
            o.storage = 50;
            o.future = [kind, Lang.oreproc];
            o.employees = 2;
            break;
        case 224:
            // recreation center
            o.buildTime = eta(3);
            o.health = 60;
            o.energy = -20;
            o.tossMorale = 15;
            o.hipMorale = 15;
            o.artMorale = 5;
            o.crime = 5;
            o.waste = 2;
            o.storage = 50;
            o.future = [kind, Lang.rec];
            o.employees = 2;
            break;
        case 225:
            // recycler
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -80;
            o.tossMorale = 5;
            o.hipMorale = 10;
            o.artMorale = 5;
            o.crime = 3;
            o.waste = -25;
            o.storage = 30;
            o.future = [kind, Lang.recycler];
            o.employees = 1;
            break;
        case 226:
            // red light district
            o.buildTime = eta(2);
            o.health = 30;
            o.energy = -15;
            o.tossMorale = 25;
            o.hipMorale = 20;
            o.artMorale = 10;
            o.hipPop = 0.1;
            o.tossPop = 0.1;
            o.crime = 15;
            o.waste = 10;
            o.storage = 5;
            o.future = [kind, Lang.clichy];
            o.employees = 2;
            break;
        case 227:
            // research center
            o.buildTime = eta(3);
            o.health = 80;
            o.energy = -15;
            o.tossMorale = 2;
            o.hipMorale = 1;
            o.artMorale = 2;
            o.crime = 2;
            o.waste = 5;
            o.storage = 2;
            o.future = [kind, Lang.research];
            o.employees = 3;
            break;
        case 228:
            // research 2
            o.buildTime = eta(4);
            o.health = 60;
            o.energy = -20;
            o.tossMorale = 3;
            o.hipMorale = 2;
            o.artMorale = 3;
            o.crime = 1;
            o.waste = 3;
            o.storage = 3;
            o.future = [kind, Lang.research2];
            o.employees = 3;
            break;
        case 229:
            // solar farm
            o.vital = true;
            o.buildTime = eta(2);
            o.health = 30;
            o.energy = 250;
            o.tossMorale = 4;
            o.hipMorale = 8;
            o.artMorale = 4;
            o.future = [kind, Lang.solar];
            break;
        case 230:
            // space port
            o.buildTime = eta(5);
            o.health = 80;
            o.energy = -80;
            o.tossMorale = 5;
            o.hipMorale = -5;
            o.artMorale = 0;
            o.crime = 5;
            o.waste = 2;
            o.storage = 20;
            o.future = [kind, Lang.space];
            o.employees = 2;
            break;
        case 231:
            // stasis block
            o.buildTime = eta(4);
            o.health = 100;
            o.energy = -40;
            o.crime = 5;
            o.waste = 1;
            o.storage = 15;
            o.future = [kind, Lang.stasis];
            o.employees = 1;
            break;
        case 232:
            // Storage Tanks
            o.buildTime = eta(1);
            o.health = 40;
            o.energy = -5;
            o.tossMorale = -3;
            o.hipMorale = -3;
            o.artMorale = -3;
            o.crime = 3;
            o.waste = 1;
            o.storage = 1000;
            o.future = [kind, Lang.store];
            o.employees = 1;
            break;
        case 233:
            // University
            o.buildTime = eta(2);
            o.health = 70;
            o.energy = -15;
            o.tossMorale = 10;
            o.hipMorale = 5;
            o.artMorale = 2;
            o.crime = -2;
            o.waste = 2;
            o.storage = 3;
            o.future = [kind, Lang.uni];
            o.employees = 2;
            break;
        case 234:
            // warehouse
            o.buildTime = eta(1);
            o.health = 40;
            o.energy = -5;
            o.tossMorale = -3;
            o.hipMorale = -3;
            o.artMorale = -3;
            o.crime = 3;
            o.waste = 1;
            o.storage = 150;
            o.future = [kind, Lang.warehouse];
            o.employees = 1;
            break;
        case 235:
            // windfarm
            o.vital = true;
            o.buildTime = eta(3);
            o.health = 40;
            o.energy = 200;
            o.tossMorale = 2;
            o.hipMorale = 4;
            o.artMorale = 2;
            o.future = [kind, Lang.windfarm];
            o.employees = 1;
            break;
        case 236:
            // workshop
            o.buildTime = eta(3);
            o.health = 70;
            o.energy = -30;
            o.tossMorale = 5;
            o.hipMorale = -2;
            o.artMorale = 10;
            o.artPop = 0.2;
            o.crime = 3;
            o.waste = 2;
            o.storage = 5;
            o.future = [kind, Lang.workshop];
            o.employees = 2;
            break;
        case 237:
            // lander
            o.vital = true;
            o.kind = 237;
            o.buildTime = eta(0);
            o.health = 70;
            o.storage = 50;
            o.energy = 60;
            o.future = [kind, Lang.lander];
            o.ref = changeName(Lang.lander, Game.map[level][y][x].ref);
            break;
        default:
            console.log("Bob can't build it... :( " + kind);
            return false;
        }
        return o;
    } else {
        printConsole(Lang.onWater);
    }
}

/**
 * The main object for a tile, tracking its kind, and state
 */

function Terrain() {
    /*
    this.kind; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.UG;
    this.turns; //remembers how many turns are left to become a tile of the desired kind
    this.diggable;
    */
    this.resources = [];
    //this.ref;
}

function recycle(kind, x, y, level){
    var recycled = false;
    for(var i = 0; i < Game.recyclerList.length; i++){
        if(!Game.mapTiles[Game.recyclerList[i][2]][Game.recyclerList[i][1]][Game.recyclerList[i][0]][1].shutdown && !recycled){
            recycled = true;
            Game.mapTiles[level][y][x][1] = bobTheBuilder(103, x, y, level);
            var recovered = resourceNeededList(getBuildingRef(kind), false, true);
            for(var j = 0; j < recovered.length; j++){
                if(Game.storageCap[Game.storageCap.length - 1] - Game.inStorage[Game.inStorage.length - 1] >= recovered[j][1]){
                    Game.procOres[recovered[j][0]] += recovered[j][1];
                } else {
                    printConsole(Lang.recycleFailure);
                }
            }
        }
    }
    if(!recycled){
        printConsole(Lang.noRecyclers);
    }
    execReview();
}

//GENERAL SETUP AND TOOLS**********************************************************************************************

function GameDisk(){
    var fs = null;
    this.openfs = function(){
        window.webkitRequestFileSystem(window.PERSISTENT, 50*1024*1024 /*50MB*/, success, errorHandler);
    };
    var success = function(filesystem){
        fs = filesystem;
        Disk.loadList();
    };
    this.loadList = function(){
        //fill the list of loadable games
        var dirReader = fs.root.createReader();
        var entries = [];

        // Call the reader.readEntries() until no more results are returned.
        var readEntries = function() {
            dirReader.readEntries (function(results) {
            if (!results.length) {
                listResults(entries);//this function fills our list of saves
            } else {
                entries = entries.concat(toArray(results));
                readEntries();
            }
            }, errorHandler);
        };
        var toArray = function(list) {
            return Array.prototype.slice.call(list || [], 0);
        };
        //List the loaded results, such as the buttons for the loads
        var listResults = function(list){
            var fragment = document.createDocumentFragment();
            var title = document.createElement('span');
            title.innerHTML = Lang.saves;
            fragment.appendChild(title);
            var ids = [];
            var rmIds = [];

            list.forEach(function(entry, i) {
                var btn = document.createElement('button');
                btn.classList.add('save_option');
                btn.classList.add('main_pointer');
                btn.id = 'save' + i;
                ids.push('save' + i);
                btn.value = entry.name;
                btn.innerHTML = entry.name;
                fragment.appendChild(btn);
                var del = document.createElement('button');
                del.classList.add('red_glass');
                del.classList.add('delete_save');
                del.classList.add('main_pointer');
                del.id = 'rm' + i;
                rmIds.push('rm' + i);
                del.value = entry.name;
                del.innerHTML = '&#215;';
                fragment.appendChild(del);
            });
            flush(document.getElementById('chooseSave'));
            document.getElementById('chooseSave').appendChild(fragment);
            for(var j = 0; j < ids.length; j++){
                //I've discovered closure! wow...
                (function(_j){
                    var id = ids[j];
                    var rmId = rmIds[j];
                    var obj = document.getElementById(id);
                    var rmObj = document.getElementById(rmId);
                    var objFn = function(){
                        document.getElementById('seed').value = document.getElementById(id).value;
                    };
                    var rmObjFn = function(){
                        var nameIn = document.getElementById(rmId).value;
                        document.getElementById('deleteOK').value = nameIn;
                        document.getElementById('confirmDeleteTxt').innerHTML = Lang.confirmDelete + ' "' + nameIn + '"';
                        document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                        document.getElementById('deleteOK').onclick = function(){
                            Disk.deleteGame(nameIn);
                            document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                            document.getElementById('deleteOK').onclick = null;
                        };
                        document.getElementById('deleteBad').onclick = function(){
                            document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                            document.getElementById('deleteBad').onclick = null;
                        };
                    };
                    obj.addEventListener('click', objFn, false);
                    rmObj.addEventListener('click', rmObjFn, false);
                })();
            }
            document.getElementById('popup').classList.add('popup_open');
        };
        readEntries(); // Start reading dirs.
    };

    this.deleteGame = function(name){
        fs.root.getFile(name, {create: false}, function(fileEntry) {fileEntry.remove(function() {
                console.log(name + ' has been removed.');
                Disk.loadList();
            }, errorHandler);
        }, errorHandler);
    };

    this.saveGame = function(name){
        fs.root.getFile(Game.inputSeed, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter){
                fileWriter.onwriteend = function(e){
                    console.log('File written');
                };
                fileWriter.onerror = function(e){
                    console.log('File write failed: ' + e.toString());
                };
                fileWriter.write(buildSave());
            }, errorHandler);
        }, errorHandler);
    };

    this.loadGame = function(name){
        fs.root.getFile(name, {}, function(fileEntry) {
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function(e){
                    //TODO: make sure the type is conserved e.g. Game.mapTiles**[]** = saveDataOut[1];
                    var saveDataOut = JSON.parse(this.result);
                    Game.turn = saveDataOut[0];
                    Game.mapTiles = saveDataOut[1];
                    Game.home = saveDataOut[2];
                    Game.buildings = saveDataOut[3];
                    Game.robotsList = saveDataOut[4];
                    Game.commTowers = saveDataOut[5];
                    Game.recyclerList = saveDataOut[6];
                    Game.researchLabs = saveDataOut[7];
                    Game.researchTopics = saveDataOut[8];
                    Game.ores = saveDataOut[9];
                    Game.procOres = saveDataOut[10];
                    Game.inputSeed = saveDataOut[11];
                    Game.housing = saveDataOut[12];
                    Game.pop = saveDataOut[13];
                    Game.tossPop = saveDataOut[14];
                    Game.tossBabies = saveDataOut[15];
                    Game.tossStudents = saveDataOut[16];
                    Game.tossAdults = saveDataOut[17];
                    Game.hipPop = saveDataOut[18];
                    Game.hipBabies = saveDataOut[19];
                    Game.hipStudents = saveDataOut[20];
                    Game.hipAdults = saveDataOut[21];
                    Game.artPop = saveDataOut[22];
                    Game.artBabies = saveDataOut[23];
                    Game.artStudents = saveDataOut[24];
                    Game.artAdults = saveDataOut[25];
                    Game.employed = saveDataOut[26];
                    Game.sdf = saveDataOut[27];
                    Game.tossMorale = saveDataOut[28];
                    Game.hipMorale = saveDataOut[29];
                    Game.artMorale = saveDataOut[30];
                    Game.crime = saveDataOut[31];
                    Game.storageCap = saveDataOut[32];
                    Game.inStorage = saveDataOut[33];
                    Game.food = saveDataOut[34];
                    Game.energy = saveDataOut[35];
                    Game.air = saveDataOut[36];
                    Game.blackout = saveDataOut[37];
                    Game.noAir = saveDataOut[38];
                    Game.creche = saveDataOut[39];
                    Game.uni = saveDataOut[40];
                    Game.botAging = saveDataOut[41];
                    Game.leisure = saveDataOut[42];
                    //Add code that gets read data and make Game equal to it...
                    Game.buildings[37][1] = false;
                    checkBuildings();
                    checkRobots();
                    reCount('all');
                    execReview();
                    fillResearchMenu();
                    drawRadar();
                    Game.turnNum.innerHTML = Lang.weekCounter + Game.turn;
                    flush(document.getElementById('consoleContent'));
                    printConsole(Lang.itIsNow + ' ' + Lang.week + ' ' + Game.turn);
                    jump(true, Game.home[0], Game.home[1], 0);
                };
                reader.readAsText(file);
            }, errorHandler);
        }, errorHandler);
    };

    var buildSave = function(){
        var saveData = [
        Game.turn,
        Game.mapTiles,
        Game.home,
        Game.buildings,
        Game.robotsList,
        Game.commTowers,
        Game.recyclerList,
        Game.researchLabs,
        Game.researchTopics,
        Game.ores,
        Game.procOres,
        Game.inputSeed,
        Game.housing,
        Game.pop,
        Game.tossPop,
        Game.tossBabies,
        Game.tossStudents,
        Game.tossAdults,
        Game.hipPop,
        Game.hipBabies,
        Game.hipStudents,
        Game.hipAdults,
        Game.artPop,
        Game.artBabies,
        Game.artStudents,
        Game.artAdults,
        Game.employed,
        Game.sdf,
        Game.tossMorale,
        Game.hipMorale,
        Game.artMorale,
        Game.crime,
        Game.storageCap,
        Game.inStorage,
        Game.food,
        Game.energy,
        Game.air,
        Game.blackout,
        Game.noAir,
        Game.creche,
        Game.uni,
        Game.botAging,
        Game.leisure
        ];
        var saveDataString = [];
        saveDataString.push(JSON.stringify(saveData));
        var blob = new Blob(saveDataString);
        return blob;
    };

    var errorHandler = function(e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'That save doesn\'t seem to exist, we\'ll start a new game and save as we go...';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      }

      console.log('Error: ' + msg);
    };
}

/**
 * The main game object
 */

function Param() {
    //Radar related vars...
    this.radarRad = 150; //this is the radius of the map that we want, changing it here should change it everywhere except the html
    //The zoomed in map related thigs...
    this.destinationWidth = 120;
    this.destinationHeight = 140;
    //this.xLimit = Math.ceil(document.width / 90);
    //this.yLimit = Math.ceil(document.height / 78);
    this.highlight = false;
    this.retX = this.radarRad;
    this.retY = this.radarRad;
    this.animate = 0;
    this.augment = true;
    this.fresh = true;
    this.clickedOn = 'none';
    this.level = 0;
    this.tileHighlight = new Image();
    this.tileHighlight.src = 'images/tools.png';
    this.spritesheet = new Image();
    this.spritesheet.src = 'images/spritesheet.png';
    /*
    this.mouseX;
    this.mouseY;
    */
    //General game stuff
    this.mouseDown = false;
    this.turnNum = document.getElementById('turnNumber');
    this.turn = 0;
    this.map = [];
    this.mapTiles = [];
    //I <3  Sublime Text 2's multiple cursors!!!
    /**
     * [[string: 'id of menu option', boolean: available to player?, int: surface(0)/subsurface(1)/both(2)]]
     * @type {Array}
     */
    this.home = [150,150];
    this.buildings = [
        ["agri", false, 0, Lang.agri], //
        ["agri2", false, 0, Lang.agri2],
        ["airport", false, 0, Lang.airport],
        ["arp", false, 2, Lang.arp], //
        ["airlift", false, 2, Lang.airlift], //
        ["barracks", false, 1, Lang.barracks],
        ["civprot", false, 2, Lang.civprot],
        ["civprot2", false, 2, Lang.civprot2],
        ["commarray", false, 0, Lang.commarray], //
        ["commarray2", false, 0, Lang.commarray2],
        ["command", false, 2, Lang.command], //
        ["connector", false, 2, Lang.connector], //
        ["dronefab", false, 0, Lang.dronefab],
        ["chernobyl", false, 0, Lang.chernobyl],
        ["tokamak", false, 0, Lang.tokamak],
        ["genfab", false, 0, Lang.genfab], //
        ["geotherm", false, 1, Lang.geotherm],
        ["hab", false, 1, Lang.hab], //
        ["hab2", false, 1, Lang.hab2],
        ["hab3", false, 1, Lang.hab3],
        ["er", false, 1, Lang.er],
        ["mine", false, 2, Lang.mine],
        ["nursery", false, 1, Lang.nursery],
        ["oreproc", false, 0, Lang.oreproc], //
        ["rec", false, 1, Lang.rec],
        ["recycling", false, 0, Lang.recycling],
        ["clichy", false, 1, Lang.clichy], //
        ["research", false, 2, Lang.research], //
        ["research2", false, 2, Lang.research2],
        ["solar", false, 0, Lang.solar],
        ["space", false, 0, Lang.space],
        ["stasis", false, 1, Lang.stasis],
        ["store", false, 2, Lang.store], //
        ["uni", false, 1, Lang.uni],
        ["warehouse", false, 2, Lang.warehouse], //
        ["windfarm", false, 0, Lang.windfarm], //
        ["workshop", false, 1, Lang.workshop], //
        ["lander", true, 0, Lang.lander]
    ];
    /**
     * List of robots
     * [[int: inUse, int: totalAvailable, string: 'idString', boolean: availableToPlayer, int: surface(0)/subsurface(1)/both(2)]]
     * @type {Array}
     */
    this.robotsList = [
        [0, 5, "dozer", false, 2], //
        [0, 3, "digger", false, 2], //
        [0, 3, "cavernDigger", false, 1], //
        [0, 3, "miner", false, 2], //
        [0, 1, "recycler", false, 2]
    ];
    this.commTowers = [];
    this.recyclerList = [];
    //[[level, y, x]]
    this.researchLabs = [];
    //this.currentResearch = 'engineering';
    //[idString, preReqsCount, subTopicsArray, turnsToComplete, totalTurnsNeeded]
    this.researchTopics = ["all", 0, [
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

    this.ores = [];
    this.resourceArray = [ //[ORENAME,PRODUCTNAME]  
        [Lang.bauxite, Lang.aluminium],
        [Lang.corundum, Lang.aluminium],
        [Lang.kryolite, Lang.aluminium],
        [Lang.limestone, Lang.calcium],
        [Lang.copperPyrite, Lang.copper],
        [Lang.copperGlance, Lang.copper],
        [Lang.malachite, Lang.copper],
        [Lang.calverite, Lang.gold],
        [Lang.sylvanite, Lang.gold],
        [Lang.haematite, Lang.iron],
        [Lang.magnetite, Lang.iron],
        [Lang.ironPyrite, Lang.iron],
        [Lang.siderite, Lang.iron],
        [Lang.galena, Lang.lead],
        [Lang.anglesite, Lang.lead],
        [Lang.dolomite, Lang.magnesium],
        [Lang.karnalite, Lang.magnesium],
        [Lang.cinnabar, Lang.mercury],
        [Lang.calomel, Lang.mercury],
        [Lang.phosphorite, Lang.phosphorous],
        [Lang.floreapetite, Lang.phosphorous],
        [Lang.saltPeter, Lang.potassium],
        [Lang.karnalite, Lang.potassium],
        [Lang.silverGlance, Lang.silver],
        [Lang.sodiumCarbonate, Lang.sodium],
        [Lang.rockSalt, Lang.sodium],
        [Lang.tinPyrites, Lang.tin],
        [Lang.cassiterite, Lang.tin],
        [Lang.zincBlende, Lang.zinc],
        [Lang.calamine, Lang.zinc]
    ];

    //0 Aluminium, 1 Calcium, 2 Copper, 3 Gold, 4 Iron, 5 Lead, 6 Magnesium, 7 Mercury,
    //8 Phosphorous, 9 Potassium, 10 Silver, 11 Sodium, 12 Tin, 13 Zinc
    this.procOresRadarOpt = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    this.procOres = [15, 2, 10, 1, 15, 5, 1, 1, 1, 4, 1, 4, 5, 5]; //Total storage = 70
    this.resourceNames = [Lang.aluminium, Lang.calcium, Lang.copper, Lang.gold, Lang.iron, Lang.lead, Lang.magnesium, Lang.mercury, Lang.phosphorous, Lang.potassium, Lang.silver, Lang.sodium, Lang.tin, Lang.zinc];
    //Map generation vars
    this.inputSeed = '';
    /*
    this.rng;
    this.noise;
    this.noise2;
    this.noise3;
    */
    //General canvas vars...
    this.mPanCanvas = document.getElementById('mPanOverlay');
    this.mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    this.mPanelCanvas = document.getElementById('mainPanel');
    this.mPanel = document.getElementById('mainPanel').getContext('2d');
    this.radarCanvas = document.getElementById('mapOverlay');
    this.radar = document.getElementById('map').getContext('2d');
    this.radarLoc = document.getElementById('mapOverlay').getContext('2d');

    //this.yShift;
    //Stats
    this.housing = [0];
    this.pop = [150];
    this.tossPop = [50];
    this.tossBabies = [0];
    this.tossStudents = [0];
    this.tossAdults = [50];
    this.hipPop = [50];
    this.hipBabies = [0];
    this.hipStudents = [0];
    this.hipAdults = [50];
    this.artPop = [50];
    this.artBabies = [0];
    this.artStudents = [0];
    this.artAdults = [50];
    this.employed = [0];
    this.sdf = [150];
    this.tossMorale = [500];
    this.hipMorale = [500];
    this.artMorale = [500];
    this.crime = [0];
    this.storageCap = [70 + 50]; //Resources + food + lander capacity
    this.inStorage = [70 + 50]; //Resources + food
    this.food = [50];
    this.energy = [60];
    this.air = [50];

    //modifiers
    this.blackout = 0; //Power Outages
    this.noAir = 0; //Air Shortages
    this.creche = 0; //Birth to preschool
    this.uni = 0; //Education length
    this.botAging = 0; //Bot training & testing
    this.leisure = 0; //Recreation
}

function setStats() {
    Game.crime.push(0);
    Game.inStorage.push(Game.inStorage[Game.inStorage.length - 1]);
    Game.storageCap.push(Game.storageCap[Game.storageCap.length - 1]);
    Game.tossBabies.push(Game.tossBabies[Game.tossBabies.length - 1]);
    Game.tossStudents.push(Game.tossStudents[Game.tossStudents.length - 1]);
    Game.tossAdults.push(Game.tossAdults[Game.tossAdults.length - 1]);
    Game.tossPop.push(Math.floor(Game.tossBabies[Game.tossBabies.length - 1] + Game.tossStudents[Game.tossStudents.length - 1] + Game.tossAdults[Game.tossAdults.length - 1]));
    Game.hipBabies.push(Game.hipBabies[Game.hipBabies.length - 1]);
    Game.hipStudents.push(Game.hipStudents[Game.hipStudents.length - 1]);
    Game.hipAdults.push(Game.hipAdults[Game.hipAdults.length - 1]);
    Game.hipPop.push(Math.floor(Game.hipBabies[Game.hipBabies.length - 1] + Game.hipStudents[Game.hipStudents.length - 1] + Game.hipAdults[Game.hipAdults.length - 1]));
    Game.artBabies.push(Game.artBabies[Game.artBabies.length - 1]);
    Game.artStudents.push(Game.artStudents[Game.artStudents.length - 1]);
    Game.artAdults.push(Game.artAdults[Game.artAdults.length - 1]);
    Game.artPop.push(Math.floor(Game.artBabies[Game.artBabies.length - 1] + Game.artStudents[Game.artStudents.length - 1] + Game.artAdults[Game.artAdults.length - 1]));
    var uniMod = 216 - Game.uni;
    if(Game.turn > uniMod){
        var tossGrads = 0;
        if(Game.tossStudents[Game.tossStudents.length - uniMod] !== Game.tossStudents[Game.tossStudents.length - uniMod - 1]){
            tossGrads = Game.tossStudents[Game.tossStudents.length - uniMod - 1] - Game.tossStudents[Game.tossStudents.length - uniMod];
        }
        var hipGrads = 0;
        if(Game.hipStudents[Game.hipStudents.length - uniMod] !== Game.hipStudents[Game.hipStudents.length - uniMod - 1]){
            hipGrads = Game.hipStudents[Game.hipStudents.length - uniMod - 1] - Game.hipStudents[Game.hipStudents.length - uniMod];
        }
        if(tossGrads > 0 || hipGrads > 0){
            Game.tossAdults[Game.tossAdults.length - 1] += tossGrads;
            Game.hipAdults[Game.hipAdults.length - 1] += hipGrads;
            Game.tossStudents[Game.tossStudents.length - 1] -= tossGrads;
            Game.hipStudents[Game.hipStudents.length - 1] -= hipGrads;
        }
    }
    var crecheMod = 36 - Game.creche;
    if(Game.turn >= crecheMod){
        var tossKids;
        if(Math.floor(Game.tossBabies[Game.tossBabies.length - crecheMod]) !== Math.floor(Game.tossBabies[Game.tossBabies.length - crecheMod - 1])){
            tossKids = Math.floor(Game.tossBabies[Game.tossBabies.length - crecheMod - 1]) - Math.floor(Game.tossBabies[Game.tossBabies.length - crecheMod]);
        }
        var hipKids = 0;
        if(Math.floor(Game.hipBabies[Game.hipBabies.length - crecheMod]) !== Math.floor(Game.hipBabies[Game.hipBabies.length - crecheMod - 1])){
            hipKids = Math.floor(Game.hipBabies[Game.hipBabies.length - crecheMod - 1]) - Math.floor(Game.hipBabies[Game.hipBabies.length - crecheMod]);
        }
        if(tossKids > 0 || hipKids > 0){
            Game.tossStudents[Game.tossStudents.length - 1] += tossKids;
            Game.hipStudents[Game.hipStudents.length - 1] += hipKids;
            Game.tossBabies[Game.tossBabies.length - 1] -= tossKids;
            Game.hipBabies[Game.hipBabies.length - 1] -= hipKids;
        }
    }
    var botBirth = 10 - Game.botAging;
    if(Game.turn >= botBirth){
        var artGrads = 0;
        if(Game.artStudents[Game.artStudents.length - botBirth] !== Game.artStudents[Game.artStudents.length - botBirth - 1]){
            artGrads = Game.artStudents[Game.artStudents.length - botBirth - 1] - Game.artStudents[Game.artStudents.length - botBirth];
        }
        var artKids = 0;
        if(Math.floor(Game.artBabies[Game.artBabies.length - botBirth]) !== Math.floor(Game.artBabies[Game.artBabies.length - botBirth - 1])){
            artKids = Math.floor(Game.artBabies[Game.artBabies.length - botBirth - 1]) - Math.floor(Game.artBabies[Game.artBabies.length - botBirth]);
        }
        if(artGrads > 0 || artKids > 0){
            Game.artStudents[Game.artStudents.length - 1] += artKids;
            Game.artAdults[Game.artAdults.length - 1] += artGrads;
            Game.artBabies[Game.artBabies.length - 1] -= artKids;
            Game.artStudents[Game.artStudents.length - 1] -= artGrads;
        }
    }

    Game.pop.push(Game.tossPop[Game.tossPop.length - 1] + Game.hipPop[Game.hipPop.length - 1] + Game.artPop[Game.artPop.length - 1]);
    Game.sdf.push(Game.pop[Game.pop.length - 1] - Math.floor(Game.housing[Game.housing.length - 1]));
    Game.housing.push(0);
    Game.employed.push(Game.employed[Game.employed.length - 1]);
    var foodConsumption = Math.floor((Game.tossPop[Game.tossPop.length - 1] + Game.hipPop[Game.hipPop.length - 1]) / 15);
    if(Game.food[Game.food.length - 1] >= foodConsumption){
        Game.food.push(Game.food[Game.food.length - 1] - foodConsumption);
        Game.inStorage[Game.inStorage.length - 1] -= foodConsumption;
    } else {
        Game.inStorage[Game.inStorage.length - 1] -= Game.food[Game.food.length - 1];
        Game.food.push(0);
    }
    Game.air.push(Game.air[Game.air.length - 1]);
    Game.energy.push(Game.energy[Game.energy.length - 1]);
    Game.turn += 1;
    //Morale
    Game.tossMorale.push(Game.tossMorale[Game.tossMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 3) + Math.floor(Game.food[Game.food.length - 1]) - Game.blackout * 10 + (Game.leisure * 2));
    Game.hipMorale.push(Game.hipMorale[Game.hipMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 3) + Math.floor(Game.food[Game.food.length - 1]) - Game.blackout * 10 + (Game.leisure * 2));
    Game.artMorale.push(Game.artMorale[Game.artMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 5) - Game.blackout * 20 + Game.leisure);

    //reset modifiers
    Game.blackout = 0;
}

function saneStats(){
    if(Game.crime[Game.crime.length - 1] < 0){
        Game.crime[Game.crime.length - 1] = 0;
    }
    if(Game.tossMorale[Game.tossMorale.length - 1] <= 0){
        Game.tossMorale[Game.tossMorale.length - 1] = 1;
    }
    if(Game.tossMorale[Game.tossMorale.length - 1] > 1000){
        Game.tossMorale[Game.tossMorale.length - 1] = 1000;
    }
    if(Game.hipMorale[Game.hipMorale.length - 1] <= 0){
        Game.hipMorale[Game.hipMorale.length - 1] = 1;
    }
    if(Game.hipMorale[Game.hipMorale.length - 1] > 1000){
        Game.hipMorale[Game.hipMorale.length - 1] = 1000;
    }
    if(Game.artMorale[Game.artMorale.length - 1] <= 0){
        Game.artMorale[Game.artMorale.length - 1] = 1;
    }
    if(Game.artMorale[Game.artMorale.length - 1] > 1000){
        Game.artMorale[Game.artMorale.length - 1] = 1000;
    }
    if(Game.food[Game.food.length - 1] < 0){
        Game.food[Game.food.length - 1] = 0;
    }
    var airAvailable = Game.air[Game.air.length - 1] - Math.floor((Game.tossPop[Game.tossPop.length -1] + Game.hipPop[Game.hipPop.length - 1])/10);
    if(airAvailable <= 0){
        Game.air[Game.air.length - 1] = 0;
        Game.noAir += 50;
        printConsole(Lang.noAir);
    } else {
        Game.noAir = 0;
    }

    Game.sdf[Game.sdf.length - 1] = Game.pop[Game.pop.length - 1] - Math.floor(Game.housing[Game.housing.length - 1]);

}

function drawGraph(type, outputId, sourceData, from0) {
    //TODO: make this a roper little library, it's too specific right now
    var can = document.getElementById(outputId);
    var con = document.getElementById(outputId).getContext('2d');
    var canW = parseInt(can.width, 10);
    var canH = parseInt(can.height, 10);
    con.clearRect(0, 0, canW, canH);
    //Get our max and min values from the input data
    var sourceClean = [];
    for(var m = 0; m < sourceData.length; m++){
        if(document.getElementById("10Week").checked && Game.turn >= 10){
            sourceClean.push(sourceData[m][0].slice(-11));
        } else {
            sourceClean.push(sourceData[m][0]);
        }
    }
    var maxMin = getMaxMin(sourceClean);
    var maxi = maxMin[0];
    var mini = maxMin[1];
    if(from0){
        mini = 0;
    }

    //returns our highest data point so we can scale the axes
    var max = function(arr) {
            var mem = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] > arr[mem]) {
                    mem = i;
                }
            }
            return mem;
        };

    var min = function(arr) {
            var mem = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] < arr[mem]) {
                    mem = i;
                }
            }
            return mem;
        };

    var normal = function(val, arr, axis) {
            var out = (arr[val] - mini) / (maxi - mini);
            return out * axis;
        };


    if(type === 'line'){
        for(var n = 0; n < sourceData.length; n++){
            var sepX = Math.floor(canW / sourceData[n][0].length);
            var tenOnly = 0;
            var tenLimit = sourceData[n][0].length - 1;
            var sepY = Math.floor(canH / sourceData[max(sourceData[n][0])]);
            if(document.getElementById("10Week").checked && Game.turn >= 10){
                sepX = Math.floor(canW / 10);
                sepY = Math.floor(canH / sourceData[max(sourceData[n][0].slice(-11))]);
                tenOnly = sourceData[n][0].length - 11;
                tenLimit = 11;
            }
            var colour = sourceData[n][1];
            //Lines
            con.beginPath();
            con.lineCap = 'round';
            con.lineJoin = 'round';
            con.moveTo(0, canH - normal(tenOnly, sourceData[n][0], canH));
            for(var k = 1; k <= tenLimit; k++) {
                var recent = k;
                if(document.getElementById("10Week").checked && Game.turn >= 10){
                    recent = sourceData[n][0].length - (11 - k);
                }
                con.lineTo(k * sepX, canH - normal(recent, sourceData[n][0], canH));
                con.arc(k * sepX, canH - normal(recent, sourceData[n][0], canH), 1, 0, Math.PI*2);
            }
            con.strokeStyle = '#000';
            con.lineWidth = 3;
            con.stroke();
            con.strokeStyle = colour;
            con.lineWidth = 2;
            con.stroke();
            con.closePath();
        }
        con.beginPath();
        con.strokeStyle = 'rgba(255,255,255,0.02)';
        con.lineWidth = 1;
        con.lineCap = 'butt';
        con.moveTo(5, Math.floor(canH - normal(0, [0], canH)));
        con.lineTo(canW - 5, Math.floor(canH - normal(0, [0], canH)));
        con.strokeStyle = 'rgba(255,255,255,0.08)';
        for(var grad = 0; grad <= 10; grad++) {
            con.moveTo(5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)], canH)));
            con.lineTo(canW - 5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)], canH)));
        }
        con.stroke();
        con.fillStyle = '#D9F7FF';
        con.font = "14px Arial";
        con.fillText(maxi, 5, 14);
        con.fillText(mini + (maxi - mini)/2, 5, Math.floor(canH/2));
        con.fillText(mini, 5, canH - 2);
        con.closePath();

    } else if(type === 'pie'){
        var topVal = 0;
        var topValRef;
        var radius = Math.floor(canH / 2.1);
        var center = [canW / 2, canH / 2];
        var fillPie = function(start, stop, colour){
            con.beginPath();
            con.fillStyle = colour;
            con.moveTo(center[0], center[1]);
            con.arc(center[0], center[1], radius, start, stop);
            con.lineTo(center[0], center[1]);
            con.fill();
            con.strokeStyle = '#222';
            con.lineWidth = 1;
            con.stroke();
            con.closePath();
        };

        var nextStart = 0;
        var total = 0;
        for(var sum = 0; sum < sourceData.length; sum++){
            total += sourceData[sum][0][sourceData[sum][0].length - 1];
        }
        for(var f = 0; f < sourceData.length; f++){
            var current = sourceData[f][0][sourceData[f][0].length - 1];
            if(current > 0){
                fillPie(nextStart, nextStart + (Math.PI*2)*(current / total), sourceData[f][1]);
                nextStart += (Math.PI*2)*(current / total);
            }
        }
    } else if(type === 'bar') {
        var barWidth = ((canH - 20) / sourceData.length) * 3;
        var startX;
        var startY;
        for(var bar = 0; bar < sourceData.length; bar ++){
            if(bar % 3 ===  0){
                startX = 10;
                startY = canH - (sourceData.length - bar)*barWidth/3 - 15;
                if(bar > 0){
                    startY += 5*bar/3;
                }
            }
            con.fillStyle = sourceData[bar][1];
            con.strokeStyle = '#222';
            con.fillRect(startX/2, startY, (normal(0, sourceData[bar][0], canW))/2, barWidth);
            con.strokeRect(startX/2, startY, (normal(0, sourceData[bar][0], canW))/2, barWidth);
            startX += normal(0, sourceData[bar][0], canW);
        }
    } else {
        console.log("Lies, lies and damned statistics" + sourceData);
    }
    //Legend, we only draw it once
    if(Game.fresh){
        var canL = document.getElementById(outputId + 'Legend');
        var conL = canL.getContext('2d');
        conL.clearRect(0, 0, canW, canH);
        var legendLeft = 15;
        var legendTop = 5;
        var legendBottom = 20;
        for(var legend = 0; legend < sourceData.length; legend++){
            conL.beginPath();
            conL.strokeStyle = '#000';
            conL.lineWidth = 0.5;
            conL.fillStyle = sourceData[legend][1];
            conL.fillRect(legendLeft, legendTop, 10, 10);
            conL.strokeRect(legendLeft, legendTop, 10, 10);
            legendTop += 15;
            conL.closePath();
            conL.beginPath();
            conL.fillStyle = '#D9F7FF';
            conL.font = "14px Arial";
            conL.fillText(sourceData[legend][2], legendLeft + 20, legendTop - 5);
            conL.closePath();
        }
    }
}

function fillResearchMenu(){
    var source = Game.researchTopics[2];

    //Tier0
    for(var i = 0; i < source.length; i++){
        if(Game.researchTopics[3] === 0){
            var tier0 = document.getElementById(source[i][0]);
            if(!tier0.classList.contains('research_active')){
                tier0.classList.add('research_active');
                tier0.innerHTML = Lang[source[i][0]];
                tier0.onclick = clickedResearch;
            }
            //Tier1
            for(var j = 0; j < source[i][2].length; j++){
                if(source[i][3] === 0){
                    var tier1 = document.getElementById(source[i][2][j][0]);
                    if(!tier1.classList.contains('research_active')){
                        tier1.classList.add('research_active');
                        tier1.innerHTML = Lang[source[i][2][j][0]];
                        console.log(source[i][2][j][0]);
                        tier1.onclick = clickedResearch;
                    }
                    //Tier2
                    for(var k = 0; k < source[i][2][j][2].length; k++){
                        if(source[i][2][j][3] === 0){
                            var tier2 = document.getElementById(source[i][2][j][2][k][0]);
                            if(!tier2.classList.contains('research_active')){
                                tier2.classList.add('research_active');
                                tier2.innerHTML = Lang[source[i][2][j][2][k][0]];
                                tier2.onclick = clickedResearch;
                            }
                            //Tier3
                            for(var l = 0; l < source[i][2][j][2][k][2].length; l++){
                                if(source[i][2][j][2][k][3] === 0){
                                    var tier3 = document.getElementById(source[i][2][j][2][k][2][l][0]);
                                    if(!tier3.classList.contains('research_active')){
                                        tier3.innerHTML = Lang[source[i][2][j][2][k][2][l][0]];
                                        tier3.onclick = clickedResearch;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function clickedResearch(){
    var ident = this.id;
    console.log(ident);
    if(document.getElementById(ident + 'Cont')){
        document.getElementById(ident + 'Cont').classList.toggle('research_cont_hidden');
    }
    fillResearchPanel(ident);
    fillResearchMenu();
}

function fillResearchPanel(ident){
    var frag = document.createDocumentFragment();
    var topicList = false;
    if(ident === 'overview'){
        var title = document.createElement('h2');
        title.innerHTML = Lang.overview;
        frag.appendChild(title);
        var activeLabs = document.createElement('h3');
        activeLabs.innerHTML = Lang.active;
        frag.appendChild(activeLabs);
        var noActive = true;
        for(var i = 0; i < Game.researchLabs.length; i++){
            var lab = Game.researchLabs[i];
            if(Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic !== 'noResearch'){
                noActive = false;
                var item = document.createElement('div');
                item.classList.add('research_panel_item');
                var img = document.createElement('img');
                img.src = 'images/researchIllustrations/' + Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic + '.png';
                var ref = document.createElement('p');
                ref.innerHTML = Game.mapTiles[lab[0]][lab[1]][lab[2]].ref;
                var current = document.createElement('p');
                if(Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic === 'noResearch'){
                    current.innerHTML = Lang.currentResearch + ' ' + Lang.none;
                } else {
                    current.innerHTML = Lang.currentResearch + ' ' + Lang[Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic];
                }
                var progressBar = document.createElement('div');
                progressBar.classList.add('research_bar_frame');
                progressBar.classList.add('research_progress_' + researchProgress(Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
                item.appendChild(img);
                item.appendChild(ref);
                item.appendChild(current);
                item.appendChild(progressBar);
                frag.appendChild(item);
            }
        }
        if(noActive){
            noActive = document.createElement('h4');
            noActive.innerHTML = Lang.none;
            frag.appendChild(noActive);
        }
        var available = document.createElement('h3');
        available.innerHTML = Lang.availableLabs;
        frag.appendChild(available);
        var noAvailable = true;
        for(var j = 0; j < Game.researchLabs.length; j++){
            var freeLab = Game.researchLabs[j];
            if(Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
                noAvailable = false;
                var itemFree = document.createElement('div');
                itemFree.classList.add('research_panel_item');
                var imgFree = document.createElement('img');
                imgFree.src = 'images/researchIllustrations/' + Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic + '.png';
                var refFree = document.createElement('p');
                refFree.innerHTML = Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].ref;
                var currentNone = document.createElement('p');
                currentNone.innerHTML = Lang.currentResearch + ' ' + Lang.none;
                itemFree.appendChild(imgFree);
                itemFree.appendChild(refFree);
                itemFree.appendChild(currentNone);
                frag.appendChild(itemFree);
            }
        }
        if(noAvailable){
            noAvailable = document.createElement('h4');
            noAvailable.innerHTML = Lang.none;
            frag.appendChild(noAvailable);
        }
    } else {
        var topicArr = researchTopicRef(ident);
        if(topicArr[3] > 0){
            topicList = true;
            var btn = document.createElement('button');
            btn.id = 'research' + ident;
            btn.classList.add('smoky_glass');
            btn.classList.add('main_pointer');
            btn.innerHTML = Lang.study + ' ' + Lang[ident];
            frag.appendChild(btn);
        }
        var progressBar2 = document.createElement('div');
        progressBar2.classList.add('research_bar_frame');
        progressBar2.classList.add('research_progress_' + researchProgress(ident));
        frag.appendChild(progressBar2);
        var content = document.createElement('span');
        content.innerHTML = Lang[ident + 'Content'];
        frag.appendChild(content);
        //get a reference to the research topic and add a button if it's studyable
    }
    flush(document.getElementById('researchPanel'));
    document.getElementById('researchPanel').appendChild(frag);

    if(topicList){
        document.getElementById('research' + ident).onclick = function(){
            listLabs(ident);
        };
    }
}

function researchTopicRef(topic){
    var source = Game.researchTopics[2];
    for(var i = 0; i < source.length; i++){
        if(source[i][0] === topic){
            return source[i];
        } else {
            for(var j = 0; j < source[i][2].length; j++){
                if(source[i][2][j][0] === topic){
                    return source[i][2][j];
                } else {
                    for(var k = 0; k < source[i][2][j][2].length; k++){
                        if(source[i][2][j][2][k][0] === topic){
                            return source[i][2][j][2][k];
                        } else {
                            for(var l = 0; l < source[i][2][j][2][k][2].length; l++){
                                if(source[i][2][j][2][k][2][l][0] === topic){
                                    return source[i][2][j][2][k][2][l];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function researchProgress(ident){
    var ref = researchTopicRef(ident);
    var progress = ref[4] - ref[3];
    if(progress !== 0){
        progress = progress / ref[4];
    } else {
        return 0;
    }
    progress = progress * 100;
    progress -= progress%10;
    return progress;
}

function listLabs(ident){
    var frag = document.createDocumentFragment();
    var studyList = [];
    var cancelList = [];
    var available = document.createElement('h3');
    available.innerHTML = Lang.availableLabs;
    frag.appendChild(available);
    var noAvailable = true;
    for(var j = 0; j < Game.researchLabs.length; j++){
        var freeLab = Game.researchLabs[j];
        if(Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
            noAvailable = false;
            var itemFree = document.createElement('div');
            itemFree.classList.add('research_panel_item');
            var imgFree = document.createElement('img');
            imgFree.src = 'images/researchIllustrations/' + Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic + '.png';
            var refFree = document.createElement('p');
            refFree.innerHTML = Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].ref;
            var current = document.createElement('p');
            if(Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
                current.innerHTML = Lang.currentResearch + ' ' + Lang.none;
            } else {
                current.innerHTML = Lang.currentResearch + ' ' + Lang[Game.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic];
            }
            var studyBtn = document.createElement('button');
            studyBtn.id = 'studyBtn' + j;
            studyBtn.classList.add('green_glass');
            studyBtn.classList.add('main_pointer');
            studyBtn.innerHTML = Lang.study + ' ' + Lang[ident];
            studyList.push(['studyBtn' + j, freeLab]);
            itemFree.appendChild(studyBtn);
            itemFree.appendChild(imgFree);
            itemFree.appendChild(refFree);
            itemFree.appendChild(current);
            frag.appendChild(itemFree);
        }
    }
    if(noAvailable){
        noAvailable = document.createElement('h4');
        noAvailable.innerHTML = Lang.none;
        frag.appendChild(noAvailable);
    }

    var activeLabs = document.createElement('h3');
    activeLabs.innerHTML = Lang.active;
    frag.appendChild(activeLabs);
    var noActive = true;
    for(var i = 0; i < Game.researchLabs.length; i++){
        var lab = Game.researchLabs[i];
        if(Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic !== 'noResearch'){
            noActive = false;
            var item = document.createElement('div');
            item.classList.add('research_panel_item');
            var img = document.createElement('img');
            img.src = 'images/researchIllustrations/' + Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic + '.png';
            var ref = document.createElement('p');
            ref.innerHTML = Game.mapTiles[lab[0]][lab[1]][lab[2]].ref;
            var current2 = document.createElement('p');
            current2.innerHTML = Lang.currentResearch + ' ' + Lang[Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic];
            var progressBar = document.createElement('div');
            progressBar.classList.add('research_bar_frame');
            progressBar.classList.add('research_progress_' + researchProgress(Game.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
            var cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelBtn' + i;
            cancelBtn.innerHTML = Lang.stopResearch;
            cancelBtn.classList.add('red_glass');
            cancelBtn.classList.add('main_pointer');
            cancelList.push(['cancelBtn' + i, lab]);
            item.appendChild(cancelBtn);
            item.appendChild(img);
            item.appendChild(ref);
            item.appendChild(current2);
            item.appendChild(progressBar);
            frag.appendChild(item);
        }
    }
    if(noActive){
        noActive = document.createElement('h4');
        noActive.innerHTML = Lang.none;
        frag.appendChild(noActive);
    }
    flush(document.getElementById('researchPanel'));
    document.getElementById('researchPanel').appendChild(frag);

    for(var s = 0; s < studyList.length; s++){
        (function(_s){
            var id = studyList[s][0];
            var level = studyList[s][1][0];
            var y = studyList[s][1][1];
            var x = studyList[s][1][2];
            var obj = document.getElementById(id);
            var objFn = function(){
                Game.mapTiles[level][y][x].researchTopic = ident;
                listLabs(ident);
            };
            obj.addEventListener('click', objFn, false);
        })();
    }
    for(var c = 0; c < cancelList.length; c++){
        (function(_c){
            var id = cancelList[c][0];
            var level = cancelList[c][1][0];
            var y = cancelList[c][1][1];
            var x = cancelList[c][1][2];
            var obj = document.getElementById(id);
            var objFn = function(){
                Game.mapTiles[level][y][x].researchTopic = 'noResearch';
                listLabs(ident);
            };
            obj.addEventListener('click', objFn, false);
        })();
    }
}

function flush(elem){
    //afaik, chrome will remove orphaned event listeners
    while (elem.lastChild) {
        elem.removeChild(elem.firstChild);
    }
}

/**
 * Initialize the game
 */

window.onload = function init() {
    Disk.openfs();
    if(!document.webkitHidden){
        Music.play();
    }
    eavesdrop();
};

function eavesdrop() {
    document.addEventListener("webkitvisibilitychange", pageVisHandler, false);
    //Start Screen
    document.getElementById('maxIt').onclick = function(){
        if(document.getElementById('maxIt').classList.contains('full_screen_small')){
            //Dudes - Capital 'S' here but not in the request? WTF?
            document.webkitCancelFullScreen();
            document.getElementById('fullScreen').checked = false;
        } else {
            document.body.webkitRequestFullscreen();
            document.getElementById('fullScreen').checked = true;
        }
        document.getElementById('maxIt').classList.toggle('full_screen_small');
    };
    document.getElementById("closeGame").onclick = function(){
        window.close();
    };

    document.getElementById('fullScreen').onclick = function(){
        if(document.getElementById('maxIt').classList.contains('full_screen_small')){
            //Dudes - Capital 'S' here but not in the request? WTF?
            document.webkitCancelFullScreen();
        } else {
            document.body.webkitRequestFullscreen();
        }
        document.getElementById('maxIt').classList.toggle('full_screen_small');
    };

    document.getElementById('quitGame').onclick = function(){
        document.getElementById('thumb').style.WebkitTransform = 'translate(-220px, 0)';
        document.getElementById('loadMessage').innerHTML = '';
        document.getElementById('seed').value = '';
        document.getElementById('login').disabled = false;
        document.getElementById("popupContainer").classList.remove('popup_container_invisible');
        document.getElementById("popupContainer").classList.remove('popup_container_hidden');
        if(!exec.classList.contains('exec_hidden')){
            menu(exec, execButton, 'exec_hidden');
        }
        for(var i = 0; i < Game.robotsList.length; i++) {
            Game.robotsList[i][3] = false;
        }
        Game = null;
        document.getElementById('statsContainer').classList.add('exec_hidden');
        document.getElementById('researchContainer').classList.add('exec_hidden');
        document.getElementById('messageContainer').classList.add('exec_hidden');
        document.getElementById('guideContainer').classList.add('exec_hidden');
        settings.classList.add('global_container_hidden');
        radarOptCont.classList.add('global_container_hidden');
        document.getElementById('console').classList.remove('console_open');
        flush(document.getElementById('consoleContent'));
        Disk.loadList();
    };
    document.getElementById('login').onclick = function() {
        Game = new Param();
        var Generator = new NewGame();
        checkBuildings();
        reCount('all');
        Generator.getSeed();
    };
    document.getElementById('seed').onfocus = function(){
        document.getElementById('chooseSave').classList.add('drop_down_open');
    };
    document.getElementById('seed').onblur = function(){
        document.getElementById('chooseSave').classList.remove('drop_down_open');
    };
    //!Start Screen
    //Sound
    //TODO: change this to a more standardized box
    document.getElementById('musicOptionViz').onclick = function() {
        Music.toggleMusic();
        if(document.getElementById('popupMusic').checked){
            document.getElementById('popupMusic').checked = false;
        } else {
            document.getElementById('popupMusic').checked = true;
        }
    };
    document.getElementById('popupMusic').onclick = function(){
        Music.toggleMusic();
        if(document.getElementById('musicOptionViz').checked){
            document.getElementById('musicOptionViz').checked = false;
        } else {
            document.getElementById('musicOptionViz').checked = true;
        }
    };
    document.getElementById('popupVolume').onchange = function(){
        Music.changeVolume(document.getElementById('popupVolume').value);
        document.getElementById('settingsVolume').value = document.getElementById('popupVolume').value;
    };
    document.getElementById('settingsVolume').onchange = function(){
        Music.changeVolume(document.getElementById('settingsVolume').value);
        document.getElementById('popupVolume').value = document.getElementById('settingsVolume').value;
    };
    //:Sound
    //Left Menu
    document.getElementById('leftMenuSlider').onmousedown = function() {
        leftMenuResize(true);
    };
    document.getElementById('leftMenuSlider').onmouseup = function() {
        leftMenuResize(false);
    };
    //!Left Menu
    //Canvas Map
    var mainMap = document.getElementById('mPanOverlay');
    mainMap.onmousemove = function(evt) {
        getMousePos(Game.mPanCanvas, evt, true); //tracker
        document.getElementById('console').classList.remove('console_open');
        document.getElementById('consoleInput').blur();
    };
    mainMap.onmouseover = function() {
        Game.highlight = true;
    };
    mainMap.onmouseout = function() {
        Game.mPanLoc.clearRect(0, 0, document.width, document.height + 50);
    };
    mainMap.onclick = function() {
        clicked();
    };
    mainMap.onmousedown = function(){
        Game.mouseDown = true;
        mapDrag();
    };
    mainMap.onmouseup = function(){
        Game.mouseDown = false;
        drawRadar();
    };
    //should consider having zoom on the radar instead of the main map or storing the retX retY for a second or two
    var blocked = false;
    mainMap.onmousewheel = function(event) {
        event.preventDefault();
        var zoomPos = document.getElementById('zoom');
        var zoomMax = document.getElementById('zoom').max;
        var val = parseInt(zoomPos.value, 10);
        var setRet = function() {
                blocked = true;
                setTimeout(function() {
                    blocked = false;
                }, 500);
                Game.retY = Game.retY - Math.round(Game.yLimit / 2) + getTile('y') + 2;
                Game.retX = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
            };
        if(event.wheelDelta > 0 && val < zoomMax) {
            if(!blocked) {
                setRet();
            }
            zoom(val + 1);
            zoomPos.value = val + 1;
        } else if(event.wheelDelta < 0 && val > 1) {
            if(!blocked) {
                setRet();
            }
            zoom(val - 1);
            zoomPos.value = val - 1;
        }
        return false;
    };
    //!Canvas Map
    //Level Slider
    var levelSlider = document.getElementById('slider');
    levelSlider.onchange = function() {
        changeLevel(levelSlider.value);
    };
    //!Level Slider
    window.onresize = function() {
        mapFit(true);
    };
    var radar = document.getElementById('radarContainer');
    var radarBtnContainer = document.getElementById('radarBtnContainer');
    var radarButton = document.getElementById('radarButton');
    radarBtnContainer.onclick = function() {
        menu(radar, radarButton, 'radar_hidden');
    };
    radar.onmouseout = function() {
        if(radar.classList.contains('radar_hidden')) {
            radar.classList.remove('menu_visible');
            radar.classList.add('menu_hidden');
        }
    };
    radar.onmouseover = function() {
        if(radar.classList.contains('radar_hidden')) {
            radar.classList.remove('menu_hidden');
            radar.classList.add('menu_visible');
        }
        Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    };
    var radarMap = document.getElementById('mapOverlay');
    radarMap.onclick = function(evt) {
        getMousePos(Game.radarCanvas, evt);
        Game.highlight = false;
        jump();
    };
    radarMap.onmouseover = function() {
        Game.highlight = false;
    };
    radarMap.onmouseout = function() {
        Game.radarCanvas.onmousemove = null;
        Game.highlight = false;
    };
    window.oncontextmenu = function(ev) {
        ev.preventDefault();
        //ev.stopPropagation();
        if(Game.highlight) {
            rightClicked();
        }
        return false;
    };

    document.getElementById('allRadarOpt').onclick = function(){
        var option = document.getElementById('allRadarOpt').checked;
        document.getElementById("aluminiumRadarOpt").checked = option;
        document.getElementById("calciumRadarOpt").checked = option;
        document.getElementById("copperRadarOpt").checked = option;
        document.getElementById("goldRadarOpt").checked = option;
        document.getElementById("ironRadarOpt").checked = option;
        document.getElementById("leadRadarOpt").checked = option;
        document.getElementById("magnesiumRadarOpt").checked = option;
        document.getElementById("mercuryRadarOpt").checked = option;
        document.getElementById("phosphorousRadarOpt").checked = option;
        document.getElementById("potassiumRadarOpt").checked = option;
        document.getElementById("silverRadarOpt").checked = option;
        document.getElementById("sodiumRadarOpt").checked = option;
        document.getElementById("tinRadarOpt").checked = option;
        document.getElementById("zincRadarOpt").checked = option;
        drawRadar();
    };

    document.getElementById('10Week').onclick = function(){
        execReview();
    };

    document.getElementById("aluminiumRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("calciumRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("copperRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("goldRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("ironRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("leadRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("magnesiumRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("mercuryRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("phosphorousRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("potassiumRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("silverRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("sodiumRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("tinRadarOpt").onclick = function(){
        drawRadar();
    };
    document.getElementById("zincRadarOpt").onclick = function(){
        drawRadar();
    };

    //Executive Drop-Down Menu
    var exec = document.getElementById('execDropDown');
    var execBtnContainer = document.getElementById('execBtnContainer');
    var execButton = document.getElementById('execButton');
    execBtnContainer.onclick = function() {
        menu(exec, execButton, 'exec_hidden');
        document.getElementById('statsContainer').classList.add('exec_hidden');
        document.getElementById('researchContainer').classList.add('exec_hidden');
        document.getElementById('messageContainer').classList.add('exec_hidden');
        document.getElementById('guideContainer').classList.add('exec_hidden');
    };
    var seeStats = document.getElementById('seeStats');
    var seeMessages = document.getElementById('seeMessages');
    var seeResearch = document.getElementById('seeResearch');
    var seeGuide = document.getElementById('seeGuide');

    var statBack = document.getElementById('statBack');
    var messagesBack = document.getElementById('messagesBack');
    var researchBack = document.getElementById('researchBack');
    var guideBack = document.getElementById('guideBack');

    var ovwTab = document.getElementById('overview');
    var populationTab = document.getElementById('populationTab');
    var systemsTab = document.getElementById('systemsTab');
    var resourcesTab = document.getElementById('resourcesTab');

    seeStats.onclick = function(){
        document.getElementById('statsContainer').classList.remove('exec_hidden');
    };
    statBack.onclick = function(){
        document.getElementById('statsContainer').classList.add('exec_hidden');
    };
    seeMessages.onclick = function(){
        document.getElementById('messageContainer').classList.remove('exec_hidden');
    };
    messagesBack.onclick = function(){
        document.getElementById('messageContainer').classList.add('exec_hidden');
    };
    seeResearch.onclick = function(){
        fillResearchMenu();
        document.getElementById('researchContainer').classList.remove('exec_hidden');
    };
    researchBack.onclick = function(){
        document.getElementById('researchContainer').classList.add('exec_hidden');
    };
    seeGuide.onclick = function(){
        document.getElementById('guideContainer').classList.remove('exec_hidden');
    };
    guideBack.onclick = function(){
        document.getElementById('guideContainer').classList.add('exec_hidden');
    };

    ovwTab.onclick = function() {
        populationTab.classList.add('stat_hidden');
        systemsTab.classList.add('stat_hidden');
        resourcesTab.classList.add('stat_hidden');
    };

    populationTab.onclick = function() {
        if(populationTab.classList.contains('stat_hidden')) { //itself and everything to the left
            populationTab.classList.remove('stat_hidden');
        } else if(!systemsTab.classList.contains('stat_hidden')) { //the one on the right and right of that
            systemsTab.classList.add('stat_hidden');
            resourcesTab.classList.add('stat_hidden');
        } else { //just itself
            populationTab.classList.add('stat_hidden');
        }
    };

    systemsTab.onclick = function() {
        if(systemsTab.classList.contains('stat_hidden')) {
            populationTab.classList.remove('stat_hidden');
            systemsTab.classList.remove('stat_hidden');
        } else if(!resourcesTab.classList.contains('stat_hidden')) {
            resourcesTab.classList.add('stat_hidden');
        } else {
            systemsTab.classList.add('stat_hidden');
        }
    };

    resourcesTab.onclick = function() {
        if(resourcesTab.classList.contains('stat_hidden')) {
            populationTab.classList.remove('stat_hidden');
            systemsTab.classList.remove('stat_hidden');
            resourcesTab.classList.remove('stat_hidden');
        } else {
            resourcesTab.classList.add('stat_hidden');
        }
    };

    document.getElementById('globalReport').onclick = function() {
        menu(exec, execButton, 'exec_hidden');
    };


    //!Executive Drop Down
    //
    //Console
    document.getElementById('console').onclick = function() {
        document.getElementById('console').classList.toggle('console_open');
    };
    //!Console
    //Global Menu
    var settings = document.getElementById('settingsContainer');
    var setBtn = document.getElementById('settings');
    var radarOptCont = document.getElementById('radarOptContainer');
    var radarOpt = document.getElementById('radarOpt');
    setBtn.onclick = function() {
        if(settings.classList.contains('global_container_hidden')){
            settings.classList.remove('global_container_hidden');
            radarOptCont.classList.remove('global_container_hidden');
        } else {
            settings.classList.add('global_container_hidden');
        }
    };
    radarOpt.onclick = function() {
        if(settings.classList.contains('global_container_hidden')){
            radarOptCont.classList.toggle('global_container_hidden');
        } else {
            settings.classList.add('global_container_hidden');
        }
    };

    document.getElementById('turn').onclick = function() {
        advanceTurn(1);
    };
    document.getElementById('zoom').onchange = function() {
        var zoomLevel = document.getElementById('zoom').value;
        zoom(zoomLevel);
    };
}

function mapDrag(array){
    var last = array;
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    var current = [x - y%2, y - y%2];
    if(!last){
        last = [];
        last[0] = current[0];
        last[1] = current[1];
    }
    if(last[0] !== current[0] || last[1] !== current[1]){
        Game.retX += last[0] - current[0];
        Game.retY += last[1] - current[1];
    }
    if(Game.mouseDown){
        setTimeout(function(){
            mapDrag(last);
        }, 100);
    } else {
        drawLoc();
    }
}

function advanceTurn(turns){
    while(turns > 0){
        if(!Game.buildings[37][1]) {
            var x;
            var y;
            setStats();
            for(y = 0; y < Game.radarRad * 2; y++) {
                for(x = 0; x < Game.radarRad * 2; x++) {
                    for(var l = 0; l < 5; l++) {
                        nextTurn(x, y, l);
                    }
                }
            }
            if(Game.energy[Game.energy.length - 1] <= 10) {
                printConsole(Lang.noPower);
                Game.blackout = 30;
            }
            saneStats();
            if(turns === 1){
                reCount('all');
                Disk.saveGame(Game.inputSeed);
                execReview();
                fillResearchPanel('overview');
                //setResearchClickers(researchPanel);
                fillResearchMenu();
                drawRadar();
                Game.turnNum.innerHTML = Lang.weekCounter + Game.turn;
                document.getElementById('consoleContent').innerHTML = '';
                printConsole(Lang.itIsNow + ' ' + Lang.week + ' ' + Game.turn);
            }
        } else {
            printConsole(Lang.setDown);
        }
        turns -=1;
    }
}

function menu(containerIn, buttonIn, hideClass) {
    if(buttonIn.classList.contains('arrow_down')) {
        containerIn.classList.add('menu_visible');
        containerIn.classList.remove('menu_hidden');
    } else {
        containerIn.classList.remove('menu_visible');
        containerIn.classList.add('menu_hidden');
    }
    containerIn.classList.toggle(hideClass);
    buttonIn.classList.toggle('arrow_down');
    buttonIn.classList.toggle('arrow_up');
}

function pageVisHandler() {
  if (document.webkitHidden) {
    Music.pause();
  } else {
    Music.play();
  }
}

function Playlist(){
    this.toggleMusic = function(){
        if(!this.musicOn) {
            this.musicOn = true;
            this.play();
        } else {
            this.musicOn = false;
            this.pause();
        }
    };
    this.musicOn = true;
    this.pause = function() {
        currentTrack.pause();
    };
    this.play = function() {
        currentTrack.volume = volume;
        this.musicOn ? currentTrack.play() : currentTrack.pause();
    };
    this.changeVolume = function(val){
        currentTrack.volume = val;
        volume = val;
    };
    var volume = 0.1;
    var track0 = new Audio('sound/Virus-Cured_Clearside.mp3');
    var track1 = new Audio('sound/Gone_Clearside.mp3');
    var track2 = new Audio('sound/Shapeless_Clearside.mp3');
    var track3 = new Audio('sound/Coma_Clearside.mp3');
    var currentTrack = track0;

    //Sounds
    track0.addEventListener('ended', function() {
        this.currentTime = 0;
        track1.volume = volume;
        currentTrack = track1;
        track1.play();
    }, false);
    track1.addEventListener('ended', function() {
        this.currentTime = 0;
        track2.volume = volume;
        currentTrack = track2;
        track2.play();
    }, false);
    track2.addEventListener('ended', function() {
        this.currentTime = 0;
        track3.volume = volume;
        currentTrack = track3;
        track3.play();
    }, false);
    track3.addEventListener('ended', function() {
        this.currentTime = 0;
        track0.volume = volume;
        currentTrack = track0;
        track0.play();
    }, false);
    //!Sounds
}


function zoom(zoomLevel) {
    Game.destinationWidth = zoomLevel * 6 * 6;
    Game.destinationHeight = zoomLevel * 7 * 6;
    mapFit();
}

function getMaxMin(arrayIn){
    var max = 0;
    var min = 1000000;
    var maxTest, minTest;
    for(var i = 0; i < arrayIn.length; i++){
        maxTest = Math.max.apply(null,arrayIn[i]);
        minTest = Math.min.apply(null,arrayIn[i]);
        if(maxTest > max){max = maxTest;}
        if(minTest < min){min = minTest;}
        if(min < 0){min = 0;}
    }
    max = Math.ceil(1 + max/50) * 50;
    min = Math.floor(min/50) * 50;
    return [max, min];
}


function execReview() {
    var darkBlue = '#66D8FF';
    var electricBlue = 'rgb(0,255,255)';
    var green = '#27FAB7';
    var brown = 'rgb(153,125,0)';
    var red = 'rgb(255,0,0)';
    var orange = 'rgb(255,81,0)';
    var white = 'rgb(255,255,255)';
    var grey = 'rgb(115,126,120)';
    var sanity = function(val) {
        var test;
        val >= 0 ? test = val : test = 0;
        return test;
    };

    if(!Game.buildings[37][1]) {
        var moraleInput = [[Game.tossMorale, electricBlue, Lang.tosser],[Game.hipMorale, green, Lang.hipstie],[Game.artMorale, orange, Lang.artie]];
        drawGraph('line', 'morale', moraleInput, true);
        document.getElementById('tossMorale').innerHTML = (Game.tossMorale[Game.tossMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('hipMorale').innerHTML = (Game.hipMorale[Game.hipMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('artMorale').innerHTML = (Game.artMorale[Game.artMorale.length - 1] / 10).toFixed(1) + '%';
        var moraleAverage = ((Game.tossMorale[Game.tossMorale.length - 1] + Game.hipMorale[Game.hipMorale.length - 1] + Game.artMorale[Game.artMorale.length - 1]) / 3);
        document.getElementById('moraleAverage').innerHTML = (moraleAverage / 10).toFixed(1) + '%';

        var popInput = [[Game.tossPop, electricBlue, Lang.tosser],[Game.hipPop, green, Lang.hipstie],[Game.artPop, orange, Lang.artie],[Game.pop, white, Lang.population]];
        drawGraph('line', 'population', popInput, true);
        document.getElementById('tossPop').innerHTML = Math.floor(Game.tossPop[Game.tossPop.length - 1]);
        document.getElementById('hipPop').innerHTML = Math.floor(Game.hipPop[Game.hipPop.length - 1]);
        document.getElementById('artPop').innerHTML = Math.floor(Game.artPop[Game.artPop.length - 1]);
        document.getElementById('popExecTotal').innerHTML = Game.pop[Game.pop.length - 1];

        var demoInput = [
        [[Game.tossAdults[Game.tossAdults.length - 1]], electricBlue, Lang.tosserAdult],
        [[Game.hipAdults[Game.hipAdults.length - 1]], green, Lang.hipstieAdult],
        [[Game.artAdults[Game.artAdults.length - 1]], orange, Lang.artieAdult],
        [[Game.tossStudents[Game.tossStudents.length - 1]], electricBlue, Lang.tosserStudent],
        [[Game.hipStudents[Game.hipStudents.length - 1]], green, Lang.hipstieStudent],
        [[Game.artStudents[Game.artStudents.length - 1]], orange, Lang.artieStudent],
        [[Game.tossBabies[Game.tossBabies.length - 1]], darkBlue, Lang.tosserInfant],
        [[Game.hipBabies[Game.hipBabies.length - 1]], green, Lang.hipstieInfant],
        [[Game.artBabies[Game.artBabies.length - 1]], orange, Lang.artieInfant]
        ];
        drawGraph('bar', 'demographics', demoInput);

        var sdfInput = [[Game.housing, electricBlue, Lang.housing],[Game.sdf, red, Lang.sdf]];
        drawGraph('pie', 'homeless', sdfInput);
        document.getElementById('housingVal').innerHTML = Game.housing[Game.housing.length - 1];
        document.getElementById('homelessVal').innerHTML = Game.sdf[Game.sdf.length - 1];

        var employedInput = [[[Game.employed[Game.employed.length - 1]], electricBlue, Lang.employed],[[Game.pop[Game.pop.length - 1] - Game.employed[Game.employed.length - 1]], red, Lang.unemployed]];
        drawGraph('pie', 'employment', employedInput);
        document.getElementById('employmentVal').innerHTML = Game.pop[Game.pop.length - 1] - Game.employed[Game.employed.length - 1];

        var crimeInput = [[Game.crime, red, Lang.crime]];
        drawGraph('line', 'crime', crimeInput, true);
        document.getElementById('crimeVal').innerHTML = Game.crime[Game.crime.length - 1];

        var energyInput = [[Game.energy, electricBlue, Lang.energy]];
        drawGraph('line', 'energy', energyInput, true);
        document.getElementById('energyVal').innerHTML = Game.energy[Game.energy.length - 1];

        var airInUse = Math.floor((Game.tossPop[Game.tossPop.length - 1] + Game.hipPop[Game.hipPop.length - 1])/10);
        var freeAir = Game.air[Game.air.length - 1] - airInUse;
        if(freeAir < 0){
            freeAir = 0;
        }
        var airInput = [
            [[airInUse], grey, Lang.airInUse],
            [[freeAir], electricBlue, Lang.airAvailable]];
        drawGraph('pie', 'air', airInput);
        document.getElementById('airVal').innerHTML = Game.air[Game.air.length - 1];

        var foodInput = [[Game.food, green, Lang.food]];
        drawGraph('line', 'food', foodInput, true);
        document.getElementById('foodVal').innerHTML = Game.food[Game.food.length - 1];

        var freeStorage = Game.storageCap[Game.storageCap.length - 1] - Game.inStorage[Game.inStorage.length - 1];
        var storageInput = [
            [[freeStorage], electricBlue, Lang.freeStorage],
            [[Game.inStorage[Game.inStorage.length -1] - Game.food[Game.food.length - 1]], brown, Lang.resourceStorage],
            [[Game.food[Game.food.length - 1]], green, Lang.food]];
        drawGraph('pie', 'storage', storageInput);
        document.getElementById('storageVal').innerHTML = freeStorage;

        //The resources Table...
        document.getElementById('aluminiumOreList').innerHTML = sanity(Game.ores[0]) + sanity(Game.ores[1]) + sanity(Game.ores[2]);
        document.getElementById('calciumOreList').innerHTML = sanity(Game.ores[3]);
        document.getElementById('copperOreList').innerHTML = sanity(Game.ores[4]) + sanity(Game.ores[5]) + sanity(Game.ores[6]);
        document.getElementById('goldOreList').innerHTML = sanity(Game.ores[7]) + sanity(Game.ores[8]);
        document.getElementById('ironOreList').innerHTML = sanity(Game.ores[9]) + sanity(Game.ores[10]) + sanity(Game.ores[11]) + sanity(Game.ores[12]);
        document.getElementById('leadOreList').innerHTML = sanity(Game.ores[13]) + sanity(Game.ores[14]);
        document.getElementById('magnesiumOreList').innerHTML = sanity(Game.ores[15]) + sanity(Game.ores[16]);
        document.getElementById('mercuryOreList').innerHTML = sanity(Game.ores[17]) + sanity(Game.ores[18]);
        document.getElementById('phosphorousOreList').innerHTML = sanity(Game.ores[19]) + sanity(Game.ores[20]);
        document.getElementById('potassiumOreList').innerHTML = sanity(Game.ores[21]) + sanity(Game.ores[22]);
        document.getElementById('silverOreList').innerHTML = sanity(Game.ores[23]);
        document.getElementById('sodiumOreList').innerHTML = sanity(Game.ores[24]) + sanity(Game.ores[25]);
        document.getElementById('tinOreList').innerHTML = sanity(Game.ores[26]) + sanity(Game.ores[27]);
        document.getElementById('zincOreList').innerHTML = sanity(Game.ores[28]) + sanity(Game.ores[29]);

        document.getElementById('aluminiumProcList').innerHTML = sanity(Game.procOres[0]);
        document.getElementById('calciumProcList').innerHTML = sanity(Game.procOres[1]);
        document.getElementById('copperProcList').innerHTML = sanity(Game.procOres[2]);
        document.getElementById('goldProcList').innerHTML = sanity(Game.procOres[3]);
        document.getElementById('ironProcList').innerHTML = sanity(Game.procOres[4]);
        document.getElementById('leadProcList').innerHTML = sanity(Game.procOres[5]);
        document.getElementById('magnesiumProcList').innerHTML = sanity(Game.procOres[6]);
        document.getElementById('mercuryProcList').innerHTML = sanity(Game.procOres[7]);
        document.getElementById('phosphorousProcList').innerHTML = sanity(Game.procOres[8]);
        document.getElementById('potassiumProcList').innerHTML = sanity(Game.procOres[9]);
        document.getElementById('silverProcList').innerHTML = sanity(Game.procOres[10]);
        document.getElementById('sodiumProcList').innerHTML = sanity(Game.procOres[11]);
        document.getElementById('tinProcList').innerHTML = sanity(Game.procOres[12]);
        document.getElementById('zincProcList').innerHTML = sanity(Game.procOres[13]);

        //Keep this at the end to draw the legends
        Game.fresh = false;
    }

}

function mapFit(bool) {
    var quarterHeight = Math.floor(Game.destinationHeight * 0.25);
    if(bool) {
        var overlay = document.getElementById('mPanOverlay');
        var mainMap = document.getElementById('mainPanel');

        //Nasty stuff... hence we use the if to touch this as little as possible
        overlay.width = window.innerWidth + Game.destinationWidth;
        overlay.height = window.innerHeight + quarterHeight * 2;
        overlay.style.top = -quarterHeight*2 + 'px';
        overlay.style.left = -Game.destinationWidth / 2 + 'px';
        mainMap.width = window.innerWidth + Game.destinationWidth; //Maybe avoid using screen, as we're not *certain* we'll be fullscreen, even if that's the permission we'll ask for
        mainMap.height = window.innerHeight + quarterHeight * 2;
        mainMap.style.top = -quarterHeight*2 + 'px';
        mainMap.style.left = -Game.destinationWidth / 2 + 'px';
        document.body.style.width = window.innerWidth + 'px';
        document.body.style.height = window.innerHeight + 'px';
    }
    Game.xLimit = Math.ceil(Game.mPanCanvas.width / Game.destinationWidth);
    Game.yLimit = Math.ceil(Game.mPanCanvas.height / (quarterHeight * 3));
    Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    drawTile(0, getTile('x'), getTile('y'), Game.tileHighlight, Game.mPanLoc);

    //Messy stuff to handle if I try to zoom out of the map...
    if(Game.retY - Game.yLimit / 2 < 0) {
        Game.retY = Math.floor(Game.retY - (Game.retY - Game.yLimit / 2));
    } else if(Game.retY + Game.yLimit / 2 > Game.radarRad * 2) {
        Game.retY = Math.floor(Game.retY - Game.yLimit / 2);
    }
    if(Game.retX - Game.xLimit / 2 < 0) {
        Game.retX = Math.floor(Game.retX - (Game.retX - Game.xLimit / 2));
    } else if(Game.retX + Game.xLimit / 2 > Game.radarRad * 2) {
        Game.retX = Math.floor(Game.retX - Game.xLimit / 2);
    }
    if(Game.yLimit % 2 === 0) {
        Game.yLimit += 1;
    }

    Game.yShift = Math.round(Game.yLimit / 2);

    if(Game.yShift % 2 === 0) {
        Game.yShift += 1;
        Game.yLimit += 2;
    }

    if(Game.retY % 2 !== 0) {
        Game.retY += 1;
    }
    drawRadar();
    drawLoc();
}

/**
 * Checks which buildings are available to the player and
 * populates the sidebar with those buildings
 */

function checkBuildings() {
    for(var thing = 0; thing < Game.buildings.length; thing++) {
        var idString = Game.buildings[thing][0];
        var elem = document.getElementById(idString);
        elem.classList.remove('menu_selected');
        if(Game.buildings[thing][1]) {
            elem.classList.add('menu_show');
            elem.classList.remove('menu_hide');
            switch(Game.buildings[thing][2]) {
            case 0:
                if(Game.level === 0) {
                    elem.classList.add('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = null;
                }
                break;
            case 1:
                if(Game.level > 0) {
                    elem.classList.add('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = null;
                }
                break;
            default:
                elem.classList.add('active');
                document.getElementById(Game.buildings[thing][0]).onclick = construct;
            }
        } else {
            elem.classList.remove('menu_show');
            elem.classList.add('menu_hide');
            if(Game.clickedOn === idString) {
                Game.clickedOn = 'none';
                document.body.style.cursor = "url('images/pointers/pointer.png'), default";
            }
        }
    }
    checkRobots();
}

function checkRobots() {
    //TODO: clean all this shit up
    for(var r2d2 in Game.robotsList) {
        var wallE = Game.robotsList[r2d2];
        var idString = wallE[2];
        var c3po = document.getElementById(idString);
        c3po.classList.remove('menu_selected');
        if(wallE[3]) {
            c3po.classList.add('menu_show');
            c3po.classList.remove('menu_hide');
            switch(wallE[4]) {
            case 0:
                if(Game.level === 0) {
                    c3po.classList.add('active');
                    c3po.onclick = construct;
                } else {
                    c3po.classList.remove('active');
                    c3po.onclick = null;
                }
                break;
            case 1:
                if(Game.level > 0) {
                    c3po.classList.add('active');
                    c3po.onclick = construct;
                } else {
                    c3po.classList.remove('active');
                    c3po.onclick = null;
                }
                break;
            default:
                c3po.classList.add('active');
                c3po.onclick = construct;
            }
            if(wallE[1] - wallE[0] === 0) {
                c3po.classList.remove('active');
                c3po.onclick = null;
                //document.getElementById(wallE[2]).classList.add('menu_available');
                if(Game.clickedOn === idString) {
                    Game.clickedOn = 'none';
                    //document.getElementById(wallE[2]).classList.remove('menu_available');
                    document.body.style.cursor = "url('images/pointers/pointer.png'), default";
                }
            }
        } else {
            c3po.classList.remove('menu_show');
            c3po.classList.add('menu_hide');
        }
    }
    //special case for digger
    if(Game.robotsList[1][1] - Game.robotsList[1][0] <= 1) {
        var rob = document.getElementById(Game.robotsList[1][2]);
        rob.classList.remove('active');
        rob.onclick = null;
        //rob.style.background = '#000';
        if(Game.clickedOn === 'digger' || (Game.clickedOn === 'cavernDigger' && Game.robotsList[1][1] - Game.robotsList[1][0] === 0)) {
            Game.clickedOn = 'none';
            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        }
        if(Game.robotsList[1][1] - Game.robotsList[1][0] === 0) {
            var cavDig = document.getElementById('cavernDigger');
            cavDig.classList.remove('active');
            cavDig.onclick = null;
            //cavDig.style.background = '#000';
        }
    }
}

/**
 * Generates a random number, from a base value from 0 to num-1
 * @param  {int} num is the modifier
 * @param  {int} min is the base value
 * @return {int}
 */

function randGen(num, min, seeded) {
    if(seeded){
        return Math.floor(Game.rng.random() * num) + min;
    } else {
        return Math.floor(Math.random() * num) + min;
    }
}

/**
 * Changes level from an input (slider etc.)
 * @param  {int} newLevel the level we would change to
 */

function changeLevel(newLevel) {
    Game.level = parseInt(newLevel, 10);
    checkBuildings();
    drawRadar();
}

/**
 * Recounts the number of bots available and updates the counter bars appropriately
 * @param  {string} which is the type of robot we're dealing with
 */

function reCount(which) {
    var count = function(id, numID, index) {
            document.getElementById(id).style.height = ((Game.robotsList[index][1] - Game.robotsList[index][0]) / Game.robotsList[index][1]) * 100 + '%';
            document.getElementById(numID).innerHTML = Lang.available + (Game.robotsList[index][1] - Game.robotsList[index][0]);
        };
    switch(which) {
    case 'dozer':
        count('dozerCount', 'dozerCountNum', 0);
        break;
    case 'digger':
        count('diggerCount', 'diggerCountNum', 1);
        count('cavernDiggerCount', 'cavernDiggerCountNum', 1);
        break;
    case 'miner':
        count('minerCount', 'minerCountNum', 3);
        break;
    case 'recycler':
        count('recyclerCount', 'recyclerCountNum', 4);
        break;
    case 'all':
        count('dozerCount', 'dozerCountNum', 0);
        count('diggerCount', 'diggerCountNum', 1);
        count('cavernDiggerCount', 'cavernDiggerCountNum', 1);
        count('minerCount', 'minerCountNum', 3);
        count('recyclerCount', 'recyclerCountNum', 4);
        break;
    default:
        console.log("Wait, I've lost count of the drones... " + which);
    }
    checkRobots();
}

/**
 * resizes the left menus on mouse drag
 * @param  {boolean} bool check to see if we should be resizing
 */

function leftMenuResize(bool) {
    if(bool) {
        document.getElementById('leftMenu').onmousemove = resize;
    } else {
        document.getElementById('leftMenu').onmousemove = null;
    }
}

/**
 * manages the actual values for the resize (see leftMenuResize)
 */

function resize(e) {
    var current = e.clientY;
    var total = window.innerHeight;
    //var barThickness = Math.round((total/100)*2);
    var percentage = Math.round((current / total) * 100);
    if(percentage < 10) {
        percentage = 11;
        leftMenuResize(false);
    } else if(percentage > 90) {
        percentage = 89;
        leftMenuResize(false);
    }
    document.getElementById('buildingContainer').style.height = percentage - 2 + '%';
    document.getElementById('droneContainer').style.height = 98 - percentage + '%';
    //document.getElementById('leftMenuSlider').style.marginTop = percentage + '%';
}

/**
 * The main game loop
 */

function mainLoop() {
    var N = 22; //Number of animation frames from 0 e.g. N=1 is the same as having two images which swap...
    Game.augment ? Game.animate += 1 : Game.animate -= 1;
    if(Game.animate === 0 || Game.animate === N) {
        Game.augment ? Game.augment = false : Game.augment = true;
    }
}

function printConsole(text){
    if(!document.getElementById('console').classList.contains('console_open')){
        document.getElementById('console').classList.add('console_notif');
        setTimeout(function(){
            document.getElementById('console').classList.remove('console_notif');
        }, 2500);
    }
    var output = document.getElementById('consoleContent');
    var frag = document.createDocumentFragment();
    var input = document.createElement('span');
    var spacer = document.createElement('br');
    input.innerHTML = text;
    frag.appendChild(input);
    frag.appendChild(spacer);
    output.appendChild(frag);
    output.scrollTop = output.scrollHeight;
}

function consoleErr(text, err, command, fix, lwrLimit, uprLimit){
    if(err === 'value'){
        var errText = text + ' ' + Lang.valueErr + ' "' + command + '"' + ', ' + fix;
        if(lwrLimit){
            errText += ' ' + Lang.between + ' ' + lwrLimit + ' ' + Lang.and + ' ' + uprLimit;
        }
        printConsole(errText);
    } else if(err === 'command') {
        printConsole('"' + text + '"' + ' ' + Lang.commandErr);
    } else {
        printConsole(text + ' ' + Lang.consoleInputErr);
    }
}

function runConsole(text){
    document.getElementById('consoleInput').value = '';
    printConsole(text);
    var input = text.split(" ");

    //switch(text)
    switch(input[0]){
        case Lang.advance: //advance multiple turns
            if(!isNaN(input[1])){
                advanceTurn(input[1]);
            } else {
                consoleErr(input[1], 'value', input[0], Lang.integer);
            }
            break;
        case Lang.hello:
            printConsole(Lang.world);
            break;
        case Lang.level:
            if(input[1] >= 0 || input[1] <= 4){
                Game.level = parseInt(input[1], 10);
                checkBuildings();
                drawRadar();
                document.getElementById('slider').value = Game.level;
            } else {
                consoleErr(input[1], 'value', input[0], Lang.integer, 0, 4);
            }
            break;
        case Lang.home:
            if(Game.home){
                jump(true, Game.home[0], Game.home[1], 0);
            } else {
                printConsole(Lang.setDown);
            }
            break;
        case Lang.seed:
            printConsole(Game.inputSeed);
            break;
        case Lang.zoom:
            if(input[1] >= 1 || input[1] <= 6){
                document.getElementById('zoom').value = input[1];
                zoom(input[1]);
            } else {
                consoleErr(input[1], 'value', input[0], Lang.integer, 1, 6);
            }
            break;
        case Lang.help:
            switch(input[1]){
                case Lang.advance:
                    printConsole(Lang.advanceMan);
                    break;
                case Lang.hello:
                    printConsole(Lang.helloMan);
                    break;
                case Lang.level:
                    printConsole(Lang.levelMan);
                    break;
                case Lang.home:
                    printConsole(Lang.home);
                    break;
                case Lang.seed:
                    printConsole(Lang.seedMan);
                    break;
                default:
                    printConsole(Lang.helpMan);
            }
            break;
        default:
            consoleErr(input[0], 'command');
    }
    document.getElementById('console').classList.add('console_open');
}

/**
 * reacts to keyboard input appropriately
 * @param  {Object} e
 */

function keypressed(e) {
    if(document.activeElement === document.getElementById('consoleInput')){
        switch(e.keyCode){
            case 13: //enter
                runConsole(document.getElementById('consoleInput').value);
                break;
            case 27:
                document.getElementById('consoleInput').blur();
                document.getElementById('consoleInput').value = '';
                document.getElementById('console').classList.remove('console_open');
                break;
            default:
                console.log('in the console' + e.keyCode);
        }
    } else if(Game) {
        switch(e.keyCode) {
        case 8: //prevent backspace from fupping up my day
            if(document.activeElement !== document.getElementById('seed')){
                e.preventDefault();
            }
            break;
        case 38:
            move('up');
            break;
        case 40:
            move('down');
            break;
        case 37:
            move('left');
            break;
        case 39:
            move('right');
            break;
        case 76:
            move('level'); //changes level
            drawRadar();
            break;
        case 48:
            Game.level = 0;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 49:
            Game.level = 1;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 50:
            Game.level = 2;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 51:
            Game.level = 3;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 52:
            Game.level = 4;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Game.level;
            break;
        case 27:
            document.getElementById(Game.clickedOn).classList.add('menu_available');
            Game.clickedOn = 'none';
            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
            break;
        case 77:
            menu(document.getElementById('radarContainer'), document.getElementById('radarButton'), 'radar_hidden');
            break;
        case 69:
            document.getElementById('statsContainer').classList.add('exec_hidden');
            document.getElementById('researchContainer').classList.add('exec_hidden');
            document.getElementById('messageContainer').classList.add('exec_hidden');
            document.getElementById('guideContainer').classList.add('exec_hidden');
            menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            break;
        case 83://s (statistics)
            document.getElementById('researchContainer').classList.add('exec_hidden');
            document.getElementById('messageContainer').classList.add('exec_hidden');
            document.getElementById('guideContainer').classList.add('exec_hidden');
            if (document.getElementById('execDropDown').classList.contains('exec_hidden')) {
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            if(document.getElementById('statsContainer').classList.contains('exec_hidden')){
                document.getElementById('statsContainer').classList.remove('exec_hidden');
            } else {
                document.getElementById('statsContainer').classList.add('exec_hidden');
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            break;
        case 82://r (research)
            fillResearchPanel('overview');
            document.getElementById('statsContainer').classList.add('exec_hidden');
            document.getElementById('messageContainer').classList.add('exec_hidden');
            document.getElementById('guideContainer').classList.add('exec_hidden');
            if (document.getElementById('execDropDown').classList.contains('exec_hidden')) {
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            if(document.getElementById('researchContainer').classList.contains('exec_hidden')){
                document.getElementById('researchContainer').classList.remove('exec_hidden');
            } else {
                document.getElementById('researchContainer').classList.add('exec_hidden');
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            break;
        case 71://g (guide)
            document.getElementById('statsContainer').classList.add('exec_hidden');
            document.getElementById('researchContainer').classList.add('exec_hidden');
            document.getElementById('messageContainer').classList.add('exec_hidden');
            if (document.getElementById('execDropDown').classList.contains('exec_hidden')) {
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            if(document.getElementById('guideContainer').classList.contains('exec_hidden')){
                document.getElementById('guideContainer').classList.remove('exec_hidden');
            } else {
                document.getElementById('guideContainer').classList.add('exec_hidden');
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            break;
        case 67://c (communiqués)
            document.getElementById('statsContainer').classList.add('exec_hidden');
            document.getElementById('researchContainer').classList.add('exec_hidden');
            document.getElementById('guideContainer').classList.add('exec_hidden');
            if (document.getElementById('execDropDown').classList.contains('exec_hidden')) {
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            if(document.getElementById('messageContainer').classList.contains('exec_hidden')){
                document.getElementById('messageContainer').classList.remove('exec_hidden');
            } else {
                document.getElementById('messageContainer').classList.add('exec_hidden');
                menu(document.getElementById('execDropDown'), document.getElementById('execButton'), 'exec_hidden');
            }
            break;
        case 13: //enter (next turn)
            advanceTurn(1);
            break;
        case 84: //t terminal
            document.getElementById('consoleInput').focus();
            setTimeout(function(){
                document.getElementById('consoleInput').value = '';
            }, 10);
            document.getElementById('console').classList.add('console_open');
            break;
        default:
            console.log("Uhm... that key doesn't do anything... " + e.keyCode);
        }
    }
    //I need to find and kill backspace - not appropriate for a chrome packaged game...
}

/**
 * Gets the mouse position on the main canvas
 * @param  {Object} canvas
 * @param  {Event} evt
 */

function getMousePos(canvas, evt, onMap) {
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while(obj && obj.tagName != 'BODY') {
        top += obj.offsetTop - 10;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }

    // return relative mouse position
    Game.mouseX = evt.clientX - left + window.pageXOffset + Game.destinationWidth / 2;
    Game.mouseY = evt.clientY - top + window.pageYOffset;
}

/**
 * Depending on the key pressed, changes the reference reticule
 *and then redraws the maps and radar
 * @param  {string} dir is the direction to move
 */

function move(dir) {
    var upY = Game.retY - 2;
    var downY = Game.retY + 2;
    var leftX = Game.retX - 1;
    var rightX = Game.retX + 1;
    switch(dir) {
    case 'up':
        if(upY >= (Game.yLimit / 2)) {
            Game.retY = upY;
        }
        break;
    case 'down':
        if(downY <= (Game.radarRad * 2) - (Game.yLimit / 2)) {
            Game.retY = downY;
        }
        break;
    case 'left':
        if(leftX >= (Game.xLimit / 2)) {
            Game.retX = leftX;
        }
        break;
    case 'right':
        if(leftX < (Game.radarRad * 2) - (Game.xLimit / 2) - 2) {
            Game.retX = rightX;
        }
        break;
    case 'level':
        Game.level === 4 ? Game.level = 0 : Game.level += 1;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    default:
        break;
    }
    drawLoc();
}

/**
 * Returns the adjacent tile reference in y and x (inverted for historical reasons)
 * @param  {int} x
 * @param  {int} y
 * @param  {int} index Which tile are we checking? 0 for top left then count up
 * clockwise
 * @return {array}
 */

function adjacent(x, y, index) {
    if(y % 2 === 0) {
        index += 6;
    }
    switch(index) {
    case 0:
        return [y + 1, x - 1];
    case 1:
    case 6:
        return [y + 1, x];
    case 2:
    case 8:
        return [y, x + 1];
    case 3:
    case 10:
        return [y - 1, x];
    case 4:
        return [y - 1, x - 1];
    case 5:
    case 11:
        return [y, x - 1];
    case 7:
        return [y + 1, x + 1];
    case 9:
        return [y - 1, x + 1];
    default:
        console.log('There was a problem jim, x:' + x + ' y:' + y + ' index:' + index);
    }
}

/**
 * Checks if any adjacent tiles are wet
 * @param  {array} yxArrayIn is an array of the y & x coordinates of the tile to test
 * @param  {int} level provides the level to test on
 * @return {boolean}
 */

function wetTest(yxArrayIn, level) {
    var yxArray = yxArrayIn.slice(0);
    for(var i = 0; i < 6; i++) {
        if(Game.map[level][adjacent(yxArray[1], yxArray[0], i)[0]][adjacent(yxArray[1], yxArray[0], i)[1]].kind === 4) {
            return true;
        }
    }
    return false;
}

/**
 * returns the distance of the given point from the centrepoint
 * @param  {int} x1
 * @param  {int} y1
 * @param  {int} x2
 * @param  {int} y2
 * @return {float}
 */

function distance(x1, y1, x2, y2) {
    return Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
}
/**
 * Random walk function for "clumpy" randomness
 * @return {int}
 */

function randWalk() {
    var walk = Math.floor(Math.random() * 3);
    switch(walk) {
    case 0:
        return -1;
    case 1:
        return 0;
    case 2:
        return 1;
    default:
        break;
    }
}

/*Get the tile x or y value for the tile the mouse is currently over*/
/**
 * Gets the x or y value for the currently moused over tile
 * @param  {string} axis Which axis are we working with?
 * @return {int}
 */

function getTile(axis) {
    var x, y, yDiff, xDiff, left, right;

    //set the general cases
    y = Math.floor(Game.mouseY / (Game.destinationHeight * 0.75));

    y % 2 !== 0 ? x = Math.floor((Game.mouseX - Game.destinationWidth / 2) / Game.destinationWidth) : x = Math.floor(Game.mouseX / Game.destinationWidth);

    //corner case code
    yDiff = (Game.mouseY / (Game.destinationHeight * 0.75)) - y;
    if(yDiff < 0.33) { //If we're in the top third of the reference rectangle
        //tells which intermediate block we're in...
        if(y % 2 !== 0) {
            xDiff = ((Game.mouseX - Game.destinationWidth / 2) / Game.destinationWidth - x);
            //I now do some basic Pythagoras theorem to figure out which hexagon I'm in
            //Are we on the left or right hand side of the top third?
            if(xDiff < 0.5) {
                left = 0.5 - xDiff; //Adjust to get the opposite length of the 60° internal angle
                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) { //I multiply by 10 so that I'm not dealing with numbers less than 1
                    y -= 1; //change the reference appropriately
                }
            } else { //rinse repeat for all cases
                right = xDiff - 0.5;
                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                    x += 1;
                }
            }

        } else {
            xDiff = (Game.mouseX / Game.destinationWidth - x);
            if(xDiff < 0.5) {
                left = 0.5 - xDiff;
                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                    x -= 1;
                }
            } else {
                right = xDiff - 0.5;
                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                }
            }
        }

    }
    if(axis === 'x') { //return the appropriate tile axis reference
        return x;
    } else {
        return y;
    }
}

/**
 * When the radar is clicked, moves the map to that location
 */

function jump(bool, x, y, level) {
    if(bool){
        Game.retX = x + 1;
        Game.retY = y + 2;
        Game.level = level;
    } else {
        Game.retX = Math.floor(Game.mouseX - Game.destinationWidth / 2);
        Game.retY = Game.mouseY - 20;
    }
    mapFit();
    drawLoc();
}

function inRange(x, y){
    for(var tower = 0; tower < Game.commTowers.length; tower++){
        var radius = 75 - Game.level*10;
        var thisTower = Game.mapTiles[0][Game.commTowers[tower][1]][Game.commTowers[tower][0]].kind;
        if(thisTower === 210 || thisTower === 237){
            radius -= 25;
        }
        if(distance(Game.commTowers[tower][0], Game.commTowers[tower][1], x, y) <= radius){
            return true;
        }
    }
    return false;
}

//MAPS**********************************************************************************
/**
 * Draws the radar properly
 */

function drawRadar() {
    Game.radar.clearRect(0, 0, Game.radarRad * 2, Game.radarRad * 2);
    var radarPixels = Game.radar.createImageData(Game.radarRad * 2, Game.radarRad * 2);
    var options = ["aluminiumRadarOpt","calciumRadarOpt","copperRadarOpt","goldRadarOpt","ironRadarOpt","leadRadarOpt","magnesiumRadarOpt","mercuryRadarOpt","phosphorousRadarOpt","potassiumRadarOpt","silverRadarOpt","sodiumRadarOpt","tinRadarOpt","zincRadarOpt"];
    var surfaceColor = [
        [212, 197, 174, 255],
        [201, 179, 165, 255],
        [211, 206, 203, 255],
        [0, 132, 0, 255],
        [108, 168, 204, 255]
    ]; //rgba of terrain 0,1,2,3,4
    var ugColor = [
        [112, 97, 74, 255],
        [101, 79, 65, 255],
        [111, 106, 103, 255],
        [0, 32, 0, 255],
        [8, 68, 104, 255]
    ]; //rgba of terrain 0,1,2,3,4
    var other = [0, 180, 0, 255];

    for(var x = 0; x < radarPixels.width; x++) {
        for(var y = 0; y < radarPixels.height; y++) {
            // Index of the pixel in the array
            var idx = (x + y * radarPixels.width) * 4;
            var kind = Game.map[Game.level][y][x].kind;
            var resourceOnTile = Game.map[Game.level][y][x].resources;
            //TODO: Clean up this awful for!
            for(var i = 0; i < 4; i++) {
                if(kind < 4 && kind >= 0) {
                    radarPixels.data[idx + i] = surfaceColor[kind][i];
                } else if(kind < 13 && kind >= 9){
                    radarPixels.data[idx + i] = surfaceColor[kind - 9][i];
                }else if(kind > 4 && kind < 8) {
                    radarPixels.data[idx + i] = ugColor[kind - 5][i];
                } else if(kind > 13 && kind < 17) {
                    radarPixels.data[idx + i] = ugColor[kind - 14][i];
                } else if(kind === 4) {
                    Game.level !== 0 ? radarPixels.data[idx + i] = ugColor[4][i] : radarPixels.data[idx + i] = surfaceColor[4][i];
                } else {
                    radarPixels.data[idx + i] = other[i];
                }
                for(var j = 0; j < options.length; j++){
                    if(Game.map[Game.level][y][x].mineable && document.getElementById(options[j]).checked){
                        var ore = resourceRef(j, 0);
                        for(var k = 0; k < ore.length; k++){
                            if(resourceOnTile[ore[k]]){
                                radarPixels.data[idx + i] = other[i];
                            }
                        }
                    }
                }
            }
        }
    }
    Game.radar.putImageData(radarPixels, 0, 0);
    for(var tower = 0; tower < Game.commTowers.length; tower++){
        var radius = 75 - Game.level*10;
        var thisTower = Game.mapTiles[0][Game.commTowers[tower][1]][Game.commTowers[tower][0]].kind;
        if(thisTower === 210 || thisTower === 237){
            radius -= 25;
        }
        Game.radar.beginPath();
        Game.radar.strokeStyle = '#BD222A';
        Game.radar.lineWidth = 0.3;
        Game.radar.arc(Game.commTowers[tower][0], Game.commTowers[tower][1], radius, 0, Math.PI*2, true);
        Game.radar.stroke();
        Game.radar.closePath();
    }
    Game.level === 0 ? Game.radar.fillStyle = "#000000" : Game.radar.fillStyle = "#ffffff";
    Game.radar.font = "14px Arial";
    Game.radar.fillText('Depth: ' + Game.level * 50 + 'm', 215, 298);
}

function resourceRef(ref,dir){
    //dir should tell us if we're going from ore to processed or processed to ore
    //0 is from processed to ore
    //1 is from ore to processed
    //ref is the reference
    switch(ref){
        case 0:
            return [0,1,2];
        case 1:
            return [3];
        case 2:
            return [4,5,6];
        case 3:
            return [7,8];
        case 4:
            return [9,10,11,12];
        case 5:
            return [13,14];
        case 6:
            return [15,16];
        case 7:
            return [17,18];
        case 8:
            return [19,20];
        case 9:
            return [21,22];
        case 10:
            return [23];
        case 11:
            return [24,25];
        case 12:
            return [26,27];
        case 13:
            return [28,29];
        default:
            console.log("Whoah Timmy! You don't wanna stick that in the furnace! " + ref + " " + dir);
    }
}

/**
 * accepts the kind of tile to draw, the x column number and the y column number, then draws it
 * @param  {int} tileType  type of tile to draw
 * @param  {int} tilePosX  Tile's x coordinate
 * @param  {int} tilePosY  Tile's y coordinate
 * @param  {boolean} highlight Whether or not we should highlight the tile
 * @param  {boolean} darkness  Whether or not we should darken this tile
 */

function drawTile(tileType, tilePosX, tilePosY, source, destination, animateIt, modX, modY) {
    var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY; //Canvas vars
    sourceWidth = 216; //original tile width
    sourceHeight = 252; //original tile height
    destinationY = Math.floor(tilePosY * Game.destinationWidth * 0.86); //shift it, the number here is a constant that depends on the hexagon deformation
    if(tilePosY % 2 === 0) { //if the row is even...
        destinationX = Math.floor(tilePosX * Game.destinationWidth - Game.destinationWidth / 2); //we set its X normally
    } else { //if it’s odd though
        destinationX = Math.floor(tilePosX * Game.destinationWidth); //we need a little bit of displacement
    }
    animateIt ? sourceX = Game.animate * sourceWidth : sourceX = 0;
    sourceX += sourceWidth * modX;
    sourceY = (tileType * sourceHeight) + (sourceHeight * modY);
    destination.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, Game.destinationWidth, Game.destinationHeight);
}

/**
 * this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule
 */

function drawZoomMap() {
    var y, x, tileKind;
    mainLoop();
    webkitRequestAnimationFrame(drawZoomMap);
    Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    if(Game.highlight) {
        drawTile(0, getTile('x'), getTile('y'), Game.tileHighlight, Game.mPanLoc, false, 0, 0);
    }
    for(y = 0; y < Game.yLimit; y++) {
        x = 0;
        while(x <= Game.xLimit) {
            if(typeof Game.mapTiles[Game.level][Game.retY - Game.yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x].kind === "number"){
                tileKind = Game.mapTiles[Game.level][Game.retY - Game.yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x].kind;
            } else {
                tileKind = Game.map[Game.level][Game.retY - Game.yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x].kind;
            }

            if(tileKind < 100) {
                drawTile(tileKind, x, y, Game.spritesheet, Game.mPanel, false, 10, 3);
            } else if(tileKind >= 200) {
                drawTile(tileKind - 200, x, y, Game.spritesheet, Game.mPanel, false, 0, 4);
            } else {
                drawTile(tileKind - 100, x, y, Game.spritesheet, Game.mPanel, true, 0, 0);
            }
            x++;
        }
    }
}

/**
 * draws the current location on the small radar map
 */

function drawLoc() {
    Game.radarLoc.clearRect(0, 0, Game.radarRad * 2, Game.radarRad * 2);
    Game.radarLoc.beginPath();
    Game.radarLoc.fillRect(Game.retX - (Game.xLimit / 2), Game.retY - (Game.yLimit / 2), Game.xLimit, Game.yLimit);
    Game.radarLoc.fillStyle = 'rgba(255,251,229,0.3)';
    Game.radarLoc.fill();
    Game.radarLoc.closePath();
    Game.radarLoc.beginPath();
    Game.radarLoc.strokeRect(Game.retX - (Game.xLimit / 2), Game.retY - (Game.yLimit / 2), Game.xLimit, Game.yLimit);
    Game.radarLoc.strokeStyle = '#BD222A';
    Game.radarLoc.stroke();
    Game.radarLoc.closePath();
}

function rightClicked(content) {
    //TODO : Make context menu appear on the correct side relative to mouse position near screen edges
    var popFrame = document.getElementById('contextMenuWrapper');
    var pop = document.getElementById('contextMenu');
    var hide = function(e) {
        if(((e.relatedTarget || e.toElement) === popFrame.nextElementSibling) || ((event.relatedTarget || event.toElement) == popFrame.parentNode)){
            popFrame.style.opacity = '0';
            setTimeout(function(){
                popFrame.style.display = 'none';
                flush(pop);
            }, 200);
            popFrame.removeEventListener('mouseout', hide);
        }
    };
    flush(pop);
    pop.appendChild(contextContent(content));
    popFrame.style.top = event.clientY - 25 + 'px';
    popFrame.style.left = event.clientX - 10 + 'px';
    popFrame.style.display = 'inline-block';
    popFrame.style.opacity = '1';
    popFrame.addEventListener('mouseout', hide, false);

}

function contextContent(content) {
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    console.log(Game.level + ' ' + x + ' ' + y);
    var tile = Game.map[Game.level][y][x];
    var construct = Game.mapTiles[Game.level][y][x];
    var resources = false;
    var frag = document.createDocumentFragment();
    var spacer = document.createElement('br');

    //Reference
    var ref = document.createElement('span');
    if(typeof construct.kind === 'number'){
        ref.innerHTML = construct.ref;
    } else {
        ref.innerHTML = tile.ref;
    }
    frag.appendChild(ref);
    frag.appendChild(spacer);

    //build time left
    if(typeof construct.kind === 'number' && construct.kind === 100) {
        var buildTime = document.createElement('span');
        var buildString = '';
        buildString += Lang.buildTime + (construct.buildTime + 1) + " ";
        //This next part is too language specific methinks
        if(construct.buildTime >= 1) {
            buildString += Lang.weeks;
        }else{
            buildString += Lang.week;
        }
        buildTime.innerHTML = buildString;
        frag.appendChild(buildTime);
        frag.appendChild(spacer);
    }
    if(content) {
        if(!(typeof construct.kind === 'number' && construct.kind >= 100 && construct.kind < 200)){
            frag.appendChild(content);
            //htmlString += content;
        }
    }
    if(construct.exists && construct.shutdown) {
        var power = document.createElement('span');
        var down = document.createElement('span');
        power.innerHTML = Lang.noPower;
        down.innerHTML = Lang.shutdown;
        frag.appendChild(power);
        frag.appendChild(spacer);
        frag.appendChild(down);
        frag.appendChild(spacer);
    }
    //resources?
    var resourceList;
    if(typeof construct.kind === 'number'){
        resourceList = construct.ores;
    } else {
        resourceList = tile.resources;
    }
    var listedResources = document.createElement('ul');
    for(var i = 0; i < resourceList.length; i++) {
        if(resourceList[i] > 0) {
            if(!resources) {
                var resourceTitle = document.createElement('h3');
                resourceTitle.innerHTML = Lang.resources;
                frag.appendChild(resourceTitle);
                resources = true;
            }
            var item = document.createElement('li');
            item.innerHTML = Game.resourceArray[i][0] + ': ' + resourceList[i] + 't';
            var nameIndent = document.createElement('ul');
            var name = document.createElement('li');
            name.innerHTML = Game.resourceArray[i][1];
            nameIndent.appendChild(name);
            item.appendChild(nameIndent);
            listedResources.appendChild(item);
        }
    }
    frag.appendChild(listedResources);
    //!resources
    return frag;
}

String.prototype.insert = function(index, string) {
    if(index > 0) return this.slice(0, index) + string + this.slice(index);
    else return string + this;
};

function changeName(string, orig) {
    return string + ' #' + orig.split('#')[1];
}

function resourceNeededList(building, getRec, recycling){
    var resourcesNeeded;
    var future;
    switch(building) {
            //Buildings
    case 'agri':
        //agridome
        future = Lang.agri;
        resourcesNeeded = [[0,2],[1,1],[4,1],[9, 1]];
        break;
    case 'agri2':
        //advanced agridome
        future = Lang.agri2;
        resourcesNeeded = [[0,1],[1,1],[8,1],[9, 1]];
        break;
    case 'airport':
        //airport
        future = Lang.airport;
        resourcesNeeded = [[2,1],[4,2],[12, 1]];
        break;
    case 'arp':
        //arp
        future = Lang.arp;
        resourcesNeeded = [[0,2],[4,1],[12, 1],[13,1]];
        break;
    case 'airlift':
        //airshaft
        future = Lang.airlift;
        resourcesNeeded = [[0,1]];
        break;
    case 'barracks':
        //barracks
        future = Lang.barracks;
        resourcesNeeded = [[4,2],[12, 1]];
        break;
    case 'civprot':
        //civil protection
        future = Lang.civprot;
        resourcesNeeded = [[4,2],[12, 1]];
        break;
    case 'civprot2':
        //civil protection 2
        future = Lang.civprot2;
        resourcesNeeded = [[2,1],[4,2],[12, 1]];
        break;
    case 'commarray':
        //comm array
        future = Lang.commarray;
        resourcesNeeded = [[0,2],[2,2],[4,1]];
        break;
    case 'commarray2':
        //comm array 2
        future = Lang.commarray2;
        resourcesNeeded = [[0,2],[2,1],[12, 1],[13,1]];
        break;
    case 'command':
        //command
        future = Lang.command;
        resourcesNeeded = [[0,2],[2,1],[4,1],[5, 1],[10,1],[12,1],[13,1]];
        break;
    case 'connector':
        // connector
        future = Lang.connector;
        resourcesNeeded = [[4,1]];
        break;
    case 'dronefab':
        // drone factory
        future = Lang.dronefab;
        resourcesNeeded = [[0,1],[2,1],[4,1],[5, 1],[6,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
        break;
    case 'chernobyl':
        // fission
        future = Lang.chernobyl;
        resourcesNeeded = [[0,1],[2,2],[4,2],[5, 3],[7,1],[11,2],[12,1],[13,1]];
        break;
    case 'tokamak':
        // fusion
        future = Lang.tokamak;
        resourcesNeeded = [[0,2],[2,2],[3,1],[4, 1],[5,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
        break;
    case 'genfab':
        // factory
        future = Lang.genfab;
        resourcesNeeded = [[0,1],[2,1],[4,1],[12, 1]];
        break;
    case 'geotherm':
        // geothermal
        future = Lang.geotherm;
        resourcesNeeded = [[0,1],[2,1],[4,1]];
        break;
    case 'hab':
        // habitat
        future = Lang.hab;
        resourcesNeeded = [[2,1],[4,1],[5, 1],[12,1]];
        break;
    case 'hab2':
        // habitat 2
        future = Lang.hab2;
        resourcesNeeded = [[2,1],[3,1],[4,1],[5,1],[12, 1]];
        break;
    case 'hab3':
        // habitat 3
        future = Lang.hab3;
        resourcesNeeded = [[0,1],[2,1],[3,1],[5,1],[10,1],[12, 1]];
        break;
    case 'er':
        // hospital
        future = Lang.er;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[5,2],[6,1],[10,1],[11,1],[12, 1],[13,1]];
        break;
    case 'mine':
        // mine
        future = Lang.mine;
        resourcesNeeded = [[4,1]];
        break;
    case 'nursery':
        // nursery
        future = Lang.nursery;
        resourcesNeeded = [[0,1],[1,1],[2,1],[4,1],[6,1],[10,1],[11,1],[12, 1],[13,1]];
        break;
    case 'oreproc':
        // ore processor
        future = Lang.oreproc;
        resourcesNeeded = [[2,1],[4,2]];
        break;
    case 'rec':
        // recreation center
        future = Lang.rec;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'recycling':
        // recycler
        future = Lang.recycler;
        resourcesNeeded = [[2,1],[4,1],[8,1],[12, 1]];
        break;
    case 'clichy':
        // red light district
        future = Lang.clichy;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'research':
        // research center
        future = Lang.research;
        resourcesNeeded = [[0,1],[1, 1],[2,2],[3,1],[4,1],[5,1],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
        break;
    case 'research2':
        // research 2
        future = Lang.research2;
        resourcesNeeded = [[0,1],[2,2],[3,2],[4,1],[5,2],[6,1],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2]];
        break;
    case 'solar':
        // solar farm
        future = Lang.solar;
        resourcesNeeded = [[0,1],[2,1],[3,1],[7,1],[8,1],[13, 1]];
        break;
    case 'space':
        // space port
        future = Lang.space;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'stasis':
        // stasis block
        future = Lang.stasis;
        resourcesNeeded = [[0,4],[1, 1],[2,3],[3,2],[4,3],[5,2],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
        break;
    case 'store':
        // Storage Tanks
        future = Lang.store;
        resourcesNeeded = [[4,1]];
        break;
    case 'uni':
        // University
        future = Lang.uni;
        resourcesNeeded = [[0,1],[1,2],[2,1],[4,1],[6,1],[7,1],[9,1],[10,1],[11,1]];
        break;
    case 'warehouse':
        // warehouse
        future = Lang.warehouse;
        resourcesNeeded = [[0,1],[4,1]];
        break;
    case 'windfarm':
        // windfarm
        future = Lang.windfarm;
        resourcesNeeded = [[0,1],[2,1],[4,1],[5,1]];
        break;
    case 'workshop':
        // workshop
        future = Lang.workshop;
        resourcesNeeded = [[0,1],[2,1],[4,2],[5,1],[12, 1]];
        break;
    default:
        console.log("What are you talking about?... :( " + building);
        return false;
    }
    if(recycling){
        return resourcesNeeded;
    } else if(getRec) {
        return(requisition(resourcesNeeded));
    } else {
        var frag = document.createDocumentFragment();
        var spacer = document.createElement('br');
        var need = document.createElement('button');
        need.id = 'confirmBuild';
        need.classList.add('smoky_glass');
        need.classList.add('main_pointer');
        need.classList.add('context_button');
        need.innerHTML = Lang.confirmBuild;
        frag.appendChild(spacer);
        frag.appendChild(need);
        var title = document.createElement('h3');
        title.innerHTML = Lang.resourcesNeeded + ' (' + future + ')';
        frag.appendChild(title);
        var required = document.createElement('ul');
        for(var resource = 0; resource < resourcesNeeded.length; resource++){
            var which = resourcesNeeded[resource][0];
            var amount = resourcesNeeded[resource][1];
            var item = document.createElement('li');
            if(Game.procOres[which] >= amount){
                item.classList.add('green');
            } else {
                item.classList.add('red');
            }
            item.innerHTML = amount + ' ' + Game.resourceNames[which];
            required.appendChild(item);
        }
        frag.appendChild(required);
        console.log(frag);
        return frag;
    }
}

function requisition(arr){//TODO set up recycling here
    var resourceCheck = false;
    var count = 0;
    for(var j = 0; j < arr.length; j++){
        if(Game.procOres[arr[j][0]] >= arr[j][1]){
            count += 1;
        }
    }
    if(count === arr.length){
        resourceCheck = true;
        for(var k = 0; k < arr.length; k++){
            Game.procOres[arr[k][0]] -= arr[k][1];
        }
        execReview();
    } else {
        var shortage = Lang.resourceShortage;
        for(var s = 1; s < arr.length; s++){
            if(Game.procOres[arr[s][0]] < arr[s][1]){
                shortage += Game.resourceNames[arr[s][0]] + ", ";
            }
        }
        printConsole(shortage.substring(0,shortage.length - 2)); //removes the space and comma
    }
    return resourceCheck;

}

function checkConnection(y, x) {
    var connected = false;
    for(var j = 0; j < 6; j++) {
        if(Game.mapTiles[Game.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]] && (Game.mapTiles[Game.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 211 || Game.mapTiles[Game.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 204)) {
            connected = true;
        }
    }
    return connected;
}
/**
 * Performs the appropriate action for the tile that is clicked upon
 */

function clicked(direction) {
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    //var kind;
    console.log('x: ' + x + '  y: ' + y);
    var hex = Game.mapTiles[Game.level][y][x];
    var tile = Game.map[Game.level][y][x];
    var lowerTile, upperTile;
    var confirmBot = function(botText){
        var frag = document.createDocumentFragment();
        var spacer = document.createElement('br');
        var btn = document.createElement('button');
        btn.innerHTML = botText;
        btn.id = 'confirmBuild';
        btn.classList.add('context_button');
        btn.classList.add('smoky_glass');
        btn.classList.add('main_pointer');
        frag.appendChild(spacer);
        frag.appendChild(spacer);//I don't think these are doing anything... ?
        frag.appendChild(btn);
        frag.appendChild(spacer);
        return frag;
    };


    if(Game.level < 5) {
        lowerTile = Game.map[Game.level + 1][y][x];
    }
    if(Game.level > 0) {
        upperTile = Game.map[Game.level - 1][y][x];
    }
    switch(Game.clickedOn) {
    case 'lander':
        if(wetTest([y,x],Game.level)){
            printConsole(Lang.onWater);
        } else {
            Game.mapTiles[Game.level][y][x] = bobTheBuilder(210, x, y, Game.level);
            Game.home = [x,y];
            for(var j = 0; j < 6; j++) {
                var tempY = adjacent(x, y, j)[0];
                var tempX = adjacent(x, y, j)[1];
                switch(j) {
                case 1:
                case 3:
                case 5:
                    Game.mapTiles[0][tempY][tempX] = bobTheBuilder(211, tempX, tempY, Game.level);
                    break;
                case 0:
                    Game.mapTiles[0][tempY][tempX] = bobTheBuilder(235, tempX, tempY, Game.level);
                    break;
                case 2:
                    Game.mapTiles[0][tempY][tempX] = bobTheBuilder(203, tempX, tempY, Game.level);
                    break;
                case 4:
                    Game.mapTiles[0][tempY][tempX] = bobTheBuilder(237, tempX, tempY, Game.level);
                    Game.commTowers.push([tempX, tempY]);
                    break;
                default:
                    console.log("The eagle most definitely has *not* landed");
                }
            }
            Game.buildings[37][1] = false;
            var buildable = [0, 3, 8, 11, 17, 23, 25, 27, 32, 34, 35, 36];
            for(var ref in buildable) {
                Game.buildings[buildable[ref]][1] = true;
            }
            for(var i = 0; i < Game.robotsList.length; i++) {
                Game.robotsList[i][3] = true;
            }
            checkBuildings();
            execReview();
            drawRadar();
        }
        break;
    case 'dozer':
        if(!direction) {
            rightClicked(confirmBot(Lang.confirmDoze));
            document.getElementById('confirmBuild').onclick = function(){
                console.log('how many times?');
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if((hex && (hex.kind < 200 && hex.kind > 2)) || (typeof hex.kind !== 'number' && tile.kind > 2 && tile.kind < 9) || tile.kind > 11) {
                printConsole(Lang.noDoze);
            } else if(!inRange(x, y)){
                printConsole(Lang.outOfRange);
            } else {
                Game.mapTiles[Game.level][y][x] = bobTheBuilder(100, x, y, Game.level);
            }
        }
        break;
    case 'digger':
        if(!direction) {
            rightClicked(confirmBot(Lang.confirmDig));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            //tile.digDown(x, y, lowerTile);
            var DBelow = Game.mapTiles[Game.level + 1];
            if(!checkConnection(y,x)){
                printConsole(Lang.noConnection);
            } else if(wetTest([y, x], Game.level + 1)){
                printConsole(Lang.onWater);
            } else if((hex && hex.kind >= 100) || (DBelow[y][x] && DBelow[y][x].kind >= 100)){
                printConsole(Lang.buildingPresent);
            } else if((hex.kind > 3 && hex.kind < 9) || hex.kind > 11) {
                printConsole(Lang.noDig);
            } else if(Game.level === 4){
                printConsole(Lang.lastLevel);
            } else if(!inRange(x, y)){
                printConsole(Lang.outOfRange);
            } else {
                Game.mapTiles[Game.level][y][x] = bobTheBuilder(101, x, y, Game.level, true);
                DBelow[y][x] = bobTheBuilder(101, x, y, Game.level + 1, true);
                for(var k = 0; k < 6; k++) {
                    var belowAdj = DBelow[adjacent(x, y, k)[0]][adjacent(x, y, k)[1]];
                    if((belowAdj.exists && (belowAdj.kind >= 100 || belowAdj[1].kind < 4)) || Game.map[Game.level + 1][adjacent(x, y, k)[0]][adjacent(x, y, k)[1]].kind === 4 || wetTest([adjacent(x, y, k)[0], adjacent(x, y, k)[1]], Game.level + 1)) {
                        //do nothing
                    } else {
                        Game.mapTiles[Game.level + 1][adjacent(x, y, k)[0]][adjacent(x, y, k)[1]] = bobTheBuilder(101101, adjacent(x, y, k)[1], adjacent(x, y, k)[0], Game.level + 1);
                    }
                }
            }
        }
        break;
    case 'cavernDigger':
        if(!direction) {
            rightClicked(confirmBot(Lang.confirmDigCavern));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(wetTest([y, x], Game.level)){
                printConsole(Lang.onWater);
            } else if((hex && hex.kind > 3) || Game.level === 0 || (hex.kind > 2 && hex.kind < 9) || hex.kind > 11) {
                printConsole(Lang.noCavern);
            } else if(!inRange(x, y)){
                printConsole(Lang.outOfRange);
            } else {
                Game.mapTiles[Game.level][y][x] = bobTheBuilder(101, x, y, Game.level);
                for(var z = 0; z < 6; z++) {
                    var around = Game.mapTiles[Game.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]];
                    if((around && (around.kind >= 100 || around.kind < 4)) || Game.map[Game.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]].kind < 4 || wetTest([adjacent(x, y, z)[0], adjacent(x, y, z)[1]], Game.level + 1)) {
                        //do nothing
                    } else {
                        Game.mapTiles[Game.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]] = bobTheBuilder(101101, adjacent(x, y, z)[1], adjacent(x, y, z)[0], Game.level);
                    }
                }
            }
        }
        break;
    case 'miner':
        if(!direction) {
            rightClicked(confirmBot(Lang.confirmMine));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(wetTest([y, x], Game.level + 1)){
                printConsole(Lang.onWater);
            } else if(hex && hex.kind !== 221 && hex.kind >= 100) {
                printConsole(Lang.noMine);
            } else if(Game.level !== 0 && (!hex || hex && hex.kind !== 221)){
                printConsole(Lang.noMine);
            } else if(Game.level === 4) {
                printConsole(Lang.lastLevel);
            } else if(!inRange(x, y)){
                printConsole(Lang.outOfRange);
            } else {
                Game.mapTiles[Game.level][y][x] = bobTheBuilder(102, x, y, Game.level, true);
                Game.mapTiles[Game.level + 1][y][x] = bobTheBuilder(102102, x, y, Game.level + 1, true);
                for(var m = 0; m < 6; m++) {
                    var mineY = adjacent(x, y, m)[0];
                    var mineX = adjacent(x, y, m)[1];
                    if(Game.map[Game.level][mineY][mineX].mineable) {
                        Game.mapTiles[Game.level][mineY][mineX] = bobTheBuilder(102102, mineX, mineY, Game.level, false);
                    }
                    if(Game.map[Game.level + 1][mineY][mineX].mineable) {
                        Game.mapTiles[Game.level + 1][mineY][mineX] = bobTheBuilder(102102, mineX, mineY, Game.level + 1, false);
                    }
                }
            }
        }
        break;
    case 'recycler':
        if(!direction) {
            rightClicked(confirmBot(Lang.confirmRecycle));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(hex && hex.kind >= 200){
                recycle(hex.kind, x, y, Game.level);
            } else {
                printConsole(Lang.noRecycle);
            }
        }
        //TODO: add recycle code
        break;
    default:
        if(!direction){
            rightClicked(resourceNeededList(Game.clickedOn));
            if(document.getElementById('confirmBuild')){
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };}
        } else {
            if((checkConnection(y, x) || Game.clickedOn === 'commarray' || Game.clickedOn === 'commarray2') && hex && hex.kind === 3) {
                if(resourceNeededList(Game.clickedOn, true)){
                    Game.mapTiles[Game.level][y][x] = bobTheBuilder(getBuildingRef(Game.clickedOn), x, y, Game.level);
                }
            } else {
                !checkConnection(y, x) ? printConsole(Lang.noConnection) : printConsole(Lang.notPrepared);
            }
        }
    }
    drawRadar();
}


/**
 *  When I click on a menu item, this remembers what it is _unless_ I click again, in which case, it forgets
 */
function getBuildingRef(reference){
    switch(reference){
        case 'agri':
            return 200;
        case 'agri2':
            return 201;
        case 'airport':
            return 202;
        case 'arp':
            return 203;
        case 'barracks':
            return 205;
        case 'civprot':
            return 206;
        case 'civprot2':
            return 207;
        case 'command':
            return 210;
        case 'commarray':
            return 208;
        case 'commarray2':
            return 209;
        case 'connector':
            return 211;
        case 'dronefab':
            return 212;
        case 'chernobyl':
            return 213;
        case 'tokamak':
            return 214;
        case 'genfab':
            return 215;
        case 'geotherm':
            return 216;
        case 'hab':
            return 217;
        case 'hab2':
            return 218;
        case 'hab3':
            return 219;
        case 'er':
            return 220;
        case 'nursery':
            return 222;
        case 'oreproc':
            return 223;
        case 'rec':
            return 224;
        case 'recycling':
            return 225;
        case 'clichy':
            return 226;
        case 'research':
            return 227;
        case 'research2':
            return 228;
        case 'solar':
            return 229;
        case 'space':
            return 230;
        case 'stasis':
            return 231;
        case 'store':
            return 232;
        case 'uni':
            return 233;
        case 'warehouse':
            return 234;
        case 'windfarm':
            return 235;
        case 'workshop':
            return 236;
        case 200:
            return 'agri';
        case 201:
            return 'agri2';
        case 202:
            return 'airport';
        case 203:
            return 'arp';
        case 205:
            return 'barracks';
        case 206:
            return 'civprot';
        case 207:
            return 'civprot2';
        case 210:
            return 'command';
        case 208:
            return 'commarray';
        case 209:
            return 'commarray2';
        case 211:
            return 'connector';
        case 212:
            return 'dronefab';
        case 213:
            return 'chernobyl';
        case 214:
            return 'tokamak';
        case 215:
            return 'genfab';
        case 216:
            return 'geotherm';
        case 217:
            return 'hab';
        case 218:
            return 'hab2';
        case 219:
            return 'hab3';
        case 220:
            return 'er';
        case 222:
            return 'nursery';
        case 223:
            return 'oreproc';
        case 224:
            return 'rec';
        case 225:
            return 'recycling';
        case 226:
            return 'clichy';
        case 227:
            return 'research';
        case 228:
            return 'research2';
        case 229:
            return 'solar';
        case 230:
            return 'space';
        case 231:
            return 'stasis';
        case 232:
            return 'store';
        case 233:
            return 'uni';
        case 234:
            return 'warehouse';
        case 235:
            return 'windfarm';
        case 236:
            return 'workshop';
        default :
            console.log('what building again? ' + reference);
    }

}

function construct() {
    var identity = this.id;
    if(Game.clickedOn === identity) {
        document.getElementById(Game.clickedOn).classList.remove('menu_selected');
        Game.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
    } else {
        if(Game.clickedOn !== 'none') {
            document.getElementById(Game.clickedOn).classList.remove('menu_selected');
        }
        document.getElementById(identity).classList.add('menu_selected');
        Game.clickedOn = identity; /**TODO : Update this to be the primary key listener*/
        switch(identity) {
        case 'dozer':
            document.body.style.cursor = "url('images/pointers/dozer.png'), default";
            break;
        case 'miner':
            document.body.style.cursor = "url('images/pointers/miner.png'), default";
            break;
        case 'digger':
            document.body.style.cursor = "url('images/pointers/digger.png'), default";
            break;
        case 'cavernDigger':
            document.body.style.cursor = "url('images/pointers/digger.png'), default";
            break;
        case 'recycler':
            document.body.style.cursor = "url('images/pointers/recycle.png'), default";
            break;
            //TODO: Change this pointer to a lander
        case 'lander':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        default:
            document.body.style.cursor = "url('images/pointers/build.png'), default";
        }
    }
}