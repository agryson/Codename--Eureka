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
                Conf.mapTiles[level][y][x] = Build.start(tile.future[0], x, y, level, false);
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
 * The main game loop
 */
function mainLoop() {
    var N = 22; //Number of animation frames from 0 e.g. N=1 is the same as having two images which swap...
    Conf.augment ? Conf.animate += 1 : Conf.animate -= 1;
    if(Conf.animate === 0 || Conf.animate === N) {
        Conf.augment ? Conf.augment = false : Conf.augment = true;
    }
}
