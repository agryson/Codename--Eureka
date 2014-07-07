/**
* Anything that effects player data regarding resources
* @namespace
*/
var Resources = {
    /**
    * Provides the list of materials needed, either as a directly usable array, a 
    * boolean value representing availability or as a Document Fragment for use in 
    * the context menu
    * @param {string} building The building to get list for
    * @param {bool} getRec If true, will try to requisition the required materials, returning success or failure
    * @param {bool} recycling If true, will simply get the array of materials needed for a construction
    * @returns {(array|bool|Object)} Array of materials needed | Success or failure of requisition | Document Fragment listing material availability
    */
    required: function(building, getRec, recycling){
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
            return(Resources.requisition(resourcesNeeded));
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
    },

    /**
    * Cross references the indexes of processed minerals to their ores
    * @param {int} ref 
    * @param {int} dir 'Direction' of the conversion: (0 processed -> ore; 1 ore -> processed
    * @returns {array} 
    * @todo dir seems redundant here
    */
    reference: function(ref,dir){
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
    },

    /**
    * Depending on availability, will take the resources indicated. If not all the 
    * resources are available, it wil print the missing resources to the in-game
    * console
    * @param {array} arr Array of materials to requisition
    * @returns {bool} Success or not
    * @todo This function should probably handle recycling as well
    */
    requisition: function(arr){//TODO set up recycling here
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
            Terminal.print(shortage.substring(0,shortage.length - 2)); //removes the space and comma
        }
        return resourceCheck;
    }
    
}