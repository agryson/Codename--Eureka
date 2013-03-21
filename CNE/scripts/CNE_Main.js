/*jslint node: true */
"use strict"; //this will break everything if there's any errors... that's a good thing
var Game; //Global so I can get at it from other scripts...
var Lang;

//Nice map: 1363032002367
//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/

function Construction() {
    /*
    Notes: I got rid of food because why would one building use more than another?! So it should become a global variable.
    Think about making tile[x][y][0] the terrain and tile[x][y][1] the construction
     */
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

    this.future = [3, Lang.prepared];
    this.robot = -1;
    this.mining = false;
    this.vital = false;
    this.shutdown = false;
    this.resourcesNeeded = [false]; //[[resource needed, amount needed]]
    this.researchTopic = 'noResearch';
}

function nextTurn(x, y, level) {
    var tile = returnLevel(level)[y][x][1];

    var checkMine = function(xIn, yIn, levelIn) {
        for(var i = 0; i < 6; i++) {
            if(returnLevel(levelIn)[adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]][1] && returnLevel(levelIn)[adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]][1].kind === 221 && !returnLevel(levelIn)[adjacent(xIn, yIn, i)[0]][adjacent(xIn, yIn, i)[1]][1].shutdown) {
                return true;
            }
        }
        return false;
    };
    var requisition = function(){
        var resourceCheck = false;
        var count = 1;
        //console.log('resource length is ' + tile.resourcesNeeded.length + 'while the array is ' + tile.resourcesNeeded);
        for(var j = 1; j < tile.resourcesNeeded.length; j++){
            if(tile.resourcesNeeded[0] && Game.procOres[tile.resourcesNeeded[j][0]] >= tile.resourcesNeeded[j][1]){
                count += 1;
            }
        }
        if(count === tile.resourcesNeeded.length){
            resourceCheck = true;
        }
        for(var k = 1; k < tile.resourcesNeeded.length; k++){
            if(resourceCheck){
                tile.resourcesNeeded[0] = false;
                Game.procOres[tile.resourcesNeeded[k][0]] -= tile.resourcesNeeded[k][1];
            }
        }
        if(!tile.resourcesNeeded[0]){
            resourceCheck = true;
        }
        return resourceCheck;
    };

    if(tile) {

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
                Game.tossPop[Game.tossPop.length - 1] += tile.tossPop;
                Game.hipPop[Game.hipPop.length - 1] += tile.hipPop;
                Game.artPop[Game.artPop.length - 1] += tile.artPop;
                Game.housing[Game.housing.length - 1] += tile.housing;
                Game.tossMorale[Game.tossMorale.length - 1] += tile.tossMorale;
                Game.hipMorale[Game.hipMorale.length - 1] += tile.hipMorale;
                Game.artMorale[Game.artMorale.length - 1] += tile.artMorale;
                Game.crime[Game.crime.length - 1] += tile.crime;
                //Game.storage[Game.storage.length - 1] += tile.storage;
                //Game.energy[Game.energy.length - 1] += tile.energy;
                Game.food[Game.food.length - 1] += tile.food;
            } else if(Game.energy[Game.energy.length - 1] <= 10 && !tile.vital) {
                //Otherwise shutdown for a turn
                Game.energy[Game.energy.length - 1] -= tile.energy;
                tile.shutdown = true;
                Game.blackout = 1;
            }
        }

        //BUILDING
        if(tile.buildTime > 0) {
            if(requisition()){
                tile.buildTime -= 1;
            } else {
                var shortage = Lang.resourceShortage;
                var rec = [Lang.aluminium, Lang.calcium, Lang.copper, Lang.gold, Lang.iron, Lang.lead, Lang.magnesium, Lang.mercury, Lang.phosphorous, Lang.potassium, Lang.silver, Lang.sodium, Lang.tin, Lang.zinc];
                for(var s = 1; s < tile.resourcesNeeded.length; s++){
                    if(Game.procOres[tile.resourcesNeeded[s][0]] < tile.resourcesNeeded[s][1]){
                        shortage += rec[tile.resourcesNeeded[s][0]] + ", ";
                    }
                }
                notify(shortage.substring(0,shortage.length - 2));
            }
        } else if(tile.buildTime === 0) {
            tile.buildTime = -1;
            returnLevel(level)[y][x][0].ref = changeName(tile.future[1], returnLevel(level)[y][x][0].ref);
            tile.exists = true;
            Game.storage[Game.storage.length - 1] += tile.storage;
            Game.energy[Game.energy.length - 1] += tile.energy;
            if(tile.robot >= 0) {
                Game.robotsList[tile.robot][0] -= 1;
                tile.robot = -1;
            }
            if((tile.kind === 101 && tile.future[0] === 204) || (tile.kind === 102 && tile.future[0] === 221)) {
                returnLevel(level)[y][x][1] = bobTheBuilder(tile.future[0], x, y, level, false);
            } else {
                tile.kind = tile.future[0];
                nextTurn(x, y, level);
            }
            if(tile.kind === 227 || tile.kind === 228){
                Game.researchLabs.push([x, y, level, tile.researchTopic]);
            }
            if(tile.kind >= 208 && tile.kind <= 210){
                Game.commTowers.push([x, y]);
            }
        }

        //MINING
        //TODO the mine itself is not taking any ore...
        if(tile.mining && (tile.kind === 221 || checkMine(x, y, level))) {
            var stillMining = false;
            for(var ore = 0; ore < returnLevel(level)[y][x][0].resources.length; ore++) {
                if(returnLevel(level)[y][x][0].resources[ore] && returnLevel(level)[y][x][0].resources[ore] > 0) {
                    stillMining = true;
                    var mined = Math.floor(Math.random() + 0.5);
                    if(Game.storage[Game.storage.length - 1] >= mined) {
                        console.log('hi ho hi ho');
                        returnLevel(level)[y][x][0].resources[ore] -= mined;
                        Game.storage[Game.storage.length - 1] -= mined;
                        Game.ores[ore] ? Game.ores[ore] += mined : Game.ores[ore] = mined;
                    }
                }
            }
            if(!stillMining) {
                tile.mining = false;
                returnLevel(level)[y][x][0].ref = changeName(Lang.minedOut, returnLevel(level)[y][x][0].ref);
            }
        }

        //Research
        if(tile.researchTopic !== 'noResearch'){
            var labRef = researchTopicRef(tile.researchTopic);
            var topic = tile.researchTopic;
            if(labRef[5] > 1){
                labRef[5] -= 1;
            } else {
                labRef[5] = 0;
                for(var r = 0; r < Game.researchLabs.length; r++){
                    var lab = Game.researchLabs[r];
                    if(lab[3] === topic){
                        returnLevel(lab[2])[lab[1]][lab[0]][1].researchTopic = 'noResearch';
                        lab[3] = 'noResearch';
                    }
                }
                var unlock = researchTopicRef(topic);
                for(var u = 0; u < unlock[4].length; u++){
                    unlock[4][u][2] = true;
                }
            }
        }

        //Processing
        if(tile.kind === 223 && !tile.shutdown) {
            //create a list of ores ready for processing
            var available = [];
            var count = 0;
            for(var check = 0; check < Game.ores.length; check++) {
                if(Game.ores[check] && Game.ores[check] > 0) {
                    available.push(check);
                    count += Game.ores[check];
                }
            }
            //go through it, moving a tonne from ore to processed
            if(count > 3) {
                count = 3;
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
    if(returnLevel(level)[y][x][0].kind !== 4) {
        var o = new Construction();
        o.kind = 100;
        o.position = [level, x, y];
        if(kind >= 200 && kind < 300) {
            returnLevel(level)[y][x][0].ref = changeName(Lang.building + Game.buildings[kind - 200][3], returnLevel(level)[y][x][0].ref);
        }

        var eta = function(turns) {
                if(returnLevel(level)[y][x][0].kind === 1 || returnLevel(level)[y][x][0].kind === 6) {
                    return Math.floor(turns * 1.5);
                } else if(returnLevel(level)[y][x][0].kind === 2 || returnLevel(level)[y][x][0].kind === 7) {
                    return Math.floor(turns * 2.4);
                } else {
                    return turns;
                }
            };

        switch(kind) {
            //Bots
        case 100:
            o.vital = true;
            o.buildTime = eta(2);
            o.future = [3, Lang.prepared];
            returnLevel(level)[y][x][0].ref = changeName(Lang.preparing, returnLevel(level)[y][x][0].ref);
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
            returnLevel(level)[y][x][0].ref = changeName(Lang.digging, returnLevel(level)[y][x][0].ref);
            o.robot = 1;
            Game.robotsList[1][0] += 1;
            reCount('digger');
            break;
        case 101101:
            o.vital = true;
            o.kind = 8;
            o.buildTime = eta(3);
            o.future = [returnLevel(level)[y][x][0].kind - 5, Lang.cavern];
            returnLevel(level)[y][x][0].kind -= 5;
            returnLevel(level)[y][x][0].ref = changeName(Lang.diggingCavern, returnLevel(level)[y][x][0].ref);
            reCount('cavernDigger');
            break;

        case 102:
            o.vital = true;
            o.kind = kind;
            o.buildTime = eta(3);
            if(builderBot) {
                o.future = [221, Lang.building];
            }
            returnLevel(level)[y][x][0].ref = changeName(Lang.mining, returnLevel(level)[y][x][0].ref);
            o.mining = true;
            o.robot = 3;
            Game.robotsList[3][0] += 1;
            reCount('miner');
            break;
        case 102102:
            o.vital = true;
            o.buildTime = 2;
            o.kind = returnLevel(level)[y][x][0].kind;
            if(returnLevel(level)[y][x][0].kind > 8 || builderBot) {
                if(builderBot) {
                    o.future = [221, Lang.building];
                } else {
                    o.future = [o.kind, Lang.mining];
                }
                returnLevel(level)[y][x][0].ref = changeName(Lang.mining, returnLevel(level)[y][x][0].ref);
                o.mining = true;
            } else if(level > 0) {
                o.future = [returnLevel(level)[y][x][0].kind - 5, Lang.cavern];
                returnLevel(level)[y][x][0].kind -= 5;
            }
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
            o.food = 15;
            o.crime = 2;
            o.waste = 2;
            o.storage = 15;
            o.future = [kind, Lang.agri];
            o.resourcesNeeded = [true,[0,2],[1,1],[4,1],[9, 1]];
            break;
        case 201:
            //advanced agridome
            o.buildTime = eta(3);
            o.health = 90;
            o.energy = -25;
            o.tossMorale = 2;
            o.hipMorale = 4;
            o.artMorale = 1;
            o.food = 30;
            o.crime = 1;
            o.waste = 1;
            o.storage = 20;
            o.future = [kind, Lang.agri2];
            o.resourcesNeeded = [true,[0,1],[1,1],[8,1],[9, 1]];
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
            o.air = -1;
            o.future = [kind, Lang.airport];
            o.resourcesNeeded = [true,[2,1],[4,2],[12, 1]];
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
            o.resourcesNeeded = [true,[0,2],[4,1],[12, 1],[13,1]];
            break;
        case 204:
            //airshaft
            o.vital = true;
            o.buildTime = 2;
            o.health = 50;
            o.energy = -5;
            o.storage = 1;
            o.future = [kind, Lang.airlift];
            o.resourcesNeeded = [true,[0,1]];
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
            o.resourcesNeeded = [true,[4,2],[12, 1]];
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
            o.resourcesNeeded = [true,[4,2],[12, 1]];
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
            o.resourcesNeeded = [true,[2,1],[4,2],[12, 1]];
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
            o.resourcesNeeded = [true,[0,2],[2,2],[4,1]];
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
            o.resourcesNeeded = [true,[0,2],[2,1],[12, 1],[13,1]];
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
            o.resourcesNeeded = [true,[0,2],[2,1],[4,1],[5, 1],[10,1],[12,1],[13,1]];
            break;
        case 211:
            // connector
            o.vital = true;
            o.buildTime = eta(1);
            o.health = 20;
            o.energy = -1;
            o.storage = 1;
            o.future = [kind, Lang.connector];
            o.resourcesNeeded = [true,[4,1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[4,1],[5, 1],[6,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
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
            o.resourcesNeeded = [true,[0,1],[2,2],[4,2],[5, 3],[7,1],[11,2],[12,1],[13,1]];
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
            o.resourcesNeeded = [true,[0,2],[2,2],[3,1],[4, 1],[5,1],[7,1],[10,1],[11,1],[12,1],[13,1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[4,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[4,1]];
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
            o.resourcesNeeded = [true,[2,1],[4,1],[5, 1],[12,1]];
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
            o.resourcesNeeded = [true,[2,1],[3,1],[4,1],[5,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[5,1],[10,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[4,1],[5,2],[6,1],[10,1],[11,1],[12, 1],[13,1]];
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
            o.resourcesNeeded = [true,[4,1]];
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
            o.resourcesNeeded = [true,[0,1],[1,1],[2,1],[4,1],[6,1],[10,1],[11,1],[12, 1],[13,1]];
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
            o.resourcesNeeded = [true,[2,1],[4,2]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
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
            o.resourcesNeeded = [true,[2,1],[4,1],[8,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,1],[1, 1],[2,2],[3,1],[4,1],[5,1],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
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
            o.resourcesNeeded = [true,[0,1],[2,2],[3,2],[4,1],[5,2],[6,1],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[7,1],[8,1],[13, 1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[3,1],[4,1],[7,1],[10,1],[12, 1]];
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
            o.resourcesNeeded = [true,[0,4],[1, 1],[2,3],[3,2],[4,3],[5,2],[6,2],[7,1],[8,1],[9,1],[10,1],[11,2],[12,2],[13,2]];
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
            o.storage = 2000;
            o.future = [kind, Lang.store];
            o.resourcesNeeded = [true,[4,1]];
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
            o.resourcesNeeded = [true,[0,1],[1,2],[2,1],[4,1],[6,1],[7,1],[9,1],[10,1],[11,1]];
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
            o.resourcesNeeded = [true,[0,1],[4,1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[4,1],[5,1]];
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
            o.resourcesNeeded = [true,[0,1],[2,1],[4,2],[5,1],[12, 1]];
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
            o.resourcesNeeded = [false];
            returnLevel(level)[y][x][0].ref = changeName(Lang.lander, returnLevel(level)[y][x][0].ref);
            break;
        default:
            console.log("Bob can't build it... :( " + kind);
            return false;
        }
        return o;
    } else {
        notify(Lang.onWater);
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

//GENERAL SETUP AND TOOLS**********************************************************************************************
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

    this.clickedOn = 'none';
    this.level = 0;
    this.tileHighlight = new Image();
    this.tileHighlight.src = 'images/tools.png';
    this.spritesheet = new Image();
    this.spritesheet.src = 'images/spritesheet.png';
    /*
    this.drones = new Image();
    this.drones.src = 'images/drones.png';
    this.constructions = new Image();
    this.constructions.src = 'images/buildings.png';
    this.terrain = new Image();
    this.terrain.src = 'images/terrain.png';
    */

    this.music = new Audio('sound/spacial_winds_ambient_electronic.mp3');
    this.musicOn = false;
    /*
    this.mouseX;
    this.mouseY;
    */
    //General game stuff
    this.turnNum = document.getElementById('turnNumber');
    this.turn = 0;
    this.map = [];
    this.map1 = [];
    this.map2 = [];
    this.map3 = [];
    this.map4 = [];
    //I <3  Sublime Text 2's multiple cursors!!!
    /**
     * [[string: 'id of menu option', boolean: available to player?, int: surface(0)/subsurface(1)/both(2)]]
     * @type {Array}
     */
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
        ["recycler", false, 0, Lang.recycler],
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

    //[[x,y,level,topic]]
    this.researchLabs = [];
    this.currentResearch = 'engineering';
    //[idString, langString, availableBool, preReqsArray, subTopicsArray, turnsToComplete];
    this.researchTopics = [
        ["engineering", Lang.engineering, true, [], [
            ["agriculturalEngineering", Lang.agriculturalEngineering, false, [], [
                ["hydroponics", Lang.hydroponics, false, [], [], 5, 5],
                ["noSoilFarming", Lang.noSoilFarming, false, [], [], 5, 5],
                ["xtremeTempAgriculture", Lang.xtremeTempAgriculture, false, [], [], 5, 5]
            ], 5, 5],
            ["electricalEngineering", Lang.electricalEngineering, false, [], [
                ["commTech", Lang.commTech, false, [], [], 5, 5],
                ["pcbDesign", Lang.pcbDesign, false, [], [], 5, 5],
                ["processors", Lang.processors, false, [], [], 5, 5],
                ["robotics", Lang.robotics, false, [], [], 5, 5]
            ], 5, 5],
            ["geneticEngineering", Lang.geneticEngineering, false, [], [
                ["animalGenetics", Lang.animalGenetics, false, [], [], 5, 5],
                ["horticulturalGenetics", Lang.horticulturalGenetics, false, [], [], 5, 5],
                ["humanGenetics", Lang.humanGenetics, false, [], [], 5, 5],
                ["longevityResearch", Lang.longevityResearch, false, [], [], 5, 5]
            ], 5, 5],
            ["mechanicalEngineering", Lang.mechanicalEngineering, false, [], [
                ["massProduction", Lang.massProduction, false, [], [], 5, 5],
                ["mechatronics", Lang.mechatronics, false, [], [], 5, 5],
                ["plm", Lang.plm, false, [], [], 5, 5]
            ], 5, 5],
            ["softwareEngineering", Lang.softwareEngineering, false, [], [
                ["ai", Lang.ai, false, [], [
                    ["culturalSensitivity", Lang.culturalSensitivity, false, [], [], 5, 5],
                    ["imageProcessing", Lang.imageProcessing, false, [], [], 5, 5],
                    ["naturalLanguage", Lang.naturalLanguage, false, [], [], 5, 5],
                    ["neuralNetworks", Lang.neuralNetworks, false, [], [], 5, 5]
                ], 5, 5]
            ], 5, 5],
            ["geoEngineering", Lang.geoEngineering, false, [], [
                ["terraforming", Lang.terraforming, false, [], [], 5, 5],
                ["weatherControl", Lang.weatherControl, false, [], [], 5, 5]
            ], 5, 5]
        ], 5, 5],
        ["science", Lang.science, true, [], [
            ["physics", Lang.physics, false, [], [
                ["experimentalPhysics", Lang.experimentalPhysics, false, [], [], 5, 5],
                ["advancedMaterials", Lang.advancedMaterials, false, [], [
                    ["compositieMaterials", Lang.compositieMaterials, false, [], [], 5, 5],
                    ["selfHealingMaterials", Lang.selfHealingMaterials, false, [], [], 5, 5],
                    ["conductivePolymers", Lang.conductivePolymers, false, [], [], 5, 5],
                    ["opticalMaterials", Lang.opticalMaterials, false, [], [], 5, 5]
                ], 5, 5],
                ["nanotech", Lang.nanotech, false, [], [
                    ["bioNeutralNano", Lang.bioNeutralNano, false, [], [], 5, 5],
                    ["ggam", Lang.ggam, false, [], [], 5, 5],
                    ["nanoFab", Lang.nanoFab, false, [], [], 5, 5]
                ], 5, 5],
                ["theoreticalPhysics", Lang.theoreticalPhysics, false, [], [], 5, 5],
                ["astronomy", Lang.astronomy, false, [], [], 5, 5],
                ["meteorology", Lang.meteorology, false, [], [], 5, 5],
                ["nuclearPhysics", Lang.nuclearPhysics, false, [], [], 5, 5]
            ], 5, 5],
            ["chemistry", Lang.chemistry, false, [], [
                ["organicChemistry", Lang.organicChemistry, false, [], [
                    ["polymers", Lang.polymers, false, [], [], 5, 5]
                ], 5, 5],
                ["physicalChemistry", Lang.physicalChemistry, false, [], [
                    ["oreProcessing", Lang.oreProcessing, false, [], [], 5, 5],
                    ["metallurgy", Lang.metallurgy, false, [], [], 5, 5]
                ], 5, 5],
                ["pharmaceuticalChemistry", Lang.pharmaceuticalChemistry, false, [], [
                    ["herbicides", Lang.herbicides, false, [], [], 5, 5],
                    ["medicines", Lang.medicines, false, [], [], 5, 5]
                ], 5, 5]
            ], 5, 5],
            ["biology", Lang.biology, false, [], [
                ["anatomy", Lang.anatomy, false, [], [], 5, 5],
                ["horticulture", Lang.horticulture, false, [], [], 5, 5],
                ["physiology", Lang.physiology, false, [], [
                    ["radiationEffects", Lang.radiationEffects, false, [], [], 5, 5],
                    ["lowGravEffects", Lang.lowGravEffects, false, [], [], 5, 5]
                ], 5, 5],
                ["medicine", Lang.medicine, false, [], [
                    ["oncology", Lang.oncology, false, [], [], 5, 5],
                    ["orthopaedics", Lang.orthopaedics, false, [], [], 5, 5],
                    ["paedeatrics", Lang.paedeatrics, false, [], [], 5, 5],
                    ["placebos", Lang.placebos, false, [], [], 5, 5],
                    ["traditional", Lang.traditional, false, [], [], 5, 5]
                ], 5, 5]
            ], 5, 5]
        ], 5, 5],
        ["arts", Lang.arts, true, [], [
            ["sociology", Lang.sociology, false, [], [
                ["socialPolicy", Lang.socialPolicy, false, [], [], 5, 5],
                ["politicalScience", Lang.politicalScience, false, [], [], 5, 5],
                ["culturalRelations", Lang.culturalRelations, false, [], [], 5, 5]
            ], 5, 5],
            ["philosophy", Lang.philosophy, false, [], [
                ["ethics", Lang.ethics, false, [], [], 5, 5],
                ["scientificTheory", Lang.scientificTheory, false, [], [], 5, 5],
                ["classicalPhilosophy", Lang.classicalPhilosophy, false, [], [], 5, 5]
            ], 5, 5]
        ], 5, 5]
    ];

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
    this.procOres = [15, 2, 10, 1, 15, 5, 1, 1, 1, 5, 1, 4, 5, 5];
    //Map generation vars
    this.seeder = '';
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
    this.tossPop = [50];
    this.hipPop = [50];
    this.artPop = [50];
    this.pop = [150];
    this.sdf = [150];
    this.tossMorale = [500];
    this.hipMorale = [500];
    this.artMorale = [500];
    this.crime = [0];
    this.storage = [0];
    this.food = [50];
    this.energy = [60];

    //modifiers
    this.blackout = 0;
}

function setStats() {
    Game.crime.push(0);
    Game.storage.push(Game.storage[Game.storage.length - 1]);
    Game.tossPop.push(Game.tossPop[Game.tossPop.length - 1]);
    Game.hipPop.push(Game.hipPop[Game.hipPop.length - 1]);
    Game.artPop.push(Game.artPop[Game.artPop.length - 1]);
    Game.pop.push((Math.floor(Game.tossPop[Game.tossPop.length - 1]) + Math.floor(Game.hipPop[Game.hipPop.length - 1]) + Math.floor(Game.artPop[Game.artPop.length - 1])));
    Game.sdf.push(Game.pop[Game.pop.length - 1] - Math.floor(Game.housing[Game.housing.length - 1]));
    Game.housing.push(0);
    Game.food.push(Game.food[Game.food.length - 1] - Math.floor((Game.tossPop[Game.tossPop.length - 1] + Game.hipPop[Game.hipPop.length - 1]) / 15));
    Game.energy.push(Game.energy[Game.energy.length - 1]);
    Game.turn += 1;
    //Morale
    Game.tossMorale.push(Game.tossMorale[Game.tossMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 3) + Math.floor(Game.food[Game.food.length - 1]) - Game.blackout * 10);
    Game.hipMorale.push(Game.hipMorale[Game.hipMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 3) + Math.floor(Game.food[Game.food.length - 1]) - Game.blackout * 10);
    Game.artMorale.push(Game.artMorale[Game.artMorale.length - 1] - Math.floor(Game.sdf[Game.sdf.length - 1] / 5) - Game.blackout * 20);

    //reset modifiers
    Game.blackout = 0;
}

function saneStats(){
    if(Game.crime[Game.crime.length - 1] < 0){
        Game.crime[Game.crime.length - 1] = 0;
    }
    if(Game.tossMorale[Game.tossMorale.length - 1] < 0){
        Game.tossMorale[Game.tossMorale.length - 1] = 0;
    }
    if(Game.hipMorale[Game.hipMorale.length - 1] < 0){
        Game.hipMorale[Game.hipMorale.length - 1] = 0;
    }
    if(Game.artMorale[Game.artMorale.length - 1] < 0){
        Game.artMorale[Game.artMorale.length - 1] = 0;
    }
    if(Game.food[Game.food.length - 1] < 0){
        Game.food[Game.food.length - 1] = 0;
    }
}

function drawGraph(outputId, sourceData, colour, maxi, mini, gradation) {
    var can = document.getElementById(outputId);
    var con = document.getElementById(outputId).getContext('2d');
    var canW = parseInt(can.width, 10);
    var canH = parseInt(can.height, 10);

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

    var normal = function(val, arr) {
            var out = (arr[val] - mini) / (maxi - mini);
            return out * canH;
        };


    var sepX = Math.round(canW / sourceData.length);
    var sepY = Math.round(canH / sourceData[max(sourceData)]);

    //Lines
    con.beginPath();
    con.lineWidth = 2;
    con.lineCap = 'round';
    con.lineJoin = 'round';
    con.strokeStyle = colour;
    con.moveTo(0, canH - normal(0, sourceData));
    for(var k = 1; k < sourceData.length; k++) {
        con.lineTo(k * sepX, canH - normal(k, sourceData));
    }
    con.stroke();
    if(gradation) {
        //Our marks
        con.strokeStyle = 'rgba(255,255,255,0.02)';
        con.lineWidth = 1;
        con.lineCap = 'butt';
        con.moveTo(5, Math.floor(canH - normal(0, [0])));
        con.lineTo(canW - 5, Math.floor(canH - normal(0, [0])));
        con.strokeStyle = 'rgba(255,255,255,0.08)';
        for(var grad = 0; grad <= 10; grad++) {
            con.moveTo(5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)])));
            con.lineTo(canW - 5, Math.floor(canH - normal(0, [maxi - maxi * (grad / 10)])));
        }
        con.stroke();
        //Our Scale
        con.fillStyle = '#D9F7FF';
        con.font = "14px Arial";
        con.fillText(maxi, 5, 12);
        con.fillText(mini + (maxi - mini)/2, 5, 110);
        con.fillText(mini, 5, 215);
    }
}

/**
 * Initialize the game
 */

window.onload = function init() {
    Lang = new Lang();
    eavesdrop();
};

function eavesdrop() {
    //Start Screen
    document.getElementById('login').onclick = function() {
        Game = new Param(); //TODO: Should add save and load game code here...
        checkBuildings();
        reCount('all');
        getSeed(false);
    };
    document.getElementById('newSession').onclick = function() {
        Game = new Param(); //TODO: Should add save and load game code here...
        checkBuildings();
        reCount('all');
        getSeed(true);
    };
    //!Start Screen
    //Sound
    //TODO: change this to a more standardized box
    var radioCheck = document.getElementById('musicOptionViz');
    radioCheck.onclick = function() {
        radioCheck.classList.toggle('checkbox_checked');
        if(!Game.musicOn) {
            Game.musicOn = true;
            music();
        } else {
            Game.musicOn = false;
            music();
        }
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
                var yTemp = Game.retY - Math.round(Game.yLimit / 2) + getTile('y') + 2;
                var xTemp = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
                Game.retY = yTemp;
                Game.retX = xTemp;
            };
        if(event.wheelDelta > 0 && val < zoomMax) {
            console.log(blocked);
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
        Game.highlight = false;
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
    };
    window.oncontextmenu = function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
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
    }

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

    //Left Menu
    var leftMenu = document.getElementById('menuWrap');
    leftMenu.onmouseover = function() {
        leftMenu.classList.remove('left_menu_hide');
        leftMenu.classList.add('left_menu_show');
        leftMenu.classList.add('menu_visible');
        leftMenu.classList.remove('menu_hidden');
    };
    leftMenu.onmouseout = function() {
        leftMenu.classList.remove('left_menu_show');
        leftMenu.classList.add('left_menu_hide');
        leftMenu.classList.remove('menu_visible');
        leftMenu.classList.add('menu_hidden');
    };
    //!Left Menu
    //Executive Drop-Down Menu
    var exec = document.getElementById('execDropDown');
    var execDrop = document.getElementById('execDropDownContainer');
    var execBtnContainer = document.getElementById('execBtnContainer');
    var execButton = document.getElementById('execButton');
    execBtnContainer.onclick = function() {
        menu(exec, execButton, 'exec_hidden');
    };
    exec.onmouseout = function() {
        if(execButton.classList.contains('arrow_down')) {
            exec.classList.remove('menu_visible');
            exec.classList.add('menu_hidden');
        } else {
            exec.classList.remove('menu_hidden');
            exec.classList.add('menu_visible');
        }
    };
    exec.onmouseover = function() {
        if(execButton.classList.contains('arrow_down')) {
            exec.classList.add('menu_visible');
            exec.classList.remove('menu_hidden');
        }
        Game.highlight = false;
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

    var menu = function(containerIn, buttonIn, hideClass) {
            var container = containerIn;
            var button = buttonIn;
            if(button.classList.contains('arrow_down')) {
                container.classList.add('menu_visible');
                container.classList.remove('menu_hidden');
            } else {
                container.classList.remove('menu_visible');
                container.classList.add('menu_hidden');
            }
            container.classList.toggle(hideClass);
            button.classList.toggle('arrow_down');
            button.classList.toggle('arrow_up');

        };
    document.getElementById('turn').onclick = function() {
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
                notify(Lang.noPower);
                Game.blackout = 30;
            }
            saneStats();
            execReview();
            document.getElementById('researchPanel').innerHTML = fillResearchPanel(Game.currentResearch);

            drawRadar();
            Game.turnNum.innerHTML = "Week: " + Game.turn;
            reCount('all');
            //The following hold code just prevents accidentally skipping two turns with accidental clicks...
            document.getElementById('turn').disabled = true;
            setTimeout(function() {
                document.getElementById('turn').disabled = false;
            }, 300);
        } else {
            notify(Lang.setDown);
        }
    };
    document.getElementById('zoom').onchange = function() {
        var zoomLevel = document.getElementById('zoom').value;
        zoom(zoomLevel);
    };
}

function music() {
    Game.musicOn ? Game.music.play() : Game.music.pause();
}

function zoom(zoomLevel) {
    Game.destinationWidth = zoomLevel * 6 * 6;
    Game.destinationHeight = zoomLevel * 7 * 6;
    mapFit();
}

function getMaxMin(arrayIn){
    var max = 0;
    var min = 1000;
    for(var i = 0; i < arrayIn.length; i++){
        for(var j = 0; j < arrayIn[i].length; j++){
            if(arrayIn[i][j] > max){
                max = arrayIn[i][j];
            }
            if(arrayIn[i][j] < min){
                min = arrayIn[i][j];
            }
        }
    }
    max = Math.ceil(1 + max/50) * 50;
    min = Math.floor(min/50) * 50;
    return [max, min];
}

function fillResearchMenu(){
    //Tier0
    for(var i = 0; i < Game.researchTopics.length; i++){
        if(Game.researchTopics[i][2]){
            var tier0 = document.getElementById(Game.researchTopics[i][0]);
            if(!tier0.classList.contains('research_active')){
                tier0.classList.add('research_active');
                tier0.innerHTML = Game.researchTopics[i][1];
                tier0.onclick = clickedResearch;
            }
            //Tier1
            for(var j = 0; j < Game.researchTopics[i][4].length; j++){
                if(Game.researchTopics[i][4][j][2]){
                    var tier1 = document.getElementById(Game.researchTopics[i][4][j][0]);
                    if(!tier1.classList.contains('research_active')){
                        tier1.classList.add('research_active');
                        tier1.innerHTML = Game.researchTopics[i][4][j][1];
                        tier1.onclick = clickedResearch;
                    }
                    //Tier2
                    for(var k = 0; k < Game.researchTopics[i][4][j][4].length; k++){
                        if(Game.researchTopics[i][4][j][4][k][2]){
                            var tier2 = document.getElementById(Game.researchTopics[i][4][j][4][k][0]);
                            if(!tier2.classList.contains('research_active')){
                                tier2.classList.add('research_active');
                                tier2.innerHTML = Game.researchTopics[i][4][j][4][k][1];
                                tier2.onclick = clickedResearch;
                            }
                            //Tier3
                            for(var l = 0; l < Game.researchTopics[i][4][j][4][k][4].length; l++){
                                if(Game.researchTopics[i][4][j][4][k][4][l][2]){
                                    var tier3 = document.getElementById(Game.researchTopics[i][4][j][4][k][4][l][0]);
                                    if(!tier3.classList.contains('research_active')){
                                        //tier3.classList.add('research_active');
                                        tier3.innerHTML = Game.researchTopics[i][4][j][4][k][4][l][1];
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
    if(document.getElementById(ident + 'Cont')){
        document.getElementById(ident + 'Cont').classList.toggle('research_cont_hidden');
    }
    document.getElementById('researchPanel').innerHTML = fillResearchPanel(ident);
    fillResearchMenu();
}

function fillResearchPanel(ident){
    Game.currentResearch = ident;
    var htmlString = '';
    if(researchTopicRef(ident)[5] !== 0){
        htmlString += "<div class='research_bar_frame'><div class='research_bar' style='width: " + researchProgress(ident) + "%'></div></div>";
        htmlString += researchProgress(ident) + "% " + Lang.researched + "<br>";
    } else {
        htmlString += "100% " + Lang.researched + "<br>";
    }
    htmlString += '<img src="images/researchIllustrations/' + ident + '.png" />';
    htmlString += Lang[ident + "Content"];
    var inProgress = true;
    if(Game.researchLabs.length > 0){
        for(var i = 0; i < Game.researchLabs.length; i++){
            var lab = Game.researchLabs[i];
            if(lab[3] === ident){
                if(inProgress){
                    htmlString += "<br><p>" + Lang.studyingThis + " " + Lang[lab[3]] + ":</p><br>";
                    inProgress = false;
                }
                console.log( + lab[0] + "," + lab[1] + "," + lab[2]);
                htmlString += "<div class='research_panel_item' onclick='jump(true," + lab[0] + "," + lab[1] + "," + lab[2] + ")'><img src='images/researchIllustrations/" + lab[3] + ".png' />";
                htmlString += "<p>" + returnLevel(lab[2])[lab[1]][lab[0]][0].ref + "</p>";
                htmlString += "<div class='research_bar_frame' style='width: 400px; margin-left: 100px'><div class='research_bar' style='width: " + researchProgress(ident) + "%''></div></div>";
                htmlString += "</div>";
            }
        }
        if(researchTopicRef(ident)[5] !== 0){
            htmlString += '<button id="' + ident + 'Button" class="main_pointer smoky_glass" onclick="startResearch(' + ident + ')">Research</button>';
        }
    }
    return htmlString;
}

function researchProgress(ident){
    var ref = researchTopicRef(ident);
    var progress = ref[6] - ref[5];
    if(progress !== 0){
        progress = progress / ref[6];
    } else {
        return 0;
    }
    progress = progress * 100;
    progress -= progress%10;
    return progress;
}

function startResearch(ident){
    ident = ident.id;
    var htmlString = '';
    htmlString += "<h1>" + Lang.availableLabs + "</h1>";
    htmlString += Lang.chooseLab + " " + Lang[ident];
    for (var i = 0; i < Game.researchLabs.length; i++){
        var lab = Game.researchLabs[i];
        returnLevel(lab[2])[lab[1]][lab[0]][1].researchTopic = lab[3];
        htmlString += "<div class='research_panel_item' onclick='setResearchTopic(" + ident + "," + i + ")'><img src='images/researchIllustrations/" + lab[3] + ".png' />" + returnLevel(lab[2])[lab[1]][lab[0]][0].ref + "<br>";
        htmlString += Lang.currentResearch + " " + Lang[lab[3]];
        htmlString += "<div class='research_bar_frame' style='width: 400px; margin-left: 100px'><div class='research_bar' style='width: " + researchProgress(ident) + "%''></div></div>";
        htmlString += "</div>";
    }
    document.getElementById('researchPanel').innerHTML = htmlString;
}

function setResearchTopic(ident, i){
    Game.researchLabs[i][3] = ident.id;
    startResearch(ident);
}

function researchTopicRef(topic){
    for(var i = 0; i < Game.researchTopics.length; i++){
        if(Game.researchTopics[i][0] === topic){
            return Game.researchTopics[i];
        } else {
            for(var j = 0; j < Game.researchTopics[i][4].length; j++){
                if(Game.researchTopics[i][4][j][0] === topic){
                    return Game.researchTopics[i][4][j];
                } else {
                    for(var k = 0; k < Game.researchTopics[i][4][j][4].length; k++){
                        if(Game.researchTopics[i][4][j][4][k][0] === topic){
                            return Game.researchTopics[i][4][j][4][k];
                        } else {
                            for(var l = 0; l < Game.researchTopics[i][4][j][4][k][4].length; l++){
                                if(Game.researchTopics[i][4][j][4][k][4][l][0] === topic){
                                    return Game.researchTopics[i][4][j][4][k][4][l];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function execReview() {
    var sanity = function(val) {
            var test;
            val >= 0 ? test = val : test = 0;
            return test;
        };

    if(!Game.buildings[37][1]) {
        document.getElementById('morale').getContext('2d').clearRect(0, 0, 325, 220);
        var moraleLimits = getMaxMin([Game.tossMorale, Game.hipMorale, Game.artMorale]);
        drawGraph('morale', Game.tossMorale, '#1E90FF', moraleLimits[0], moraleLimits[1], false);
        drawGraph('morale', Game.hipMorale, '#00FA9A', moraleLimits[0], moraleLimits[1], false);
        drawGraph('morale', Game.artMorale, '#FF4500', moraleLimits[0], moraleLimits[1], true);
        document.getElementById('tossMorale').innerHTML = Game.tossMorale[Game.tossMorale.length - 1];
        document.getElementById('hipMorale').innerHTML = Game.hipMorale[Game.hipMorale.length - 1];
        document.getElementById('artMorale').innerHTML = Game.artMorale[Game.artMorale.length - 1];
        document.getElementById('moraleAverage').innerHTML = Math.round((Game.tossMorale[Game.artMorale.length - 1] + Game.hipMorale[Game.hipMorale.length - 1] + Game.tossMorale[Game.artMorale.length - 1]) / 3);

        document.getElementById('population').getContext('2d').clearRect(0, 0, 325, 220);
        var popLimits = getMaxMin([Game.tossPop, Game.hipPop, Game.artPop, Game.pop]);
        drawGraph('population', Game.tossPop, '#1E90FF', popLimits[0], 0, false);
        drawGraph('population', Game.hipPop, '#00FA9A', popLimits[0], 0, false);
        drawGraph('population', Game.artPop, '#FF4500', popLimits[0], 0, false);
        drawGraph('population', Game.pop, '#DCDCDC', popLimits[0], 0, true);
        document.getElementById('tossPop').innerHTML = Math.floor(Game.tossPop[Game.tossPop.length - 1]);
        document.getElementById('hipPop').innerHTML = Math.floor(Game.hipPop[Game.hipPop.length - 1]);
        document.getElementById('artPop').innerHTML = Math.floor(Game.tossPop[Game.artPop.length - 1]);
        document.getElementById('popExecTotal').innerHTML = Game.pop[Game.pop.length - 1];

        document.getElementById('homeless').getContext('2d').clearRect(0, 0, 325, 220);
        var sdfLimits = getMaxMin([Game.sdf]);
        drawGraph('homeless', Game.sdf, '#A0522D', sdfLimits[0], 0, true);
        document.getElementById('housingVal').innerHTML = Game.housing[Game.housing.length - 1];
        document.getElementById('homelessVal').innerHTML = Game.sdf[Game.sdf.length - 1];

        document.getElementById('crime').getContext('2d').clearRect(0, 0, 325, 220);
        var crimeLimits = getMaxMin([Game.crime]);
        drawGraph('crime', Game.crime, '#FF0000', crimeLimits[0], 0, true);
        document.getElementById('crimeVal').innerHTML = Game.crime[Game.crime.length - 1];

        document.getElementById('energy').getContext('2d').clearRect(0, 0, 325, 220);
        var energyLimits = getMaxMin([Game.energy]);
        drawGraph('energy', Game.energy, '#00BFFF', energyLimits[0], 0, true);
        document.getElementById('energyVal').innerHTML = Game.energy[Game.energy.length - 1];

        document.getElementById('food').getContext('2d').clearRect(0, 0, 325, 220);
        var foodLimits = getMaxMin([Game.food]);
        drawGraph('food', Game.food, '#00FF7F', foodLimits[0], 0, true);
        document.getElementById('foodVal').innerHTML = Game.food[Game.food.length - 1];

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
    }

}

function mapFit(bool) {
    console.log('I\'m refitting!');
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
        if(Game.buildings[thing][1]) {
            if(elem.style.display === 'none' || elem.style.display === '') {
                elem.style.display = 'table';
            }
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
            elem.style.display = 'none';
            console.log(elem.style.display);
            if(Game.clickedOn === idString) {
                Game.clickedOn = 'none';
                document.body.style.cursor = "url('images/pointers/pointer.png'), default";
            }
        }
    }
    checkRobots();
}

function checkRobots() {
    for(var r2d2 in Game.robotsList) {
        var wallE = Game.robotsList[r2d2];
        var idString = wallE[2];
        var c3po = document.getElementById(idString);
        if(wallE[3]) {
            if(c3po.style.display !== 'table') {
                c3po.style.display = 'table';
            }
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
                document.getElementById(wallE[2]).style.background = '#000';
                if(Game.clickedOn === idString) {
                    Game.clickedOn = 'none';
                    document.body.style.cursor = "url('images/pointers/pointer.png'), default";
                }
            }
        }
    }
    //special case for digger
    if(Game.robotsList[1][1] - Game.robotsList[1][0] <= 1) {
        var rob = document.getElementById(Game.robotsList[1][2]);
        rob.classList.remove('active');
        rob.onclick = null;
        rob.style.background = '#000';
        if(Game.clickedOn === 'digger' || (Game.clickedOn === 'cavernDigger' && Game.robotsList[1][1] - Game.robotsList[1][0] === 0)) {
            Game.clickedOn = 'none';
            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        }
        if(Game.robotsList[1][1] - Game.robotsList[1][0] === 0) {
            var cavDig = document.getElementById('cavernDigger');
            cavDig.classList.remove('active');
            cavDig.onclick = null;
            cavDig.style.background = '#000';
        }
    }
}

/**
 * Provides notifications to the user
 * @param  {string} notif The notification to send
 */

function notify(notif) {
    var notification = document.getElementById('notifications');
    notification.innerHTML = notif;
    notification.style.width = 700 + 'px';
    setTimeout(

    function() {
        notification.style.width = 0;
    }, 2800);
}

/**
 * Generates a random number, from a base value from 0 to num-1
 * @param  {int} num is the modifier
 * @param  {int} min is the base value
 * @return {int}
 */

function randGen(num, min) {
    return Math.floor(Math.random() * num) + min;
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
            document.getElementById(numID).innerHTML = 'Available: ' + (Game.robotsList[index][1] - Game.robotsList[index][0]);
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
        console.log("Wait, I've lost count of the drones...");
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
    var current = e.clientY - 30;
    var total = window.innerHeight;
    var percentage = Math.round((current / total) * 100);
    if(percentage < 10) {
        percentage = 11;
        leftMenuResize(false);
    } else if(percentage > 90) {
        percentage = 89;
        leftMenuResize(false);
    }
    document.getElementById('buildingContainer').style.height = percentage + '%';
    document.getElementById('droneContainer').style.height = 96 - percentage + '%';
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

/**
 * reacts to keyboard input appropriately
 * @param  {Object} e
 */

function keypressed(e) {
    switch(e.keyCode) {
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
        document.getElementById(Game.clickedOn).style.background = '#000';
        Game.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        break;
    default:
        console.log("Uhm... that key doesn't do anything... ");
        break;
    }
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
        Game.level == 4 ? Game.level = 0 : Game.level += 1;
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
        var tileToTest = returnLevel(level)[adjacent(yxArray[1], yxArray[0], i)[0]][adjacent(yxArray[1], yxArray[0], i)[1]][0];
        if(tileToTest.kind === 4) {
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

/**
 * Returns the map array for the inputted level
 * @param  {int} level Which level to get the map for
 * @return {array}
 */

function returnLevel(level) {
    switch(level) {
    case 0:
        return Game.map;
    case 1:
        return Game.map1;
    case 2:
        return Game.map2;
    case 3:
        return Game.map3;
    case 4:
        return Game.map4;
    default:
        console.log('There was a problem with the level... ' + level);
    }
}

function inRange(x, y){
    for(var tower = 0; tower < Game.commTowers.length; tower++){
        var radius = 75 - Game.level*10;
        var thisTower = Game.map[Game.commTowers[tower][1]][Game.commTowers[tower][0]][1].kind;
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
            var kind = returnLevel(Game.level)[y][x][0].kind;
            var resourceOnTile = returnLevel(Game.level)[y][x][0].resources;
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
                    if(returnLevel(Game.level)[y][x][0].mineable && document.getElementById(options[j]).checked){
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
        var thisTower = Game.map[Game.commTowers[tower][1]][Game.commTowers[tower][0]][1].kind;
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
    //Game.mPanel.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    var y, x, tileKind, tileRef;
    var sourceTile = returnLevel(Game.level);
    mainLoop();
    webkitRequestAnimationFrame(drawZoomMap);
    Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    if(Game.highlight) {
        drawTile(0, getTile('x'), getTile('y'), Game.tileHighlight, Game.mPanLoc, false, 0, 0);
    }
    for(y = 0; y < Game.yLimit; y++) {
        x = 0;
        while(x <= Game.xLimit) {
            tileRef = sourceTile[Game.retY - Game.yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x];
            tileRef[1] ? tileKind = tileRef[1].kind : tileKind = tileRef[0].kind;
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

function rightClicked(content, option) {
    //TODO : Make context menu appear on the correct side relative to mouse position near screen edges
    var popFrame = document.getElementById('contextMenuWrapper');
    var pop = document.getElementById('contextMenu');
    pop.innerHTML = contextContent(content);
    popFrame.style.top = event.clientY - 25 + 'px';
    popFrame.style.left = event.clientX - 10 + 'px';
    popFrame.style.display = 'inline-block';
    popFrame.style.opacity = '1';
    popFrame.addEventListener('mouseout', function() {
        if(((event.relatedTarget || event.toElement) == popFrame.nextElementSibling) || ((event.relatedTarget || event.toElement) == popFrame.parentNode)) {
            popFrame.style.opacity = '0';
            popFrame.addEventListener('webkitTransitionEnd', function() {
                popFrame.style.display = 'none';
                pop.innerHTML = '';
                popFrame.onmouseout = null;
            }, false);
        }
    }, false);
}

function contextContent(content, option) {
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    var tile = returnLevel(Game.level)[y][x][0];
    var construct = returnLevel(Game.level)[y][x][1];
    var resources = false;
    var htmlString = '';

    if(!option) {
        htmlString += '<span>' + tile.ref + '</span><br>';
    }
    //build time left
    if(returnLevel(Game.level)[y][x][1] && returnLevel(Game.level)[y][x][1].kind === 100) {
        htmlString += '<span>' + Lang.buildTime + (returnLevel(Game.level)[y][x][1].buildTime + 1) + " ";

        if(returnLevel(Game.level)[y][x][1].buildTime >= 1) {
            htmlString += Lang.weeks;
        }else{
            htmlString += Lang.week;
        }
        htmlString += '</span><br>';
    }
    if(content) {
        if(!(construct && construct.kind >= 100 && construct.kind < 200)){
            htmlString += content;
        }
    }
    if(construct && construct.shutdown) {
        htmlString += '<span>' + Lang.noPower + '</span><br>';
        htmlString += '<span>' + Lang.shutdown + '</span><br>';
    }
    //resources?
    for(var i = 0; i < tile.resources.length; i++) {
        if(tile.resources[i] > 0 && !option) {
            if(!resources) {
                htmlString += '<h3>' + Lang.resources + '</h3><ul>';
                resources = true;
            }
            htmlString += '<li>' + Game.resourceArray[i][0] + ': ' + tile.resources[i] + 't';
            htmlString += '<ul><li>' + Game.resourceArray[i][1] + '</ul>';
        }
    }
    htmlString += '</ul>';
    //!resources
    return htmlString;
}

String.prototype.insert = function(index, string) {
    if(index > 0) return this.slice(0, index) + string + this.slice(index);
    else return string + this;
};

function changeName(string, orig) {
    return string + ' #' + orig.split('#')[1];
}

function checkConnection(y, x) {
    var connected = false;
    for(var j = 0; j < 6; j++) {
        if(returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1] && (returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].kind === 211 || returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].kind === 204)) {
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
    var hex = returnLevel(Game.level)[y][x];
    var tile = hex[0];
    var lowerTile, upperTile;
    if(Game.level < 5) {
        lowerTile = returnLevel(Game.level + 1)[y][x][0];
    }
    if(Game.level > 0) {
        upperTile = returnLevel(Game.level - 1)[y][x][0];
    }
    switch(Game.clickedOn) {
    case 'lander':
        if(wetTest([y,x],Game.level)){
            notify(Lang.onWater);
        } else {
            hex[1] = bobTheBuilder(210, x, y, Game.level);
            for(var j = 0; j < 6; j++) {
                var tempY = adjacent(x, y, j)[0];
                var tempX = adjacent(x, y, j)[1];
                switch(j) {
                case 1:
                case 3:
                case 5:
                    Game.map[tempY][tempX][1] = bobTheBuilder(211, tempX, tempY, Game.level);
                    break;
                case 0:
                    Game.map[tempY][tempX][1] = bobTheBuilder(235, tempX, tempY, Game.level);
                    break;
                case 2:
                    Game.map[tempY][tempX][1] = bobTheBuilder(203, tempX, tempY, Game.level);
                    break;
                case 4:
                    Game.map[tempY][tempX][1] = bobTheBuilder(237, tempX, tempY, Game.level);
                    Game.commTowers.push([tempX, tempY]);
                    break;
                default:
                    console.log("The eagle most definitely has *not* landed");
                }
            }
            Game.buildings[37][1] = false;
            var buildable = [0, 3, 8, 11, 17, 23, 27, 32, 34, 35, 36];
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
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDoze + "</button><br>", true);
        } else {
            //tile.prepare();
            if((hex[1] && (hex[1].kind < 200 && hex[1].kind > 2)) || tile.kind > 2) {
                notify(Lang.noDoze);
            } else if(!inRange(x, y)){
                notify(Lang.outOfRange);
            } else {
                hex[1] = bobTheBuilder(100, x, y, Game.level);
            }
        }
        break;
    case 'digger':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDig + "</button><br>", true);
        } else {
            //tile.digDown(x, y, lowerTile);
            var DBelow = returnLevel(Game.level + 1);
            if(!checkConnection(y,x)){
                notify(Lang.noConnection);
            } else if(wetTest([y, x], Game.level + 1)){
                notify(Lang.onWater);
            } else if((hex[1] && hex[1].kind >= 100) || (DBelow[y][x][1] && DBelow[y][x][1].kind >= 100)){
                notify(Lang.buildingPresent);
            } else if(tile.kind > 3) {
                notify(Lang.noDig);
            } else if(Game.level === 4){
                notify(Lang.lastLevel);
            } else if(!inRange(x, y)){
                notify(Lang.outOfRange);
            } else {
                hex[1] = bobTheBuilder(101, x, y, Game.level, true);
                DBelow[y][x][1] = bobTheBuilder(101, x, y, Game.level + 1, true);
                for(var k = 0; k < 6; k++) {
                    var belowAdj = DBelow[adjacent(x, y, k)[0]][adjacent(x, y, k)[1]];
                    if((belowAdj[1] && (belowAdj[1].kind >= 100 || belowAdj[1].kind < 4)) || belowAdj[0].kind === 4 || wetTest([adjacent(x, y, k)[0], adjacent(x, y, k)[1]], Game.level + 1)) {
                        //do nothing
                    } else {
                        belowAdj[1] = bobTheBuilder(101101, adjacent(x, y, k)[1], adjacent(x, y, k)[0], Game.level + 1);
                    }
                }
            }
        }
        break;
    case 'cavernDigger':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDigCavern + "</button><br>", true);
        } else {
            if(wetTest([y, x], Game.level)){
                notify(Lang.onWater);
            } else if((hex[1] && hex[1].kind > 3) || Game.level === 0 || tile.kind > 2) {
                notify(Lang.noCavern);
            } else if(!inRange(x, y)){
                notify(Lang.outOfRange);
            } else {
                hex[1] = bobTheBuilder(101, x, y, Game.level);
                for(var z = 0; z < 6; z++) {
                    var around = returnLevel(Game.level)[adjacent(x, y, z)[0]][adjacent(x, y, z)[1]];
                    if((around[1] && (around[1].kind >= 100 || around[1].kind < 4)) || around[0].kind < 4 || wetTest([adjacent(x, y, z)[0], adjacent(x, y, z)[1]], Game.level + 1)) {
                        //do nothing
                    } else {
                        around[1] = bobTheBuilder(101101, adjacent(x, y, z)[1], adjacent(x, y, z)[0], Game.level);
                    }
                }
            }
        }
        break;
    case 'miner':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmMine + "</button><br>", true);
        } else {
            if(wetTest([y, x], Game.level + 1)){
                notify(Lang.onWater);
            } else if(hex[1] && hex[1].kind !== 221 && hex[1].kind >= 100) {
                notify(Lang.noMine);
            } else if(Game.level !== 0 && (!hex[1] || hex[1] && hex[1].kind !== 221)){
                notify(Lang.noMine);
            } else if(Game.level === 4) {
                notify(Lang.lastLevel);
            } else if(!inRange(x, y)){
                notify(Lang.outOfRange);
            } else {
                var MBelow = returnLevel(Game.level + 1)[y][x];
                hex[1] = bobTheBuilder(102, x, y, Game.level, true);
                MBelow[1] = bobTheBuilder(102102, x, y, Game.level + 1, true);
                for(var m = 0; m < 6; m++) {
                    var mineY = adjacent(x, y, m)[0];
                    var mineX = adjacent(x, y, m)[1];
                    if(returnLevel(Game.level)[mineY][mineX][0].mineable) {
                        returnLevel(Game.level)[mineY][mineX][1] = bobTheBuilder(102102, mineX, mineY, Game.level, false);
                    }
                    if(returnLevel(Game.level + 1)[mineY][mineX][0].mineable) {
                        returnLevel(Game.level + 1)[mineY][mineX][1] = bobTheBuilder(102102, mineX, mineY, Game.level + 1, false);
                    }
                }
            }
        }
        break;
    case 'recycler':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmRecycle + "</button><br>", true);
        } else {
            tile.recycle();
        }
        //TODO: add recycle code
        break;
    case 'agri':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(200, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'agri2':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(201, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'airport':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(202, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'arp':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(203, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'barracks':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(205, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'civprot':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(206, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'civprot2':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(207, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'command':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(210, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'commarray':
        if(hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(208, x, y, Game.level);
        } else {
            notify(Lang.notPrepared);
        }
        break;
    case 'commarray2':
        if(hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(209, x, y, Game.level);
        } else {
           notify(Lang.notPrepared);
        }
        break;
    case 'connector':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(211, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'dronefab':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(212, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'chernobyl':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(213, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'tokamak':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(214, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'genfab':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(215, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'geotherm':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(216, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'hab':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(217, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'hab2':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(218, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'hab3':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(219, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'er':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(220, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'nursery':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(222, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'oreproc':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(223, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'rec':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(224, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'recycler':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(225, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'clichy':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(226, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'research':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(227, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'research2':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(228, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'solar':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(229, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'space':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(230, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'stasis':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(231, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'store':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(232, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'uni':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(233, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'warehouse':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(234, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'windfarm':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(235, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    case 'workshop':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(236, x, y, Game.level);
        } else {
            !checkConnection(y, x) ? notify(Lang.noConnection) : notify(Lang.notPrepared);
        }
        break;
    default:
        console.log("I don't recognise that building code...");
    }
    drawRadar();
}


/**
 *  When I click on a menu item, this remembers what it is _unless_ I click again, in which case, it forgets
 */

function construct() {
    var identity = this.id;
    //console.log(identity);
    if(Game.clickedOn === identity) {
        document.getElementById(Game.clickedOn).style.background = '#000';
        Game.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
    } else {
        if(Game.clickedOn !== 'none') {
            document.getElementById(Game.clickedOn).style.background = '#000';
        }
        document.getElementById(identity).style.background = '#393939';
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
            //TODO: Change the pointers below to appropriate icons for the relevant building...
        case 'lander':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'agri':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'agri2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'airport':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'arp':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'barracks':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'civprot':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'civprot2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'command':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'commarray':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'commarray2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'connector':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'dronefab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'chernobyl':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'tokamak':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'genfab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'geotherm':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab3':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'er':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'nursery':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'oreproc':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'rec':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'recycler':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'clichy':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'research':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'research2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'solar':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'space':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'stasis':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'store':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'uni':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'warehouse':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'windfarm':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'workshop':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        default:
            console.log("There was a problem finding out which building or drone you wanted...");
        }
    }
}