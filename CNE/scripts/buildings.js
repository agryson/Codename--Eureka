/**
* Wraps the construction relevant methods
* @namespace
*/
var Build = (function(){
	/**
	* Builds everything, including temporary structures like drones, this is also 
	* currently where all the parameters for the different buildings are stored
	* @public
	* @memberOf Build
	* @param {int} kind Kind of structure to build
	* @param {int} x X coordinate on which to build
	* @param {int} y Y coordiante on which to build
	* @param {int} level Level on which to build
	* @param {bool} [builderBot] If this is a temporary, precursor structure or not
	*/
	function start(kind, x, y, level, builderBot) {
	    console.log(kind);

	    /**
	    * Calculates the number of turns need to do something based on modifiers
	    * @inner
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

	/**
	 * Given a building ID, will return the kind, and vice versa
	 * @public
	 * @memberOf Build
	 * @param {(string|int)} reference The menu item id that was clicked, or its kind
	 */
	function getRef(reference){
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
	* @public
	* @memberOf Build
	* @todo The resources used in this function should be generalized
	*/
	function plan() {
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

	return {
		plan: plan,
		getRef: getRef,
		start: start
	};
})();