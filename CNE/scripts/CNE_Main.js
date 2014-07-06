"use strict"; //this will break everything if there's any errors... that's a good thing
//var saveList = [];
//Nice map: 1363032002367

/**
* Calculates what the state of the given tile should be in the next turn, setting 
* it appropriately depending on if its a mine, building, research center etc.
* @param {int} x X coordinate of the tile to calculate
* @param {int} y Y coordinate of the tile to calculate
* @param {int} level Level the tile is on
*/
function nextTurn(x, y, level) {
    var tile = Conf.mapTiles[level][y][x];

    var checkMine = function(xIn, yIn, levelIn) {
        for(var i = 0; i < 6; i++) {
            if(Conf.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]] && Conf.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]].kind === 221 && !Conf.mapTiles[levelIn][adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]].shutdown) {
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
            if(Conf.energy[Conf.energy.length - 1] > 10 && tile.shutdown) {
                Conf.energy[Conf.energy.length - 1] += tile.energy;
                tile.shutdown = false;
            }
            //Provided everything is good, rock and roll
            if((Conf.energy[Conf.energy.length - 1] <= 10 && tile.vital) || Conf.energy[Conf.energy.length - 1] > 10) {
                Conf.tossBabies[Conf.tossBabies.length - 1] += tile.tossPop;
                Conf.hipBabies[Conf.hipBabies.length - 1] += tile.hipPop;
                Conf.artBabies[Conf.artBabies.length - 1] += tile.artPop;
                Conf.housing[Conf.housing.length - 1] += tile.housing;
                Conf.tossMorale[Conf.tossMorale.length - 1] += tile.tossMorale;
                Conf.hipMorale[Conf.hipMorale.length - 1] += tile.hipMorale;
                Conf.artMorale[Conf.artMorale.length - 1] += tile.artMorale;
                Conf.crime[Conf.crime.length - 1] += tile.crime;
                if(Conf.storageCap[Conf.storageCap.length - 1] - Conf.inStorage[Conf.inStorage.length - 1] >= tile.food) {
                    Conf.food[Conf.food.length - 1] += tile.food;
                    Conf.inStorage[Conf.inStorage.length - 1] += tile.food;
                }
            } else if(Conf.energy[Conf.energy.length - 1] <= 10 && !tile.vital) {
                //Otherwise shutdown for a turn
                Conf.energy[Conf.energy.length - 1] -= tile.energy;
                tile.shutdown = true;
                Conf.blackout = 1;
            }
        }

        //BUILDING
        if(tile.buildTime > 0) {
            tile.buildTime -= 1;
        } else if(tile.buildTime === 0) {
            tile.ores = Conf.map[level][y][x].resources;
            tile.buildTime = -1;
            Conf.mapTiles[level][y][x].ref = changeName(tile.future[1], Conf.map[level][y][x].ref);
            tile.exists = true;
            Conf.storageCap[Conf.storageCap.length - 1] += tile.storage;
            Conf.energy[Conf.energy.length - 1] += tile.energy;
            Conf.employed[Conf.employed.length - 1] += tile.employees;
            if(tile.robot >= 0) {
                Conf.robotsList[tile.robot][0] -= 1;
                tile.robot = -1;
            }
            if((tile.kind === 101 && tile.future[0] === 204) || (tile.kind === 102 && tile.future[0] === 221)) {
                Conf.mapTiles[level][y][x] = bobTheBuilder(tile.future[0], x, y, level, false);
            } else {
                tile.kind = tile.future[0];
                nextTurn(x, y, level);
            }
            if(tile.kind === 203){
                Conf.air[Conf.air.length - 1] += tile.air;
            }else if(tile.kind >= 208 && tile.kind <= 210){
                Conf.commTowers.push([x, y]);
            } else if(tile.kind === 222){
                if(Conf.creche <= 12){
                    Conf.creche += 1;
                }
            } else if(tile.kind === 224){
                Conf.leisure += 1;
            } else if(tile.kind === 225){
                Conf.recyclerList.push([x,y,level]);
            } else if(tile.kind === 227 || tile.kind === 228){
                console.log('x: ' + x + ' y: ' + y + ' level: '+ level +  tile.researchTopic);
                Conf.researchLabs.push([level, y, x]);
            } else if(tile.kind === 233){
                if(Conf.uni <= 24){
                    Conf.uni += 1;
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
                    if(Conf.storageCap[Conf.storageCap.length - 1] - Conf.inStorage[Conf.inStorage.length - 1] >= mined) {
                        tile.ores[ore] -= mined;
                        Conf.inStorage[Conf.inStorage.length - 1] += mined;
                        Conf.ores[ore] ? Conf.ores[ore] += mined : Conf.ores[ore] = mined;
                    }
                }
            }
            if(!stillMining) {
                tile.mining = false;
                Conf.mapTiles[level][y][x].ref = changeName(TRANS.minedOut, Conf.mapTiles[level][y][x].ref);
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
            for(var check = 0; check < Conf.ores.length; check++) {
                if(Conf.ores[check] && Conf.ores[check] > 0) {
                    available.push(check);
                    count += Conf.ores[check];
                }
            }
            //go through it, moving a tonne from ore to processed, this is the processing limit of the processor
            if(count > processingLimit) {
                count = processingLimit;
            }
            while(count > 0) {
                var pick = Tools.randomGenerator(available.length, 0);
                if(Conf.ores[available[pick]] > 0) {
                    Conf.ores[available[pick]] -= 1;
                    switch(available[pick]) {
                        //direct ores to the right index of the processed array
                    case 0:
                    case 1:
                    case 2:
                        Conf.procOres[0] += 1;
                        break;
                    case 3:
                        Conf.procOres[1] += 1;
                        break;
                    case 4:
                    case 5:
                    case 6:
                        Conf.procOres[2] += 1;
                        break;
                    case 7:
                    case 8:
                        Conf.procOres[3] += 1;
                        break;
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        Conf.procOres[4] += 1;
                        break;
                    case 13:
                    case 14:
                        Conf.procOres[5] += 1;
                        break;
                    case 15:
                    case 16:
                        Conf.procOres[6] += 1;
                        break;
                    case 17:
                    case 18:
                        Conf.procOres[7] += 1;
                        break;
                    case 19:
                    case 20:
                        Conf.procOres[8] += 1;
                        break;
                    case 21:
                    case 22:
                        Conf.procOres[9] += 1;
                        break;
                    case 23:
                        Conf.procOres[10] += 1;
                        break;
                    case 24:
                    case 25:
                        Conf.procOres[11] += 1;
                        break;
                    case 26:
                    case 27:
                        Conf.procOres[12] += 1;
                        break;
                    case 28:
                    case 29:
                        Conf.procOres[13] += 1;
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



/**
* Builds everything, including temporary structures like drones, this is also 
* currently where all the parameters for the different buildings are stored
* @param {int} kind Kind of structure to build
* @param {int} x X coordinate on which to build
* @param {int} y Y coordiante on which to build
* @param {int} level Level on which to build
* @param {bool} [builderBot] If this is a temporary, precursor structure or not
*/
function bobTheBuilder(kind, x, y, level, builderBot) {
    console.log(kind);



    /**
    * Calculates the number of turns need to do something based on modifiers
    * @param {int} turns Base number of turns to calculate for
    * @return {int} Returns the modified value
    */
    var eta = function(turns) {
        var lowModifier = 1.5;
        var highModifier = 2.4;
        if(Conf.map[level][y][x].kind === 1 || Conf.map[level][y][x].kind === 6) {
            return Math.floor(turns * lowModifier);
        } else if(Conf.map[level][y][x].kind === 2 || Conf.map[level][y][x].kind === 7) {
            return Math.floor(turns * highModifier);
        } else {
            return turns;
        }
    };

    if(Conf.map[level][y][x].kind !== 4) {
        var o = new Construction();
        o.kind = 100;
        o.position = [level, x, y];
        if(kind >= 200 && kind < 300) {
            o.ref = changeName(TRANS.building + Conf.buildings[kind - 200][3], Conf.map[level][y][x].ref);
        }
        console.log(kind);
        switch(kind) {
            //Bots
        case 100:
            o.vital = true;
            o.buildTime = eta(2);
            o.future = [3, TRANS.prepared];
            o.ref = changeName(TRANS.preparing, Conf.map[level][y][x].ref);
            o.robot = 0;
            Conf.robotsList[0][0] += 1;
            reCount('dozer');
            break;
        case 101:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(2);
            if(builderBot) {
                o.future = [204, TRANS.building];
            }
            o.ref = changeName(TRANS.digging, Conf.map[level][y][x].ref);
            o.robot = 1;
            Conf.robotsList[1][0] += 1;
            reCount('digger');
            break;
        case 101101:
            o.vital = true;
            o.kind = 8;
            o.buildTime = eta(3);
            o.future = [Conf.map[level][y][x].kind - 5, TRANS.cavern];
            o.kind = 8;
            o.ref = changeName(TRANS.diggingCavern, Conf.map[level][y][x].ref);
            reCount('cavernDigger');
            break;

        case 102:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(3);
            if(builderBot) {
                o.future = [221, TRANS.building];
            }
            o.ref = changeName(TRANS.mining, Conf.map[level][y][x].ref);
            o.mining = true;
            o.robot = 3;
            Conf.robotsList[3][0] += 1;
            reCount('miner');
            break;
        case 102102:
            o.vital = true;
            o.buildTime = 2;
            o.kind = Conf.map[level][y][x].kind;
            if(Conf.map[level][y][x].kind > 8 || builderBot) {
                if(builderBot) {
                    o.future = [221, TRANS.building];
                } else {
                    o.future = [o.kind, TRANS.mining];
                }
                o.ref = changeName(TRANS.mining, Conf.map[level][y][x].ref);
                o.mining = true;
            } else if(level > 0) {
                o.future = [Conf.map[level][y][x].kind - 5, TRANS.cavern];
                o.kind = Conf.map[level][y][x].kind - 5;
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
            o.future = [kind, TRANS.agri];
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
            o.future = [kind, TRANS.agri2];
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
            o.future = [kind, TRANS.airport];
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
            o.future = [kind, TRANS.arp];
            o.employees = 2;
            break;
        case 204:
            //airshaft
            o.vital = true;
            o.buildTime = 2;
            o.health = 50;
            o.energy = -5;
            o.storage = 1;
            o.future = [kind, TRANS.airlift];
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
            o.future = [kind, TRANS.barracks];
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
            o.future = [kind, TRANS.civprot];
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
            o.future = [kind, TRANS.civprot2];
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
            o.future = [kind, TRANS.commarray];
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
            o.future = [kind, TRANS.commarray2];
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
            o.future = [kind, TRANS.command];
            o.employees = 3;
            break;
        case 211:
            // connector
            o.vital = true;
            o.buildTime = eta(1);
            o.health = 20;
            o.energy = -1;
            o.storage = 1;
            o.future = [kind, TRANS.connector];
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
            o.future = [kind, TRANS.dronefab];
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
            o.future = [kind, TRANS.chernobyl];
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
            o.future = [kind, TRANS.tokamak];
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
            o.future = [kind, TRANS.genfab];
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
            o.future = [kind, TRANS.geotherm];
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
            o.future = [kind, TRANS.hab];
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
            o.future = [kind, TRANS.hab2];
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
            o.future = [kind, TRANS.hab3];
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
            o.future = [kind, TRANS.er];
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
            o.future = [kind, TRANS.mine];
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
            o.future = [kind, TRANS.nursery];
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
            o.future = [kind, TRANS.oreproc];
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
            o.future = [kind, TRANS.rec];
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
            o.future = [kind, TRANS.recycler];
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
            o.future = [kind, TRANS.clichy];
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
            o.future = [kind, TRANS.research];
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
            o.future = [kind, TRANS.research2];
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
            o.future = [kind, TRANS.solar];
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
            o.future = [kind, TRANS.space];
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
            o.future = [kind, TRANS.stasis];
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
            o.future = [kind, TRANS.store];
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
            o.future = [kind, TRANS.uni];
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
            o.future = [kind, TRANS.warehouse];
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
            o.future = [kind, TRANS.windfarm];
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
            o.future = [kind, TRANS.workshop];
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
            o.future = [kind, TRANS.lander];
            o.ref = changeName(TRANS.lander, Conf.map[level][y][x].ref);
            break;
        default:
            console.log("Bob can't build it... :( " + kind);
            return false;
        }
        return o;
    } else {
        printConsole(TRANS.onWater);
    }
}



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
    * @memberof Terrain 
    * @member {int} UG
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
    * @member {int} ref
    */
}


//GENERAL SETUP AND TOOLS**********************************************************************************************



/**
* Pushes all tracked data to the relevant places for in-game statistics
*/
function setStats() {
    Conf.crime.push(0);
    Conf.inStorage.push(Conf.inStorage[Conf.inStorage.length - 1]);
    Conf.storageCap.push(Conf.storageCap[Conf.storageCap.length - 1]);
    Conf.tossBabies.push(Conf.tossBabies[Conf.tossBabies.length - 1]);
    Conf.tossStudents.push(Conf.tossStudents[Conf.tossStudents.length - 1]);
    Conf.tossAdults.push(Conf.tossAdults[Conf.tossAdults.length - 1]);
    Conf.tossPop.push(Math.floor(Conf.tossBabies[Conf.tossBabies.length - 1] + Conf.tossStudents[Conf.tossStudents.length - 1] + Conf.tossAdults[Conf.tossAdults.length - 1]));
    Conf.hipBabies.push(Conf.hipBabies[Conf.hipBabies.length - 1]);
    Conf.hipStudents.push(Conf.hipStudents[Conf.hipStudents.length - 1]);
    Conf.hipAdults.push(Conf.hipAdults[Conf.hipAdults.length - 1]);
    Conf.hipPop.push(Math.floor(Conf.hipBabies[Conf.hipBabies.length - 1] + Conf.hipStudents[Conf.hipStudents.length - 1] + Conf.hipAdults[Conf.hipAdults.length - 1]));
    Conf.artBabies.push(Conf.artBabies[Conf.artBabies.length - 1]);
    Conf.artStudents.push(Conf.artStudents[Conf.artStudents.length - 1]);
    Conf.artAdults.push(Conf.artAdults[Conf.artAdults.length - 1]);
    Conf.artPop.push(Math.floor(Conf.artBabies[Conf.artBabies.length - 1] + Conf.artStudents[Conf.artStudents.length - 1] + Conf.artAdults[Conf.artAdults.length - 1]));
    var uniMod = 216 - Conf.uni;
    if(Conf.turn > uniMod){
        var tossGrads = 0;
        if(Conf.tossStudents[Conf.tossStudents.length - uniMod] !== Conf.tossStudents[Conf.tossStudents.length - uniMod - 1]){
            tossGrads = Conf.tossStudents[Conf.tossStudents.length - uniMod - 1] - Conf.tossStudents[Conf.tossStudents.length - uniMod];
        }
        var hipGrads = 0;
        if(Conf.hipStudents[Conf.hipStudents.length - uniMod] !== Conf.hipStudents[Conf.hipStudents.length - uniMod - 1]){
            hipGrads = Conf.hipStudents[Conf.hipStudents.length - uniMod - 1] - Conf.hipStudents[Conf.hipStudents.length - uniMod];
        }
        if(tossGrads > 0 || hipGrads > 0){
            Conf.tossAdults[Conf.tossAdults.length - 1] += tossGrads;
            Conf.hipAdults[Conf.hipAdults.length - 1] += hipGrads;
            Conf.tossStudents[Conf.tossStudents.length - 1] -= tossGrads;
            Conf.hipStudents[Conf.hipStudents.length - 1] -= hipGrads;
        }
    }
    var crecheMod = 36 - Conf.creche;
    if(Conf.turn >= crecheMod){
        var tossKids;
        if(Math.floor(Conf.tossBabies[Conf.tossBabies.length - crecheMod]) !== Math.floor(Conf.tossBabies[Conf.tossBabies.length - crecheMod - 1])){
            tossKids = Math.floor(Conf.tossBabies[Conf.tossBabies.length - crecheMod - 1]) - Math.floor(Conf.tossBabies[Conf.tossBabies.length - crecheMod]);
        }
        var hipKids = 0;
        if(Math.floor(Conf.hipBabies[Conf.hipBabies.length - crecheMod]) !== Math.floor(Conf.hipBabies[Conf.hipBabies.length - crecheMod - 1])){
            hipKids = Math.floor(Conf.hipBabies[Conf.hipBabies.length - crecheMod - 1]) - Math.floor(Conf.hipBabies[Conf.hipBabies.length - crecheMod]);
        }
        if(tossKids > 0 || hipKids > 0){
            Conf.tossStudents[Conf.tossStudents.length - 1] += tossKids;
            Conf.hipStudents[Conf.hipStudents.length - 1] += hipKids;
            Conf.tossBabies[Conf.tossBabies.length - 1] -= tossKids;
            Conf.hipBabies[Conf.hipBabies.length - 1] -= hipKids;
        }
    }
    var botBirth = 10 - Conf.botAging;
    if(Conf.turn >= botBirth){
        var artGrads = 0;
        if(Conf.artStudents[Conf.artStudents.length - botBirth] !== Conf.artStudents[Conf.artStudents.length - botBirth - 1]){
            artGrads = Conf.artStudents[Conf.artStudents.length - botBirth - 1] - Conf.artStudents[Conf.artStudents.length - botBirth];
        }
        var artKids = 0;
        if(Math.floor(Conf.artBabies[Conf.artBabies.length - botBirth]) !== Math.floor(Conf.artBabies[Conf.artBabies.length - botBirth - 1])){
            artKids = Math.floor(Conf.artBabies[Conf.artBabies.length - botBirth - 1]) - Math.floor(Conf.artBabies[Conf.artBabies.length - botBirth]);
        }
        if(artGrads > 0 || artKids > 0){
            Conf.artStudents[Conf.artStudents.length - 1] += artKids;
            Conf.artAdults[Conf.artAdults.length - 1] += artGrads;
            Conf.artBabies[Conf.artBabies.length - 1] -= artKids;
            Conf.artStudents[Conf.artStudents.length - 1] -= artGrads;
        }
    }

    Conf.pop.push(Conf.tossPop[Conf.tossPop.length - 1] + Conf.hipPop[Conf.hipPop.length - 1] + Conf.artPop[Conf.artPop.length - 1]);
    Conf.sdf.push(Conf.pop[Conf.pop.length - 1] - Math.floor(Conf.housing[Conf.housing.length - 1]));
    Conf.housing.push(0);
    Conf.employed.push(Conf.employed[Conf.employed.length - 1]);
    var foodConsumption = Math.floor((Conf.tossPop[Conf.tossPop.length - 1] + Conf.hipPop[Conf.hipPop.length - 1]) / 15);
    if(Conf.food[Conf.food.length - 1] >= foodConsumption){
        Conf.food.push(Conf.food[Conf.food.length - 1] - foodConsumption);
        Conf.inStorage[Conf.inStorage.length - 1] -= foodConsumption;
    } else {
        Conf.inStorage[Conf.inStorage.length - 1] -= Conf.food[Conf.food.length - 1];
        Conf.food.push(0);
    }
    Conf.air.push(Conf.air[Conf.air.length - 1]);
    Conf.energy.push(Conf.energy[Conf.energy.length - 1]);
    Conf.turn += 1;
    //Morale
    Conf.tossMorale.push(Conf.tossMorale[Conf.tossMorale.length - 1] - Math.floor(Conf.sdf[Conf.sdf.length - 1] / 3) + Math.floor(Conf.food[Conf.food.length - 1]) - Conf.blackout * 10 + (Conf.leisure * 2));
    Conf.hipMorale.push(Conf.hipMorale[Conf.hipMorale.length - 1] - Math.floor(Conf.sdf[Conf.sdf.length - 1] / 3) + Math.floor(Conf.food[Conf.food.length - 1]) - Conf.blackout * 10 + (Conf.leisure * 2));
    Conf.artMorale.push(Conf.artMorale[Conf.artMorale.length - 1] - Math.floor(Conf.sdf[Conf.sdf.length - 1] / 5) - Conf.blackout * 20 + Conf.leisure);

    //reset modifiers
    Conf.blackout = 0;
}



/**
* Corrects the statistics for illogical stuff (percentages over 100 etc.)
*/
function saneStats(){
    if(Conf.crime[Conf.crime.length - 1] < 0){
        Conf.crime[Conf.crime.length - 1] = 0;
    }
    if(Conf.tossMorale[Conf.tossMorale.length - 1] <= 0){
        Conf.tossMorale[Conf.tossMorale.length - 1] = 1;
    }
    if(Conf.tossMorale[Conf.tossMorale.length - 1] > 1000){
        Conf.tossMorale[Conf.tossMorale.length - 1] = 1000;
    }
    if(Conf.hipMorale[Conf.hipMorale.length - 1] <= 0){
        Conf.hipMorale[Conf.hipMorale.length - 1] = 1;
    }
    if(Conf.hipMorale[Conf.hipMorale.length - 1] > 1000){
        Conf.hipMorale[Conf.hipMorale.length - 1] = 1000;
    }
    if(Conf.artMorale[Conf.artMorale.length - 1] <= 0){
        Conf.artMorale[Conf.artMorale.length - 1] = 1;
    }
    if(Conf.artMorale[Conf.artMorale.length - 1] > 1000){
        Conf.artMorale[Conf.artMorale.length - 1] = 1000;
    }
    if(Conf.food[Conf.food.length - 1] < 0){
        Conf.food[Conf.food.length - 1] = 0;
    }
    var airAvailable = Conf.air[Conf.air.length - 1] - Math.floor((Conf.tossPop[Conf.tossPop.length -1] + Conf.hipPop[Conf.hipPop.length - 1])/10);
    if(airAvailable <= 0){
        Conf.air[Conf.air.length - 1] = 0;
        Conf.noAir += 50;
        printConsole(TRANS.noAir);
    } else {
        Conf.noAir = 0;
    }

    Conf.sdf[Conf.sdf.length - 1] = Conf.pop[Conf.pop.length - 1] - Math.floor(Conf.housing[Conf.housing.length - 1]);

}



/**
* Draws all graphs and charts for the statistics panel
* @param {string} type The type of chart. Valid values are <tt>line</tt>, <tt>pie</tt> & <tt>bar</tt>
* @param {string} outputId The id of the canvas to draw to
* @param {array} sourceData The array of data to plot
* @param {bool} [from0] If true, forces y-axis to start from 0 rather than adapting to the data given
* @todo make this a proper little library, it's too specific right now
*/
function drawGraph(type, outputId, sourceData, from0) {
    var can = document.getElementById(outputId);
    var con = document.getElementById(outputId).getContext('2d');
    var canW = parseInt(can.width, 10);
    var canH = parseInt(can.height, 10);
    con.clearRect(0, 0, canW, canH);
    //Get our max and min values from the input data
    var sourceClean = [];
    for(var m = 0; m < sourceData.length; m++){
        if(document.getElementById("10Week").checked && Conf.turn >= 10){
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

    /**
    * Returns our highest data point so we can scale the axes
    * @param {array} arr Data to be processed
    * @returns {int} Index of the max data point
    */
    var max = function(arr) {
            var mem = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] > arr[mem]) {
                    mem = i;
                }
            }
            return mem;
        };

    /**
    * Returns our lowest data point so we can scale the axes
    * @param {array} arr Data to be processed
    * @returns {int} Index of the min data point
    */
    var min = function(arr) {
            var mem = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] < arr[mem]) {
                    mem = i;
                }
            }
            return mem;
        };



    /**
    * Returns data normalized to the given axis
    * @param {int} val The index of the datapoint to normalize
    * @param {array} arr The dataset to look in
    * @param {int} axis The length of the axis in pixels to normalise to
    * @returns {int} The normalized data
    */
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
            if(document.getElementById("10Week").checked && Conf.turn >= 10){
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
                if(document.getElementById("10Week").checked && Conf.turn >= 10){
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
    if(Conf.fresh){
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



/**
* Populates the research menu
*/
function fillResearchMenu(){
    var source = Conf.researchTopics[2];

    //Tier0
    for(var i = 0; i < source.length; i++){
        if(Conf.researchTopics[3] === 0){
            var tier0 = document.getElementById(source[i][0]);
            if(!tier0.classList.contains('research_active')){
                tier0.classList.add('research_active');
                tier0.innerHTML = TRANS[source[i][0]];
                tier0.onclick = clickedResearch;
            }
            //Tier1
            for(var j = 0; j < source[i][2].length; j++){
                if(source[i][3] === 0){
                    var tier1 = document.getElementById(source[i][2][j][0]);
                    if(!tier1.classList.contains('research_active')){
                        tier1.classList.add('research_active');
                        tier1.innerHTML = TRANS[source[i][2][j][0]];
                        console.log(source[i][2][j][0]);
                        tier1.onclick = clickedResearch;
                    }
                    //Tier2
                    for(var k = 0; k < source[i][2][j][2].length; k++){
                        if(source[i][2][j][3] === 0){
                            var tier2 = document.getElementById(source[i][2][j][2][k][0]);
                            if(!tier2.classList.contains('research_active')){
                                tier2.classList.add('research_active');
                                tier2.innerHTML = TRANS[source[i][2][j][2][k][0]];
                                tier2.onclick = clickedResearch;
                            }
                            //Tier3
                            for(var l = 0; l < source[i][2][j][2][k][2].length; l++){
                                if(source[i][2][j][2][k][3] === 0){
                                    var tier3 = document.getElementById(source[i][2][j][2][k][2][l][0]);
                                    if(!tier3.classList.contains('research_active')){
                                        tier3.innerHTML = TRANS[source[i][2][j][2][k][2][l][0]];
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



/**
* Opens appropriate research panel when a research menu item is clicked
*/
function clickedResearch(){
    var ident = this.id;
    console.log(ident);
    if(document.getElementById(ident + 'Cont')){
        document.getElementById(ident + 'Cont').classList.toggle('research_cont_hidden');
    }
    fillResearchPanel(ident);
    fillResearchMenu();
}



/**
* Populates the research panel with the appropriate information
* @param {string} ident ID of menu item that was clicked
*/
function fillResearchPanel(ident){
    var frag = document.createDocumentFragment();
    var topicList = false;
    if(ident === 'overview'){
        var title = document.createElement('h2');
        title.innerHTML = TRANS.overview;
        frag.appendChild(title);
        var activeLabs = document.createElement('h3');
        activeLabs.innerHTML = TRANS.active;
        frag.appendChild(activeLabs);
        var noActive = true;
        for(var i = 0; i < Conf.researchLabs.length; i++){
            var lab = Conf.researchLabs[i];
            if(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic !== 'noResearch'){
                noActive = false;
                var item = document.createElement('div');
                item.classList.add('research_panel_item');
                var img = document.createElement('img');
                img.src = 'images/researchIllustrations/' + Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic + '.png';
                var ref = document.createElement('p');
                ref.innerHTML = Conf.mapTiles[lab[0]][lab[1]][lab[2]].ref;
                var current = document.createElement('p');
                if(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic === 'noResearch'){
                    current.innerHTML = TRANS.currentResearch + ' ' + TRANS.none;
                } else {
                    current.innerHTML = TRANS.currentResearch + ' ' + TRANS[Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic];
                }
                var progressBar = document.createElement('div');
                progressBar.classList.add('research_bar_frame');
                progressBar.classList.add('research_progress_' + researchProgress(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
                item.appendChild(img);
                item.appendChild(ref);
                item.appendChild(current);
                item.appendChild(progressBar);
                frag.appendChild(item);
            }
        }
        if(noActive){
            noActive = document.createElement('h4');
            noActive.innerHTML = TRANS.none;
            frag.appendChild(noActive);
        }
        var available = document.createElement('h3');
        available.innerHTML = TRANS.availableLabs;
        frag.appendChild(available);
        var noAvailable = true;
        for(var j = 0; j < Conf.researchLabs.length; j++){
            var freeLab = Conf.researchLabs[j];
            if(Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
                noAvailable = false;
                var itemFree = document.createElement('div');
                itemFree.classList.add('research_panel_item');
                var imgFree = document.createElement('img');
                imgFree.src = 'images/researchIllustrations/' + Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic + '.png';
                var refFree = document.createElement('p');
                refFree.innerHTML = Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].ref;
                var currentNone = document.createElement('p');
                currentNone.innerHTML = TRANS.currentResearch + ' ' + TRANS.none;
                itemFree.appendChild(imgFree);
                itemFree.appendChild(refFree);
                itemFree.appendChild(currentNone);
                frag.appendChild(itemFree);
            }
        }
        if(noAvailable){
            noAvailable = document.createElement('h4');
            noAvailable.innerHTML = TRANS.none;
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
            btn.innerHTML = TRANS.study + ' ' + TRANS[ident];
            frag.appendChild(btn);
        }
        var progressBar2 = document.createElement('div');
        progressBar2.classList.add('research_bar_frame');
        progressBar2.classList.add('research_progress_' + researchProgress(ident));
        frag.appendChild(progressBar2);
        var content = document.createElement('span');
        content.innerHTML = TRANS[ident + 'Content'];
        frag.appendChild(content);
        //get a reference to the research topic and add a button if it's studyable
    }
    Tools.flush(document.getElementById('researchPanel'));
    document.getElementById('researchPanel').appendChild(frag);

    if(topicList){
        document.getElementById('research' + ident).onclick = function(){
            listLabs(ident);
        };
    }
}



/**
* Based on an input string, finds the corresponding {@link Conf.researchTopics} sub-array
* @param {string} topic The topic for which a reference is needed
* @returns {array} The {@link Conf.researchTopics} sub-array that corresponds to <tt>topic</tt>
*/
function researchTopicRef(topic){
    var source = Conf.researchTopics[2];
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



/**
* Returns the research progress as a percenteage
* @param {string} ident The topic for which the research progress is needed
* @returns {int} Research progress as a percentage
*/
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



/**
* Populates a list of labs that are actively researching hte given topic, and/or are available to research it
* @param {string} ident The topic for which the player needs the lab list
*/
function listLabs(ident){
    var frag = document.createDocumentFragment();
    var studyList = [];
    var cancelList = [];
    var available = document.createElement('h3');
    available.innerHTML = TRANS.availableLabs;
    frag.appendChild(available);
    var noAvailable = true;
    for(var j = 0; j < Conf.researchLabs.length; j++){
        var freeLab = Conf.researchLabs[j];
        if(Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
            noAvailable = false;
            var itemFree = document.createElement('div');
            itemFree.classList.add('research_panel_item');
            var imgFree = document.createElement('img');
            imgFree.src = 'images/researchIllustrations/' + Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic + '.png';
            var refFree = document.createElement('p');
            refFree.innerHTML = Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].ref;
            var current = document.createElement('p');
            if(Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic === 'noResearch'){
                current.innerHTML = TRANS.currentResearch + ' ' + TRANS.none;
            } else {
                current.innerHTML = TRANS.currentResearch + ' ' + TRANS[Conf.mapTiles[freeLab[0]][freeLab[1]][freeLab[2]].researchTopic];
            }
            var studyBtn = document.createElement('button');
            studyBtn.id = 'studyBtn' + j;
            studyBtn.classList.add('green_glass');
            studyBtn.classList.add('main_pointer');
            studyBtn.innerHTML = TRANS.study + ' ' + TRANS[ident];
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
        noAvailable.innerHTML = TRANS.none;
        frag.appendChild(noAvailable);
    }

    var activeLabs = document.createElement('h3');
    activeLabs.innerHTML = TRANS.active;
    frag.appendChild(activeLabs);
    var noActive = true;
    for(var i = 0; i < Conf.researchLabs.length; i++){
        var lab = Conf.researchLabs[i];
        if(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic !== 'noResearch'){
            noActive = false;
            var item = document.createElement('div');
            item.classList.add('research_panel_item');
            var img = document.createElement('img');
            img.src = 'images/researchIllustrations/' + Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic + '.png';
            var ref = document.createElement('p');
            ref.innerHTML = Conf.mapTiles[lab[0]][lab[1]][lab[2]].ref;
            var current2 = document.createElement('p');
            current2.innerHTML = TRANS.currentResearch + ' ' + TRANS[Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic];
            var progressBar = document.createElement('div');
            progressBar.classList.add('research_bar_frame');
            progressBar.classList.add('research_progress_' + researchProgress(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
            var cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelBtn' + i;
            cancelBtn.innerHTML = TRANS.stopResearch;
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
        noActive.innerHTML = TRANS.none;
        frag.appendChild(noActive);
    }
    Tools.flush(document.getElementById('researchPanel'));
    document.getElementById('researchPanel').appendChild(frag);

    for(var s = 0; s < studyList.length; s++){
        (function(_s){
            var id = studyList[s][0];
            var level = studyList[s][1][0];
            var y = studyList[s][1][1];
            var x = studyList[s][1][2];
            var obj = document.getElementById(id);
            var objFn = function(){
                Conf.mapTiles[level][y][x].researchTopic = ident;
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
                Conf.mapTiles[level][y][x].researchTopic = 'noResearch';
                listLabs(ident);
            };
            obj.addEventListener('click', objFn, false);
        })();
    }
}



/**
 * Initialize the game
 */
window.onload = function init() {
    FileIO.openfs();
    if(!document.webkitHidden){
        Music.play();
    }
    eavesdrop();
};



/**
* Wrapper function for all the main click listeners
*/
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
        for(var i = 0; i < Conf.robotsList.length; i++) {
            Conf.robotsList[i][3] = false;
        }
        Conf.reset();
        document.getElementById('statsContainer').classList.add('exec_hidden');
        document.getElementById('researchContainer').classList.add('exec_hidden');
        document.getElementById('messageContainer').classList.add('exec_hidden');
        document.getElementById('guideContainer').classList.add('exec_hidden');
        settings.classList.add('global_container_hidden');
        radarOptCont.classList.add('global_container_hidden');
        document.getElementById('console').classList.remove('console_open');
        Tools.flush(document.getElementById('consoleContent'));
        FileIO.loadList();
    };
    document.getElementById('login').onclick = function() {
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
        Music.setVolume(document.getElementById('popupVolume').value);
        document.getElementById('settingsVolume').value = document.getElementById('popupVolume').value;
    };
    document.getElementById('settingsVolume').onchange = function(){
        Music.setVolume(document.getElementById('settingsVolume').value);
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
        getMousePos(Conf.mPanCanvas, evt, true); //tracker
        document.getElementById('console').classList.remove('console_open');
        document.getElementById('consoleInput').blur();
    };
    mainMap.onmouseover = function() {
        Conf.highlight = true;
    };
    mainMap.onmouseout = function() {
        Conf.mPanLoc.clearRect(0, 0, document.width, document.height + 50);
    };
    mainMap.onclick = function() {
        clicked();
    };
    //should consider having zoom on the radar instead of the main map or storing the retX retY for a second or two
    var blocked = false;
    /**
    * Catches mousewheel event, and zooms map appropriately
    * @param {event} event Caught mousewheel event
    */
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
                Conf.retY = Conf.retY - Math.round(Conf.yLimit / 2) + getTile('y') + 2;
                Conf.retX = Conf.retX - Math.round(Conf.xLimit / 2) + getTile('x');
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
        Conf.mPanLoc.clearRect(0, 0, Conf.mPanCanvas.width, Conf.mPanCanvas.height);
    };
    var radarMap = document.getElementById('mapOverlay');
    radarMap.onclick = function(evt) {
        getMousePos(Conf.radarCanvas, evt);
        Conf.highlight = false;
        jump();
    };
    radarMap.onmouseover = function() {
        Conf.highlight = false;
    };
    radarMap.onmouseout = function() {
        Conf.radarCanvas.onmousemove = null;
    };
    window.oncontextmenu = function(ev) {
        ev.preventDefault();
        //ev.stopPropagation();
        if(Conf.highlight) {
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



/**
* Advances the game by a given number of turns
* @param {int} turns Number of turns to advance by
*/
function advanceTurn(turns){
    while(turns > 0){
        if(!Conf.buildings[37][1]) {
            var x;
            var y;
            setStats();
            for(y = 0; y < Conf.radarRad * 2; y++) {
                for(x = 0; x < Conf.radarRad * 2; x++) {
                    for(var l = 0; l < 5; l++) {
                        nextTurn(x, y, l);
                    }
                }
            }
            if(Conf.energy[Conf.energy.length - 1] <= 10) {
                printConsole(TRANS.noPower);
                Conf.blackout = 30;
            }
            saneStats();
            if(turns === 1){
                reCount('all');
                FileIO.saveGame(Game);
                execReview();
                fillResearchPanel('overview');
                //setResearchClickers(researchPanel);
                fillResearchMenu();
                drawRadar();
                Conf.turnNum.innerHTML = TRANS.weekCounter + Conf.turn;
                document.getElementById('consoleContent').innerHTML = '';
                printConsole(TRANS.itIsNow + ' ' + TRANS.week + ' ' + Conf.turn);
            }
        } else {
            printConsole(TRANS.setDown);
        }
        turns -=1;
    }
}



/**
* Manages the openign and closing of menus
* @param {HTMLElement} containerIn Container containing the menu to show or hide
* @param {HTMLElement} buttonIn Button for the container
* @param {string} hideClass Class that determines visibility of the container
*/
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



/**
* Handles what needs to be done if the page is visible or not (pause music etc.)
*/
function pageVisHandler() {
  if (document.webkitHidden) {
    Music.pause();
  } else {
    Music.play();
  }
}



/**
* Sets the map's zoom to provided zoom level
* @param {int} zoomLevel The level of zoom that's needed
*/
function zoom(zoomLevel) {
    Conf.destinationWidth = zoomLevel * 6 * 6;
    Conf.destinationHeight = zoomLevel * 7 * 6;
    mapFit();
}



/**
* For a provided array, will return an array fo the max and min values
* @param {array} arrayIn Array to find the max/min values of
* @returns {array} The max/min values <tt>[max,min]</tt> 
*/
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



/**
* Opens the Executive Review panel, coloring in all of the statistics when we need them
*/
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

    if(!Conf.buildings[37][1]) {
        var moraleInput = [[Conf.tossMorale, electricBlue, TRANS.tosser],[Conf.hipMorale, green, TRANS.hipstie],[Conf.artMorale, orange, TRANS.artie]];
        drawGraph('line', 'morale', moraleInput, true);
        document.getElementById('tossMorale').innerHTML = (Conf.tossMorale[Conf.tossMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('hipMorale').innerHTML = (Conf.hipMorale[Conf.hipMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('artMorale').innerHTML = (Conf.artMorale[Conf.artMorale.length - 1] / 10).toFixed(1) + '%';
        var moraleAverage = ((Conf.tossMorale[Conf.tossMorale.length - 1] + Conf.hipMorale[Conf.hipMorale.length - 1] + Conf.artMorale[Conf.artMorale.length - 1]) / 3);
        document.getElementById('moraleAverage').innerHTML = (moraleAverage / 10).toFixed(1) + '%';

        var popInput = [[Conf.tossPop, electricBlue, TRANS.tosser],[Conf.hipPop, green, TRANS.hipstie],[Conf.artPop, orange, TRANS.artie],[Conf.pop, white, TRANS.population]];
        drawGraph('line', 'population', popInput, true);
        document.getElementById('tossPop').innerHTML = Math.floor(Conf.tossPop[Conf.tossPop.length - 1]);
        document.getElementById('hipPop').innerHTML = Math.floor(Conf.hipPop[Conf.hipPop.length - 1]);
        document.getElementById('artPop').innerHTML = Math.floor(Conf.artPop[Conf.artPop.length - 1]);
        document.getElementById('popExecTotal').innerHTML = Conf.pop[Conf.pop.length - 1];

        var demoInput = [
        [[Conf.tossAdults[Conf.tossAdults.length - 1]], electricBlue, TRANS.tosserAdult],
        [[Conf.hipAdults[Conf.hipAdults.length - 1]], green, TRANS.hipstieAdult],
        [[Conf.artAdults[Conf.artAdults.length - 1]], orange, TRANS.artieAdult],
        [[Conf.tossStudents[Conf.tossStudents.length - 1]], electricBlue, TRANS.tosserStudent],
        [[Conf.hipStudents[Conf.hipStudents.length - 1]], green, TRANS.hipstieStudent],
        [[Conf.artStudents[Conf.artStudents.length - 1]], orange, TRANS.artieStudent],
        [[Conf.tossBabies[Conf.tossBabies.length - 1]], darkBlue, TRANS.tosserInfant],
        [[Conf.hipBabies[Conf.hipBabies.length - 1]], green, TRANS.hipstieInfant],
        [[Conf.artBabies[Conf.artBabies.length - 1]], orange, TRANS.artieInfant]
        ];
        drawGraph('bar', 'demographics', demoInput);

        var sdfInput = [[Conf.housing, electricBlue, TRANS.housing],[Conf.sdf, red, TRANS.sdf]];
        drawGraph('pie', 'homeless', sdfInput);
        document.getElementById('housingVal').innerHTML = Conf.housing[Conf.housing.length - 1];
        document.getElementById('homelessVal').innerHTML = Conf.sdf[Conf.sdf.length - 1];

        var employedInput = [[[Conf.employed[Conf.employed.length - 1]], electricBlue, TRANS.employed],[[Conf.pop[Conf.pop.length - 1] - Conf.employed[Conf.employed.length - 1]], red, TRANS.unemployed]];
        drawGraph('pie', 'employment', employedInput);
        document.getElementById('employmentVal').innerHTML = Conf.pop[Conf.pop.length - 1] - Conf.employed[Conf.employed.length - 1];

        var crimeInput = [[Conf.crime, red, TRANS.crime]];
        drawGraph('line', 'crime', crimeInput, true);
        document.getElementById('crimeVal').innerHTML = Conf.crime[Conf.crime.length - 1];

        var energyInput = [[Conf.energy, electricBlue, TRANS.energy]];
        drawGraph('line', 'energy', energyInput, true);
        document.getElementById('energyVal').innerHTML = Conf.energy[Conf.energy.length - 1];

        var airInUse = Math.floor((Conf.tossPop[Conf.tossPop.length - 1] + Conf.hipPop[Conf.hipPop.length - 1])/10);
        var freeAir = Conf.air[Conf.air.length - 1] - airInUse;
        if(freeAir < 0){
            freeAir = 0;
        }
        var airInput = [
            [[airInUse], grey, TRANS.airInUse],
            [[freeAir], electricBlue, TRANS.airAvailable]];
        drawGraph('pie', 'air', airInput);
        document.getElementById('airVal').innerHTML = Conf.air[Conf.air.length - 1];

        var foodInput = [[Conf.food, green, TRANS.food]];
        drawGraph('line', 'food', foodInput, true);
        document.getElementById('foodVal').innerHTML = Conf.food[Conf.food.length - 1];

        var freeStorage = Conf.storageCap[Conf.storageCap.length - 1] - Conf.inStorage[Conf.inStorage.length - 1];
        var storageInput = [
            [[freeStorage], electricBlue, TRANS.freeStorage],
            [[Conf.inStorage[Conf.inStorage.length -1] - Conf.food[Conf.food.length - 1]], brown, TRANS.resourceStorage],
            [[Conf.food[Conf.food.length - 1]], green, TRANS.food]];
        drawGraph('pie', 'storage', storageInput);
        document.getElementById('storageVal').innerHTML = freeStorage;

        //The resources Table...
        document.getElementById('aluminiumOreList').innerHTML = sanity(Conf.ores[0]) + sanity(Conf.ores[1]) + sanity(Conf.ores[2]);
        document.getElementById('calciumOreList').innerHTML = sanity(Conf.ores[3]);
        document.getElementById('copperOreList').innerHTML = sanity(Conf.ores[4]) + sanity(Conf.ores[5]) + sanity(Conf.ores[6]);
        document.getElementById('goldOreList').innerHTML = sanity(Conf.ores[7]) + sanity(Conf.ores[8]);
        document.getElementById('ironOreList').innerHTML = sanity(Conf.ores[9]) + sanity(Conf.ores[10]) + sanity(Conf.ores[11]) + sanity(Conf.ores[12]);
        document.getElementById('leadOreList').innerHTML = sanity(Conf.ores[13]) + sanity(Conf.ores[14]);
        document.getElementById('magnesiumOreList').innerHTML = sanity(Conf.ores[15]) + sanity(Conf.ores[16]);
        document.getElementById('mercuryOreList').innerHTML = sanity(Conf.ores[17]) + sanity(Conf.ores[18]);
        document.getElementById('phosphorousOreList').innerHTML = sanity(Conf.ores[19]) + sanity(Conf.ores[20]);
        document.getElementById('potassiumOreList').innerHTML = sanity(Conf.ores[21]) + sanity(Conf.ores[22]);
        document.getElementById('silverOreList').innerHTML = sanity(Conf.ores[23]);
        document.getElementById('sodiumOreList').innerHTML = sanity(Conf.ores[24]) + sanity(Conf.ores[25]);
        document.getElementById('tinOreList').innerHTML = sanity(Conf.ores[26]) + sanity(Conf.ores[27]);
        document.getElementById('zincOreList').innerHTML = sanity(Conf.ores[28]) + sanity(Conf.ores[29]);

        document.getElementById('aluminiumProcList').innerHTML = sanity(Conf.procOres[0]);
        document.getElementById('calciumProcList').innerHTML = sanity(Conf.procOres[1]);
        document.getElementById('copperProcList').innerHTML = sanity(Conf.procOres[2]);
        document.getElementById('goldProcList').innerHTML = sanity(Conf.procOres[3]);
        document.getElementById('ironProcList').innerHTML = sanity(Conf.procOres[4]);
        document.getElementById('leadProcList').innerHTML = sanity(Conf.procOres[5]);
        document.getElementById('magnesiumProcList').innerHTML = sanity(Conf.procOres[6]);
        document.getElementById('mercuryProcList').innerHTML = sanity(Conf.procOres[7]);
        document.getElementById('phosphorousProcList').innerHTML = sanity(Conf.procOres[8]);
        document.getElementById('potassiumProcList').innerHTML = sanity(Conf.procOres[9]);
        document.getElementById('silverProcList').innerHTML = sanity(Conf.procOres[10]);
        document.getElementById('sodiumProcList').innerHTML = sanity(Conf.procOres[11]);
        document.getElementById('tinProcList').innerHTML = sanity(Conf.procOres[12]);
        document.getElementById('zincProcList').innerHTML = sanity(Conf.procOres[13]);

        //Keep this at the end to draw the legends
        Conf.fresh = false;
    }

}



/**
* Fits the map to the screen
* @param {bool} [bool] Tells mapFit() if the window has been resized or not
*/
function mapFit(bool) {
    var quarterHeight = Math.floor(Conf.destinationHeight * 0.25);
    if(bool) {
        var overlay = document.getElementById('mPanOverlay');
        var mainMap = document.getElementById('mainPanel');

        //Nasty stuff... hence we use the if to touch this as little as possible
        overlay.width = window.innerWidth + Conf.destinationWidth;
        overlay.height = window.innerHeight + quarterHeight * 2;
        overlay.style.top = -quarterHeight*2 + 'px';
        overlay.style.left = -Conf.destinationWidth / 2 + 'px';
        mainMap.width = window.innerWidth + Conf.destinationWidth; //Maybe avoid using screen, as we're not *certain* we'll be fullscreen, even if that's the permission we'll ask for
        mainMap.height = window.innerHeight + quarterHeight * 2;
        mainMap.style.top = -quarterHeight*2 + 'px';
        mainMap.style.left = -Conf.destinationWidth / 2 + 'px';
        document.body.style.width = window.innerWidth + 'px';
        document.body.style.height = window.innerHeight + 'px';
    }
    Conf.xLimit = Math.ceil(Conf.mPanCanvas.width / Conf.destinationWidth);
    Conf.yLimit = Math.ceil(Conf.mPanCanvas.height / (quarterHeight * 3));
    Conf.mPanLoc.clearRect(0, 0, Conf.mPanCanvas.width, Conf.mPanCanvas.height);
    drawTile(0, getTile('x'), getTile('y'), Conf.tileHighlight, Conf.mPanLoc);

    //Messy stuff to handle if I try to zoom out of the map...
    if(Conf.retY - Conf.yLimit / 2 < 0) {
        Conf.retY = Math.floor(Conf.retY - (Conf.retY - Conf.yLimit / 2));
    } else if(Conf.retY + Conf.yLimit / 2 > Conf.radarRad * 2) {
        Conf.retY = Math.floor(Conf.retY - Conf.yLimit / 2);
    }
    if(Conf.retX - Conf.xLimit / 2 < 0) {
        Conf.retX = Math.floor(Conf.retX - (Conf.retX - Conf.xLimit / 2));
    } else if(Conf.retX + Conf.xLimit / 2 > Conf.radarRad * 2) {
        Conf.retX = Math.floor(Conf.retX - Conf.xLimit / 2);
    }
    if(Conf.yLimit % 2 === 0) {
        Conf.yLimit += 1;
    }

    Conf.yShift = Math.round(Conf.yLimit / 2);

    if(Conf.yShift % 2 === 0) {
        Conf.yShift += 1;
        Conf.yLimit += 2;
    }

    if(Conf.retY % 2 !== 0) {
        Conf.retY += 1;
    }
    drawRadar();
    drawLoc();
}

/**
 * Checks which buildings are available to the player and
 * populates the sidebar with those buildings
 */
function checkBuildings() {
    for(var thing = 0; thing < Conf.buildings.length; thing++) {
        var idString = Conf.buildings[thing][0];
        var elem = document.getElementById(idString);
        elem.classList.remove('menu_selected');
        if(Conf.buildings[thing][1]) {
            elem.classList.add('menu_show');
            elem.classList.remove('menu_hide');
            switch(Conf.buildings[thing][2]) {
            case 0:
                if(Conf.level === 0) {
                    elem.classList.add('active');
                    document.getElementById(Conf.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
                }
                break;
            case 1:
                if(Conf.level > 0) {
                    elem.classList.add('active');
                    document.getElementById(Conf.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Conf.buildings[thing][0]).onclick = null;
                }
                break;
            default:
                elem.classList.add('active');
                document.getElementById(Conf.buildings[thing][0]).onclick = construct;
            }
        } else {
            elem.classList.remove('menu_show');
            elem.classList.add('menu_hide');
            if(Conf.clickedOn === idString) {
                Conf.clickedOn = 'none';
                document.body.style.cursor = "url('images/pointers/pointer.png'), default";
            }
        }
    }
    checkRobots();
}



/**
* Manages what robots are available for the given context in the menu
*/
function checkRobots() {
    //TODO: clean all this shit up
    for(var r2d2 in Conf.robotsList) {
        var wallE = Conf.robotsList[r2d2];
        var idString = wallE[2];
        var c3po = document.getElementById(idString);
        c3po.classList.remove('menu_selected');
        if(wallE[3]) {
            c3po.classList.add('menu_show');
            c3po.classList.remove('menu_hide');
            switch(wallE[4]) {
            case 0:
                if(Conf.level === 0) {
                    c3po.classList.add('active');
                    c3po.onclick = construct;
                } else {
                    c3po.classList.remove('active');
                    c3po.onclick = null;
                }
                break;
            case 1:
                if(Conf.level > 0) {
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
                if(Conf.clickedOn === idString) {
                    Conf.clickedOn = 'none';
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
    if(Conf.robotsList[1][1] - Conf.robotsList[1][0] <= 1) {
        var rob = document.getElementById(Conf.robotsList[1][2]);
        rob.classList.remove('active');
        rob.onclick = null;
        //rob.style.background = '#000';
        if(Conf.clickedOn === 'digger' || (Conf.clickedOn === 'cavernDigger' && Conf.robotsList[1][1] - Conf.robotsList[1][0] === 0)) {
            Conf.clickedOn = 'none';
            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        }
        if(Conf.robotsList[1][1] - Conf.robotsList[1][0] === 0) {
            var cavDig = document.getElementById('cavernDigger');
            cavDig.classList.remove('active');
            cavDig.onclick = null;
            //cavDig.style.background = '#000';
        }
    }
}



/**
 * Changes level from an input (slider etc.)
 * @param  {int} newLevel the level we would change to
 */
function changeLevel(newLevel) {
    Conf.level = parseInt(newLevel, 10);
    checkBuildings();
    drawRadar();
}



/**
 * Recounts the number of bots available and updates the counter bars appropriately
 * @param  {string} which The type of robot we're dealing with
 */
function reCount(which) {
    var count = function(id, numID, index) {
            document.getElementById(id).style.height = ((Conf.robotsList[index][1] - Conf.robotsList[index][0]) / Conf.robotsList[index][1]) * 100 + '%';
            document.getElementById(numID).innerHTML = TRANS.available + (Conf.robotsList[index][1] - Conf.robotsList[index][0]);
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
 * @param  {boolean} [bool] check to see if we should be resizing
 */
function leftMenuResize(bool) {
    if(bool) {
        document.getElementById('leftMenu').onmousemove = resize;
    } else {
        document.getElementById('leftMenu').onmousemove = null;
    }
}

/**
 * Manages the actual values for the resized menu from {@link leftMenuResize}
 * @param {event} e The mousemove event
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
    Conf.augment ? Conf.animate += 1 : Conf.animate -= 1;
    if(Conf.animate === 0 || Conf.animate === N) {
        Conf.augment ? Conf.augment = false : Conf.augment = true;
    }
}



/**
* Prints provided text to the in-game console
* @param {string} text Text to print
*/
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



/**
* In the event of bad input to the in-game console, prints the error message
* @param {string} text The erroneous console input
* @param {string} err The error type
* @param {string} [command] The command that was passed
* @param {string} [fix] Proposed fix
* @param {int} [lwrLimit] Lowest accepted value for this command
* @param {int} [uprLimit] Highest accepted value for this command
*/
function consoleErr(text, err, command, fix, lwrLimit, uprLimit){
    if(err === 'value'){
        var errText = text + ' ' + TRANS.valueErr + ' "' + command + '"' + ', ' + fix;
        if(lwrLimit){
            errText += ' ' + TRANS.between + ' ' + lwrLimit + ' ' + TRANS.and + ' ' + uprLimit;
        }
        printConsole(errText);
    } else if(err === 'command') {
        printConsole('"' + text + '"' + ' ' + TRANS.commandErr);
    } else {
        printConsole(text + ' ' + TRANS.consoleInputErr);
    }
}



/**
* Parses the proveded string and runs appropriate command ro throws appropriate error
* @param {string} text The text to parse and run
*/
function runConsole(text){
    document.getElementById('consoleInput').value = '';
    printConsole(text);
    var input = text.split(" ");

    //switch(text)
    switch(input[0]){
        case TRANS.advance: //advance multiple turns
            if(!isNaN(input[1])){
                advanceTurn(input[1]);
            } else {
                consoleErr(input[1], 'value', input[0], TRANS.integer);
            }
            break;
        case TRANS.hello:
            printConsole(TRANS.world);
            break;
        case TRANS.level:
            if(input[1] >= 0 || input[1] <= 4){
                Conf.level = parseInt(input[1], 10);
                checkBuildings();
                drawRadar();
                document.getElementById('slider').value = Conf.level;
            } else {
                consoleErr(input[1], 'value', input[0], TRANS.integer, 0, 4);
            }
            break;
        case TRANS.home:
            if(Conf.home){
                jump(true, Conf.home[0], Conf.home[1], 0);
            } else {
                printConsole(TRANS.setDown);
            }
            break;
        case TRANS.seed:
            printConsole(Conf.inputSeed);
            break;
        case TRANS.zoom:
            if(input[1] >= 1 || input[1] <= 6){
                document.getElementById('zoom').value = input[1];
                zoom(input[1]);
            } else {
                consoleErr(input[1], 'value', input[0], TRANS.integer, 1, 6);
            }
            break;
        case TRANS.help:
            switch(input[1]){
                case TRANS.advance:
                    printConsole(TRANS.advanceMan);
                    break;
                case TRANS.hello:
                    printConsole(TRANS.helloMan);
                    break;
                case TRANS.level:
                    printConsole(TRANS.levelMan);
                    break;
                case TRANS.home:
                    printConsole(TRANS.home);
                    break;
                case TRANS.seed:
                    printConsole(TRANS.seedMan);
                    break;
                default:
                    printConsole(TRANS.helpMan);
            }
            break;
        default:
            consoleErr(input[0], 'command');
    }
    document.getElementById('console').classList.add('console_open');
}



/**
 * Generic keyboard listener
 * @param  {Event} e The event passed in upon key press
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
    } else if(Conf) {
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
            Conf.level = 0;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        case 49:
            Conf.level = 1;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        case 50:
            Conf.level = 2;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        case 51:
            Conf.level = 3;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        case 52:
            Conf.level = 4;
            checkBuildings();
            drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        case 27:
            document.getElementById(Conf.clickedOn).classList.add('menu_available');
            Conf.clickedOn = 'none';
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
function getMousePos(canvas, evt) {
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
    Conf.mouseX = evt.clientX - left + window.pageXOffset + Conf.destinationWidth / 2;
    Conf.mouseY = evt.clientY - top + window.pageYOffset;
}

/**
 * Depending on the key pressed, changes the reference reticule
 *and then redraws the maps and radar
 * @param  {string} dir is the direction to move
 */
function move(dir) {
    var upY = Conf.retY - 2;
    var downY = Conf.retY + 2;
    var leftX = Conf.retX - 1;
    var rightX = Conf.retX + 1;
    switch(dir) {
    case 'up':
        if(upY >= (Conf.yLimit / 2)) {
            Conf.retY = upY;
        }
        break;
    case 'down':
        if(downY <= (Conf.radarRad * 2) - (Conf.yLimit / 2)) {
            Conf.retY = downY;
        }
        break;
    case 'left':
        if(leftX >= (Conf.xLimit / 2)) {
            Conf.retX = leftX;
        }
        break;
    case 'right':
        if(leftX < (Conf.radarRad * 2) - (Conf.xLimit / 2) - 2) {
            Conf.retX = rightX;
        }
        break;
    case 'level':
        Conf.level === 4 ? Conf.level = 0 : Conf.level += 1;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Conf.level;
        break;
    default:
        break;
    }
    drawLoc();
}

/**
 * Returns the adjacent tile reference in y and x (inverted for historical reasons)
 * @param  {int} x X coordiante for tile we want to get the adjacent tiles for
 * @param  {int} y Y coordiante for tile we want to get the adjacent tiles for
 * @param  {int} index Which tile are we checking? 0 for top left then count up
 * clockwise
 * @return {array} The coordinates for the tile at the provided index
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
 * @return {boolean} Wet or not
 */
function wetTest(yxArrayIn, level) {
    var yxArray = yxArrayIn.slice(0);
    for(var i = 0; i < 6; i++) {
        if(Conf.map[level][adjacent(yxArray[1], yxArray[0], i)[0]][adjacent(yxArray[1], yxArray[0], i)[1]].kind === 4) {
            return true;
        }
    }
    return false;
}



/**
 * Gets the x or y value for the currently moused over tile
 * @param  {string} The axis we want the coordinate of
 * @return {int} The coordinate for desired axis
 */
function getTile(axis) {
    var x, y, yDiff, xDiff, left, right;

    //set the general cases
    y = Math.floor(Conf.mouseY / (Conf.destinationHeight * 0.75));

    y % 2 !== 0 ? x = Math.floor((Conf.mouseX - Conf.destinationWidth / 2) / Conf.destinationWidth) : x = Math.floor(Conf.mouseX / Conf.destinationWidth);

    //corner case code
    yDiff = (Conf.mouseY / (Conf.destinationHeight * 0.75)) - y;
    if(yDiff < 0.33) { //If we're in the top third of the reference rectangle
        //tells which intermediate block we're in...
        if(y % 2 !== 0) {
            xDiff = ((Conf.mouseX - Conf.destinationWidth / 2) / Conf.destinationWidth - x);
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
            xDiff = (Conf.mouseX / Conf.destinationWidth - x);
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
 * @param {bool} [bool] Force a jump to a particular spot (see other parameters)
 * @param {int} [x] X coordinate for where the map was clicked
 * @param {int} [y] Y coordinate for where the map was clicked
 * @param {int} [level] The level the player is on
 */
function jump(bool, x, y, level) {
    if(bool){
        Conf.retX = x + 1;
        Conf.retY = y + 2;
        Conf.level = level;
    } else {
        Conf.retX = Math.floor(Conf.mouseX - Conf.destinationWidth / 2);
        Conf.retY = Conf.mouseY - 20;
    }
    mapFit();
    drawLoc();
}



/**
* Determines if a point is within communications range of the colony or not
* @param {int} x X coordinate of point to test
* @param {int} y Y coordinate of point to test
* @returns {bool} Whether the point is in communications range or not
*/
function inRange(x, y){
    for(var tower = 0; tower < Conf.commTowers.length; tower++){
        var radius = 75 - Conf.level*10;
        var thisTower = Conf.mapTiles[0][Conf.commTowers[tower][1]][Conf.commTowers[tower][0]].kind;
        if(thisTower === 210 || thisTower === 237){
            radius -= 25;
        }
        if(Tools.distance(Conf.commTowers[tower][0], Conf.commTowers[tower][1], x, y) <= radius){
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
    Conf.radar.clearRect(0, 0, Conf.radarRad * 2, Conf.radarRad * 2);
    var radarPixels = Conf.radar.createImageData(Conf.radarRad * 2, Conf.radarRad * 2);
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
            var kind = Conf.map[Conf.level][y][x].kind;
            var resourceOnTile = Conf.map[Conf.level][y][x].resources;
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
                    Conf.level !== 0 ? radarPixels.data[idx + i] = ugColor[4][i] : radarPixels.data[idx + i] = surfaceColor[4][i];
                } else {
                    radarPixels.data[idx + i] = other[i];
                }
                for(var j = 0; j < options.length; j++){
                    if(Conf.map[Conf.level][y][x].mineable && document.getElementById(options[j]).checked){
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
    Conf.radar.putImageData(radarPixels, 0, 0);
    for(var tower = 0; tower < Conf.commTowers.length; tower++){
        var radius = 75 - Conf.level*10;
        var thisTower = Conf.mapTiles[0][Conf.commTowers[tower][1]][Conf.commTowers[tower][0]].kind;
        if(thisTower === 210 || thisTower === 237){
            radius -= 25;
        }
        Conf.radar.beginPath();
        Conf.radar.strokeStyle = '#BD222A';
        Conf.radar.lineWidth = 0.3;
        Conf.radar.arc(Conf.commTowers[tower][0], Conf.commTowers[tower][1], radius, 0, Math.PI*2, true);
        Conf.radar.stroke();
        Conf.radar.closePath();
    }
    Conf.level === 0 ? Conf.radar.fillStyle = "#000000" : Conf.radar.fillStyle = "#ffffff";
    Conf.radar.font = "14px Arial";
    Conf.radar.fillText('Depth: ' + Conf.level * 50 + 'm', 215, 298);
}



/**
* Cross references the indexes of processed minerals to their ores
* @param {int} ref 
* @param {int} dir 'Direction' of the conversion: (0 processed -> ore; 1 ore -> processed
* @returns {array} 
* @todo dir seems redundant here
*/
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
 * Accepts the kind of tile to draw, the x column number and the y column number, then draws it
 * @param {int} tileType  Type of tile to draw
 * @param {int} tilePosX  Tile's x coordinate
 * @param {int} tilePosY  Tile's y coordinate
 * @param {Object} source The image object to get sprite from.(Probably {@link Conf#tileHighlight} or {@link Conf#spritesheet})
 * @param {Object} destination The canvas context to draw the images to
 * @param {bool} animateIt Whether or not the sprite is animated
 * @param {int} modX From 0, move to the modXth sprite
 * @param {int} modY From 0, move to the modYth sprite
 */
function drawTile(tileType, tilePosX, tilePosY, source, destination, animateIt, modX, modY) {
    var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY; //Canvas vars
    sourceWidth = 216; //original tile width
    sourceHeight = 252; //original tile height
    destinationY = Math.floor(tilePosY * Conf.destinationWidth * 0.86); //shift it, the number here is a constant that depends on the hexagon deformation
    if(tilePosY % 2 === 0) { //if the row is even...
        destinationX = Math.floor(tilePosX * Conf.destinationWidth - Conf.destinationWidth / 2); //we set its X normally
    } else { //if it’s odd though
        destinationX = Math.floor(tilePosX * Conf.destinationWidth); //we need a little bit of displacement
    }
    animateIt ? sourceX = Conf.animate * sourceWidth : sourceX = 0;
    sourceX += sourceWidth * modX;
    sourceY = (tileType * sourceHeight) + (sourceHeight * modY);
    destination.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, Conf.destinationWidth, Conf.destinationHeight);
}




/**
 * Draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule
 */
function drawZoomMap() {
    var y, x, tileKind;
    mainLoop();
    requestAnimationFrame(drawZoomMap);
    Conf.mPanLoc.clearRect(0, 0, Conf.mPanCanvas.width, Conf.mPanCanvas.height);
    if(Conf.highlight) {
        drawTile(0, getTile('x'), getTile('y'), Conf.tileHighlight, Conf.mPanLoc, false, 0, 0);
    }
    for(y = 0; y < Conf.yLimit; y++) {
        x = 0;
        while(x <= Conf.xLimit) {
            if(typeof Conf.mapTiles[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind === "number"){
                tileKind = Conf.mapTiles[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind;
            } else {
                tileKind = Conf.map[Conf.level][Conf.retY - Conf.yShift + y][(Conf.retX - Math.round(Conf.xLimit / 2)) + x].kind;
            }

            if(tileKind < 100) {
                drawTile(tileKind, x, y, Conf.spritesheet, Conf.mPanel, false, 10, 3);
            } else if(tileKind >= 200) {
                drawTile(tileKind - 200, x, y, Conf.spritesheet, Conf.mPanel, false, 0, 4);
            } else {
                drawTile(tileKind - 100, x, y, Conf.spritesheet, Conf.mPanel, true, 0, 0);
            }
            x++;
        }
    }
}



/**
 * draws the current location on the small radar map
 */
function drawLoc() {
    Conf.radarLoc.clearRect(0, 0, Conf.radarRad * 2, Conf.radarRad * 2);
    Conf.radarLoc.beginPath();
    Conf.radarLoc.fillRect(Conf.retX - (Conf.xLimit / 2), Conf.retY - (Conf.yLimit / 2), Conf.xLimit, Conf.yLimit);
    Conf.radarLoc.fillStyle = 'rgba(255,251,229,0.3)';
    Conf.radarLoc.fill();
    Conf.radarLoc.closePath();
    Conf.radarLoc.beginPath();
    Conf.radarLoc.strokeRect(Conf.retX - (Conf.xLimit / 2), Conf.retY - (Conf.yLimit / 2), Conf.xLimit, Conf.yLimit);
    Conf.radarLoc.strokeStyle = '#BD222A';
    Conf.radarLoc.stroke();
    Conf.radarLoc.closePath();
}



/**
* Upon right click, creates the context menu
* @param {string} content The content for the right click menu in html
*/
function rightClicked(content) {
    //TODO : Make context menu appear on the correct side relative to mouse position near screen edges
    var popFrame = document.getElementById('contextMenuWrapper');
    var pop = document.getElementById('contextMenu');
    /**
    * @param {Event} e Upon detecting a mouseout, hides and cleans up the menu
    */
    var hide = function(e) {
        if(((e.relatedTarget || e.toElement) === popFrame.nextElementSibling) || ((event.relatedTarget || event.toElement) == popFrame.parentNode)){
            popFrame.style.opacity = '0';
            setTimeout(function(){
                popFrame.style.display = 'none';
                Tools.flush(pop);
            }, 200);
            popFrame.removeEventListener('mouseout', hide);
        }
    };
    Tools.flush(pop);
    pop.appendChild(contextContent(content));
    popFrame.style.top = event.clientY - 25 + 'px';
    popFrame.style.left = event.clientX - 10 + 'px';
    popFrame.style.display = 'inline-block';
    popFrame.style.opacity = '1';
    popFrame.addEventListener('mouseout', hide, false);

}



/**
* Once a right click menu has been created, returns the HTML fragment to to be appended
* @param {string} content Html content to put into the right click menu
* @returns {Object} Document Fragment to append
*/
function contextContent(content) {
    var y = Conf.retY - Math.round(Conf.yLimit / 2) + getTile('y');
    var x = Conf.retX - Math.round(Conf.xLimit / 2) + getTile('x');
    console.log(Conf.level + ' ' + x + ' ' + y);
    var tile = Conf.map[Conf.level][y][x];
    var construct = Conf.mapTiles[Conf.level][y][x];
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
        buildString += TRANS.buildTime + (construct.buildTime + 1) + " ";
        //This next part is too language specific methinks
        if(construct.buildTime >= 1) {
            buildString += TRANS.weeks;
        }else{
            buildString += TRANS.week;
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
        power.innerHTML = TRANS.noPower;
        down.innerHTML = TRANS.shutdown;
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
                resourceTitle.innerHTML = TRANS.resources;
                frag.appendChild(resourceTitle);
                resources = true;
            }
            var item = document.createElement('li');
            item.innerHTML = Conf.resourceArray[i][0] + ': ' + resourceList[i] + 't';
            var nameIndent = document.createElement('ul');
            var name = document.createElement('li');
            name.innerHTML = Conf.resourceArray[i][1];
            nameIndent.appendChild(name);
            item.appendChild(nameIndent);
            listedResources.appendChild(item);
        }
    }
    frag.appendChild(listedResources);
    //!resources
    return frag;
}



/**
* Given two strings, will return a modified version (for tile references)
* @param {string} string String to be placed at begginning of modified string
* @param {string} orig Original string
* @returns {string} Returns <tt>string</tt> + " #" + the first word after # in <tt>orig</tt>
*/
function changeName(string, orig) {
    return string + ' #' + orig.split('#')[1];
}



/**
* Provides the list of materials needed, either as a directly usable array, a 
* boolean value representing availability or as a Document Fragment for use in 
* the context menu
* @param {string} building The building to get list for
* @param {bool} getRec If true, will try to requisition the required materials, returning success or failure
* @param {bool} recycling If true, will simply get the array of materials needed for a construction
* @returns {(array|bool|Object)} Array of materials needed | Success or failure of requisition | Document Fragment listing material availability
*/
function resourceNeededList(building, getRec, recycling){
    var resourcesNeeded;
    var future;
    switch(building) {
            //Buildings
    case 'agri':
        //agridome
        future = TRANS.agri;
        resourcesNeeded = [[0,2],[1,1],[4,1],[9, 1]];
        break;
    case 'agri2':
        //advanced agridome
        future = TRANS.agri2;
        resourcesNeeded = [[0,1],[1,1],[8,1],[9, 1]];
        break;
    case 'airport':
        //airport
        future = TRANS.airport;
        resourcesNeeded = [[2,1],[4,2],[12, 1]];
        break;
    case 'arp':
        //arp
        future = TRANS.arp;
        resourcesNeeded = [[0,2],[4,1],[12, 1],[13,1]];
        break;
    case 'airlift':
        //airshaft
        future = TRANS.airlift;
        resourcesNeeded = [[0,1]];
        break;
    case 'barracks':
        //barracks
        future = TRANS.barracks;
        resourcesNeeded = [[4,2],[12, 1]];
        break;
    case 'civprot':
        //civil protection
        future = TRANS.civprot;
        resourcesNeeded = [[4,2],[12, 1]];
        break;
    case 'civprot2':
        //civil protection 2
        future = TRANS.civprot2;
        resourcesNeeded = [[2,1],[4,2],[12, 1]];
        break;
    case 'commarray':
        //comm array
        future = TRANS.commarray;
        resourcesNeeded = [[0,2],[2,2],[4,1]];
        break;
    case 'commarray2':
        //comm array 2
        future = TRANS.commarray2;
        resourcesNeeded = [[0,2],[2,1],[12, 1],[13,1]];
        break;
    case 'command':
        //command
        future = TRANS.command;
        resourcesNeeded = [[0,2],[2,1],[4,1],[5, 1],[10,1],[12,1],[13,1]];
        break;
    case 'connector':
        // connector
        future = TRANS.connector;
        resourcesNeeded = [[4,1]];
        break;
    case 'dronefab':
        // drone factory
        future = TRANS.dronefab;
        resourcesNeeded = [[0,1],[2,1],[4,1],[5, 1],[6,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
        break;
    case 'chernobyl':
        // fission
        future = TRANS.chernobyl;
        resourcesNeeded = [[0,1],[2,2],[4,2],[5, 3],[7,1],[11,2],[12,1],[13,1]];
        break;
    case 'tokamak':
        // fusion
        future = TRANS.tokamak;
        resourcesNeeded = [[0,2],[2,2],[3,1],[4, 1],[5,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
        break;
    case 'genfab':
        // factory
        future = TRANS.genfab;
        resourcesNeeded = [[0,1],[2,1],[4,1],[12, 1]];
        break;
    case 'geotherm':
        // geothermal
        future = TRANS.geotherm;
        resourcesNeeded = [[0,1],[2,1],[4,1]];
        break;
    case 'hab':
        // habitat
        future = TRANS.hab;
        resourcesNeeded = [[2,1],[4,1],[5, 1],[12,1]];
        break;
    case 'hab2':
        // habitat 2
        future = TRANS.hab2;
        resourcesNeeded = [[2,1],[3,1],[4,1],[5,1],[12, 1]];
        break;
    case 'hab3':
        // habitat 3
        future = TRANS.hab3;
        resourcesNeeded = [[0,1],[2,1],[3,1],[5,1],[10,1],[12, 1]];
        break;
    case 'er':
        // hospital
        future = TRANS.er;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[5,2],[6,1],[10,1],[11,1],[12, 1],[13,1]];
        break;
    case 'mine':
        // mine
        future = TRANS.mine;
        resourcesNeeded = [[4,1]];
        break;
    case 'nursery':
        // nursery
        future = TRANS.nursery;
        resourcesNeeded = [[0,1],[1,1],[2,1],[4,1],[6,1],[10,1],[11,1],[12, 1],[13,1]];
        break;
    case 'oreproc':
        // ore processor
        future = TRANS.oreproc;
        resourcesNeeded = [[2,1],[4,2]];
        break;
    case 'rec':
        // recreation center
        future = TRANS.rec;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'recycling':
        // recycler
        future = TRANS.recycler;
        resourcesNeeded = [[2,1],[4,1],[8,1],[12, 1]];
        break;
    case 'clichy':
        // red light district
        future = TRANS.clichy;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'research':
        // research center
        future = TRANS.research;
        resourcesNeeded = [[0,1],[1, 1],[2,2],[3,1],[4,1],[5,1],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
        break;
    case 'research2':
        // research 2
        future = TRANS.research2;
        resourcesNeeded = [[0,1],[2,2],[3,2],[4,1],[5,2],[6,1],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2]];
        break;
    case 'solar':
        // solar farm
        future = TRANS.solar;
        resourcesNeeded = [[0,1],[2,1],[3,1],[7,1],[8,1],[13, 1]];
        break;
    case 'space':
        // space port
        future = TRANS.space;
        resourcesNeeded = [[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
        break;
    case 'stasis':
        // stasis block
        future = TRANS.stasis;
        resourcesNeeded = [[0,4],[1, 1],[2,3],[3,2],[4,3],[5,2],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
        break;
    case 'store':
        // Storage Tanks
        future = TRANS.store;
        resourcesNeeded = [[4,1]];
        break;
    case 'uni':
        // University
        future = TRANS.uni;
        resourcesNeeded = [[0,1],[1,2],[2,1],[4,1],[6,1],[7,1],[9,1],[10,1],[11,1]];
        break;
    case 'warehouse':
        // warehouse
        future = TRANS.warehouse;
        resourcesNeeded = [[0,1],[4,1]];
        break;
    case 'windfarm':
        // windfarm
        future = TRANS.windfarm;
        resourcesNeeded = [[0,1],[2,1],[4,1],[5,1]];
        break;
    case 'workshop':
        // workshop
        future = TRANS.workshop;
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
        need.innerHTML = TRANS.confirmBuild;
        frag.appendChild(spacer);
        frag.appendChild(need);
        var title = document.createElement('h3');
        title.innerHTML = TRANS.resourcesNeeded + ' (' + future + ')';
        frag.appendChild(title);
        var required = document.createElement('ul');
        for(var resource = 0; resource < resourcesNeeded.length; resource++){
            var which = resourcesNeeded[resource][0];
            var amount = resourcesNeeded[resource][1];
            var item = document.createElement('li');
            if(Conf.procOres[which] >= amount){
                item.classList.add('green');
            } else {
                item.classList.add('red');
            }
            item.innerHTML = amount + ' ' + Conf.resourceNames[which];
            required.appendChild(item);
        }
        frag.appendChild(required);
        console.log(frag);
        return frag;
    }
}



/**
* Depending on availability, will take the resources indicated. If not all the 
* resources are available, it wil print the missing resources to the in-game
* console
* @param {array} arr Array of materials to requisition
* @returns {bool} Success or not
* @todo This function should probably handle recycling as well
*/
function requisition(arr){//TODO set up recycling here
    var resourceCheck = false;
    var count = 0;
    for(var j = 0; j < arr.length; j++){
        if(Conf.procOres[arr[j][0]] >= arr[j][1]){
            count += 1;
        }
    }
    if(count === arr.length){
        resourceCheck = true;
        for(var k = 0; k < arr.length; k++){
            Conf.procOres[arr[k][0]] -= arr[k][1];
        }
        execReview();
    } else {
        var shortage = TRANS.resourceShortage;
        for(var s = 1; s < arr.length; s++){
            if(Conf.procOres[arr[s][0]] < arr[s][1]){
                shortage += Conf.resourceNames[arr[s][0]] + ", ";
            }
        }
        printConsole(shortage.substring(0,shortage.length - 2)); //removes the space and comma
    }
    return resourceCheck;

}



/**
* Checks connectivity of the provided tile with the colony (on the current level)
* @param {int} y Y coordinate to check
* @param {int} x X coordinate to check
* @returns {bool} Connected or not
*/
function checkConnection(y, x) {
    var connected = false;
    for(var j = 0; j < 6; j++) {
        if(Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]] && 
           (Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 211 || 
           Conf.mapTiles[Conf.level][adjacent(x, y, j)[0]][adjacent(x, y, j)[1]].kind === 204)) {
            connected = true;
        }
    }
    return connected;
}



/**
 * Performs the appropriate actions for the tile that is clicked upon depending on 
 * the construction or robot chosen
 * @param {bool} direction If true, action takes place, if not, will ask for confirmation
 */
function clicked(direction) {
    var y = Conf.retY - Math.round(Conf.yLimit / 2) + getTile('y');
    var x = Conf.retX - Math.round(Conf.xLimit / 2) + getTile('x');
    //var kind;
    console.log('x: ' + x + '  y: ' + y);
    var hex = Conf.mapTiles[Conf.level][y][x];
    var tile = Conf.map[Conf.level][y][x];
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


    if(Conf.level < 5) {
        lowerTile = Conf.map[Conf.level + 1][y][x];
    }
    if(Conf.level > 0) {
        upperTile = Conf.map[Conf.level - 1][y][x];
    }
    switch(Conf.clickedOn) {
    case 'lander':
        if(wetTest([y,x],Conf.level)){
            printConsole(TRANS.onWater);
        } else {
            Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(210, x, y, Conf.level);
            Conf.home = [x,y];
            for(var j = 0; j < 6; j++) {
                var tempY = adjacent(x, y, j)[0];
                var tempX = adjacent(x, y, j)[1];
                switch(j) {
                case 1:
                case 3:
                case 5:
                    Conf.mapTiles[0][tempY][tempX] = bobTheBuilder(211, tempX, tempY, Conf.level);
                    break;
                case 0:
                    Conf.mapTiles[0][tempY][tempX] = bobTheBuilder(235, tempX, tempY, Conf.level);
                    break;
                case 2:
                    Conf.mapTiles[0][tempY][tempX] = bobTheBuilder(203, tempX, tempY, Conf.level);
                    break;
                case 4:
                    Conf.mapTiles[0][tempY][tempX] = bobTheBuilder(237, tempX, tempY, Conf.level);
                    Conf.commTowers.push([tempX, tempY]);
                    break;
                default:
                    console.log("The eagle most definitely has *not* landed");
                }
            }
            Conf.buildings[37][1] = false;
            var buildable = [0, 3, 8, 11, 17, 23, 25, 27, 32, 34, 35, 36];
            for(var ref in buildable) {
                Conf.buildings[buildable[ref]][1] = true;
            }
            for(var i = 0; i < Conf.robotsList.length; i++) {
                Conf.robotsList[i][3] = true;
            }
            checkBuildings();
            execReview();
            drawRadar();
        }
        break;
    case 'dozer':
        if(!direction) {
            rightClicked(confirmBot(TRANS.confirmDoze));
            document.getElementById('confirmBuild').onclick = function(){
                console.log('how many times?');
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if((hex && (hex.kind < 200 && hex.kind > 2)) || (typeof hex.kind !== 'number' && tile.kind > 2 && tile.kind < 9) || tile.kind > 11) {
                printConsole(TRANS.noDoze);
            } else if(!inRange(x, y)){
                printConsole(TRANS.outOfRange);
            } else {
                Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(100, x, y, Conf.level);
            }
        }
        break;
    case 'digger':
        if(!direction) {
            rightClicked(confirmBot(TRANS.confirmDig));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            //tile.digDown(x, y, lowerTile);
            var DBelow = Conf.mapTiles[Conf.level + 1];
            if(!checkConnection(y,x)){
                printConsole(TRANS.noConnection);
            } else if(wetTest([y, x], Conf.level + 1)){
                printConsole(TRANS.onWater);
            } else if((hex && hex.kind >= 100) || (DBelow[y][x] && DBelow[y][x].kind >= 100)){
                printConsole(TRANS.buildingPresent);
            } else if((hex.kind > 3 && hex.kind < 9) || hex.kind > 11) {
                printConsole(TRANS.noDig);
            } else if(Conf.level === 4){
                printConsole(TRANS.lastLevel);
            } else if(!inRange(x, y)){
                printConsole(TRANS.outOfRange);
            } else {
                Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(101, x, y, Conf.level, true);
                DBelow[y][x] = bobTheBuilder(101, x, y, Conf.level + 1, true);
                for(var k = 0; k < 6; k++) {
                    var belowAdj = DBelow[adjacent(x, y, k)[0]][adjacent(x, y, k)[1]];
                    if((belowAdj.exists && (belowAdj.kind >= 100 || belowAdj[1].kind < 4)) || Conf.map[Conf.level + 1][adjacent(x, y, k)[0]][adjacent(x, y, k)[1]].kind === 4 || wetTest([adjacent(x, y, k)[0], adjacent(x, y, k)[1]], Conf.level + 1)) {
                        //do nothing
                    } else {
                        Conf.mapTiles[Conf.level + 1][adjacent(x, y, k)[0]][adjacent(x, y, k)[1]] = bobTheBuilder(101101, adjacent(x, y, k)[1], adjacent(x, y, k)[0], Conf.level + 1);
                    }
                }
            }
        }
        break;
    case 'cavernDigger':
        if(!direction) {
            rightClicked(confirmBot(TRANS.confirmDigCavern));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(wetTest([y, x], Conf.level)){
                printConsole(TRANS.onWater);
            } else if((hex && hex.kind > 3) || Conf.level === 0 || (hex.kind > 2 && hex.kind < 9) || hex.kind > 11) {
                printConsole(TRANS.noCavern);
            } else if(!inRange(x, y)){
                printConsole(TRANS.outOfRange);
            } else {
                Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(101, x, y, Conf.level);
                for(var z = 0; z < 6; z++) {
                    var around = Conf.mapTiles[Conf.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]];
                    if((around && (around.kind >= 100 || around.kind < 4)) || Conf.map[Conf.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]].kind < 4 || wetTest([adjacent(x, y, z)[0], adjacent(x, y, z)[1]], Conf.level + 1)) {
                        //do nothing
                    } else {
                        Conf.mapTiles[Conf.level][adjacent(x, y, z)[0]][adjacent(x, y, z)[1]] = bobTheBuilder(101101, adjacent(x, y, z)[1], adjacent(x, y, z)[0], Conf.level);
                    }
                }
            }
        }
        break;
    case 'miner':
        if(!direction) {
            rightClicked(confirmBot(TRANS.confirmMine));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(wetTest([y, x], Conf.level + 1)){
                printConsole(TRANS.onWater);
            } else if(hex && hex.kind !== 221 && hex.kind >= 100) {
                printConsole(TRANS.noMine);
            } else if(Conf.level !== 0 && (!hex || hex && hex.kind !== 221)){
                printConsole(TRANS.noMine);
            } else if(Conf.level === 4) {
                printConsole(TRANS.lastLevel);
            } else if(!inRange(x, y)){
                printConsole(TRANS.outOfRange);
            } else {
                Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(102, x, y, Conf.level, true);
                Conf.mapTiles[Conf.level + 1][y][x] = bobTheBuilder(102102, x, y, Conf.level + 1, true);
                for(var m = 0; m < 6; m++) {
                    var mineY = adjacent(x, y, m)[0];
                    var mineX = adjacent(x, y, m)[1];
                    if(Conf.map[Conf.level][mineY][mineX].mineable) {
                        Conf.mapTiles[Conf.level][mineY][mineX] = bobTheBuilder(102102, mineX, mineY, Conf.level, false);
                    }
                    if(Conf.map[Conf.level + 1][mineY][mineX].mineable) {
                        Conf.mapTiles[Conf.level + 1][mineY][mineX] = bobTheBuilder(102102, mineX, mineY, Conf.level + 1, false);
                    }
                }
            }
        }
        break;
    case 'recycler':
        if(!direction) {
            rightClicked(confirmBot(TRANS.confirmRecycle));
            document.getElementById('confirmBuild').onclick = function(){
                clicked(true);
                document.getElementById('confirmBuild').onclick = null;
            };
        } else {
            if(hex && hex.kind >= 200){
                recycle(hex.kind, x, y, Conf.level);
            } else {
                printConsole(TRANS.noRecycle);
            }
        }
        //TODO: add recycle code
        break;
    default:
        if(!direction){
            rightClicked(resourceNeededList(Conf.clickedOn));
            if(document.getElementById('confirmBuild')){
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };}
        } else {
            if((checkConnection(y, x) || Conf.clickedOn === 'commarray' || Conf.clickedOn === 'commarray2') && hex && hex.kind === 3) {
                if(resourceNeededList(Conf.clickedOn, true)){
                    Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(getBuildingRef(Conf.clickedOn), x, y, Conf.level);
                }
            } else {
                !checkConnection(y, x) ? printConsole(TRANS.noConnection) : printConsole(TRANS.notPrepared);
            }
        }
    }
    drawRadar();
}


/**
 * When a menu item is clicked, this remembers what it is until the next click 
 * @param {string} reference The menu item id that was clicked
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



/**
* Changes cursor appropriately depending on interaction with menu
* @todo The resources used in this function should be generalized
*/
function construct() {
    var identity = this.id;
    if(Conf.clickedOn === identity) {
        document.getElementById(Conf.clickedOn).classList.remove('menu_selected');
        Conf.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
    } else {
        if(Conf.clickedOn !== 'none') {
            document.getElementById(Conf.clickedOn).classList.remove('menu_selected');
        }
        document.getElementById(identity).classList.add('menu_selected');
        Conf.clickedOn = identity; /**TODO : Update this to be the primary key listener*/
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