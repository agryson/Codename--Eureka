"use strict";
//var saveList = [];
//Nice map: 1363032002367

/**
 * Initialize the game
 */
window.onload = function init() {
    FileIO.openfs();
    if(!document.hidden){
        Music.play();
    }
};

var Logic = (function(){
    /**
     * The main game loop
     */
    function main() {
        var N = 22; //Number of animation frames from 0 e.g. N=1 is the same as having two images which swap...
        Conf.augment ? Conf.animate += 1 : Conf.animate -= 1;
        if(Conf.animate === 0 || Conf.animate === N) {
            Conf.augment ? Conf.augment = false : Conf.augment = true;

    /**
    * Calculates what the state of the given tile should be in the next turn, setting 
    * it appropriately depending on if its a mine, building, research center etc.
    * @param {int} x X coordinate of the tile to calculate
    * @param {int} y Y coordinate of the tile to calculate
    * @param {int} level Level the tile is on
    */
    function Logic.nextTurn(x, y, level) {
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
                    Conf.mapTiles[level][y][x] = Build.start(tile.future[0], x, y, level, false);
                } else {
                    tile.kind = tile.future[0];
                    Logic.nextTurn(x, y, level);
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


        }
    }

    return {
        main: main,
        nextTurn: nextTurn
    }
})();
