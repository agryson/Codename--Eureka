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
            if(Conf.mapTiles[levelIn][CneTools.adjacent(xIn, yIn, i)[0]][CneTools.adjacent(xIn, yIn, i)[1]] && Conf.mapTiles[levelIn][CneTools.adjacent(xIn, yIn, i)[0]][CneTools.adjacent(xIn, yIn, i)[1]].kind === 221 && !Conf.mapTiles[levelIn][CneTools.adjacent(xIn, yIn, i)[0]][CneTools.adjacent(xIn, yIn, i)[1]].shutdown) {
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
            Conf.mapTiles[level][y][x].ref = CneTools.changeName(tile.future[1], Conf.map[level][y][x].ref);
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
                Conf.mapTiles[level][y][x].ref = CneTools.changeName(TRANS.minedOut, Conf.mapTiles[level][y][x].ref);
            }
        }
        //TODO: will surely need to fix this after ...
        //Research
        if(tile.researchTopic !== 'noResearch'){
            Research.updateProgress(tile);
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
            o.ref = CneTools.changeName(TRANS.building + Conf.buildings[kind - 200][3], Conf.map[level][y][x].ref);
        }
        console.log(kind);
        switch(kind) {
            //Bots
        case 100:
            o.vital = true;
            o.buildTime = eta(2);
            o.future = [3, TRANS.prepared];
            o.ref = CneTools.changeName(TRANS.preparing, Conf.map[level][y][x].ref);
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
            o.ref = CneTools.changeName(TRANS.digging, Conf.map[level][y][x].ref);
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
            o.ref = CneTools.changeName(TRANS.diggingCavern, Conf.map[level][y][x].ref);
            reCount('cavernDigger');
            break;

        case 102:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(3);
            if(builderBot) {
                o.future = [221, TRANS.building];
            }
            o.ref = CneTools.changeName(TRANS.mining, Conf.map[level][y][x].ref);
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
                o.ref = CneTools.changeName(TRANS.mining, Conf.map[level][y][x].ref);
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
            o.ref = CneTools.changeName(TRANS.lander, Conf.map[level][y][x].ref);
            break;
        default:
            console.log("Bob can't build it... :( " + kind);
            return false;
        }
        return o;
    } else {
        Terminal.print(TRANS.onWater);
    }
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
        Terminal.print(TRANS.noAir);
    } else {
        Conf.noAir = 0;
    }

    Conf.sdf[Conf.sdf.length - 1] = Conf.pop[Conf.pop.length - 1] - Math.floor(Conf.housing[Conf.housing.length - 1]);

}



/**
 * Initialize the game
 */
window.onload = function init() {
    FileIO.openfs();
    if(!document.hidden){
        Music.play();
    }
};

/**
* Manages the opening and closing of menus
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
        Display.drawGraph('line', 'morale', moraleInput, true);
        document.getElementById('tossMorale').innerHTML = (Conf.tossMorale[Conf.tossMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('hipMorale').innerHTML = (Conf.hipMorale[Conf.hipMorale.length - 1] / 10).toFixed(1) + '%';
        document.getElementById('artMorale').innerHTML = (Conf.artMorale[Conf.artMorale.length - 1] / 10).toFixed(1) + '%';
        var moraleAverage = ((Conf.tossMorale[Conf.tossMorale.length - 1] + Conf.hipMorale[Conf.hipMorale.length - 1] + Conf.artMorale[Conf.artMorale.length - 1]) / 3);
        document.getElementById('moraleAverage').innerHTML = (moraleAverage / 10).toFixed(1) + '%';

        var popInput = [[Conf.tossPop, electricBlue, TRANS.tosser],[Conf.hipPop, green, TRANS.hipstie],[Conf.artPop, orange, TRANS.artie],[Conf.pop, white, TRANS.population]];
        Display.drawGraph('line', 'population', popInput, true);
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
        Display.drawGraph('bar', 'demographics', demoInput);

        var sdfInput = [[Conf.housing, electricBlue, TRANS.housing],[Conf.sdf, red, TRANS.sdf]];
        Display.drawGraph('pie', 'homeless', sdfInput);
        document.getElementById('housingVal').innerHTML = Conf.housing[Conf.housing.length - 1];
        document.getElementById('homelessVal').innerHTML = Conf.sdf[Conf.sdf.length - 1];

        var employedInput = [[[Conf.employed[Conf.employed.length - 1]], electricBlue, TRANS.employed],[[Conf.pop[Conf.pop.length - 1] - Conf.employed[Conf.employed.length - 1]], red, TRANS.unemployed]];
        Display.drawGraph('pie', 'employment', employedInput);
        document.getElementById('employmentVal').innerHTML = Conf.pop[Conf.pop.length - 1] - Conf.employed[Conf.employed.length - 1];

        var crimeInput = [[Conf.crime, red, TRANS.crime]];
        Display.drawGraph('line', 'crime', crimeInput, true);
        document.getElementById('crimeVal').innerHTML = Conf.crime[Conf.crime.length - 1];

        var energyInput = [[Conf.energy, electricBlue, TRANS.energy]];
        Display.drawGraph('line', 'energy', energyInput, true);
        document.getElementById('energyVal').innerHTML = Conf.energy[Conf.energy.length - 1];

        var airInUse = Math.floor((Conf.tossPop[Conf.tossPop.length - 1] + Conf.hipPop[Conf.hipPop.length - 1])/10);
        var freeAir = Conf.air[Conf.air.length - 1] - airInUse;
        if(freeAir < 0){
            freeAir = 0;
        }
        var airInput = [
            [[airInUse], grey, TRANS.airInUse],
            [[freeAir], electricBlue, TRANS.airAvailable]];
        Display.drawGraph('pie', 'air', airInput);
        document.getElementById('airVal').innerHTML = Conf.air[Conf.air.length - 1];

        var foodInput = [[Conf.food, green, TRANS.food]];
        Display.drawGraph('line', 'food', foodInput, true);
        document.getElementById('foodVal').innerHTML = Conf.food[Conf.food.length - 1];

        var freeStorage = Conf.storageCap[Conf.storageCap.length - 1] - Conf.inStorage[Conf.inStorage.length - 1];
        var storageInput = [
            [[freeStorage], electricBlue, TRANS.freeStorage],
            [[Conf.inStorage[Conf.inStorage.length -1] - Conf.food[Conf.food.length - 1]], brown, TRANS.resourceStorage],
            [[Conf.food[Conf.food.length - 1]], green, TRANS.food]];
        Display.drawGraph('pie', 'storage', storageInput);
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
    CneTools.checkRobots();
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
* Once a right click menu has been created, returns the HTML fragment to to be appended
* @param {string} content Html content to put into the right click menu
* @returns {Object} Document Fragment to append
*/
function contextContent(content) {
    var y = Conf.retY - Math.round(Conf.yLimit / 2) + CneTools.getTile('y');
    var x = Conf.retX - Math.round(Conf.xLimit / 2) + CneTools.getTile('x');
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
 * Given a building ID, will return the kind, and vice versa
 * @param {(string|int)} reference The menu item id that was clicked, or its kind
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