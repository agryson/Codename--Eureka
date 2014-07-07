/**
* Wraps statistics methods
* @namespace
*/
var Stats = (function(){
	/**
	* Opens the Executive Review panel, coloring in all of the statistics when we need them
	*/
	function executiveReview() {
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
	* Corrects the statistics for illogical stuff (percentages over 100 etc.)
	*/
	function sanityCheck(){
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
	* Pushes all tracked data to the relevant places for in-game statistics
	*/
	function setAll() {
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
	
	return {
		executiveReview: executiveReview,
		sanityCheck: sanityCheck,
		setAll: setAll
	}
})();