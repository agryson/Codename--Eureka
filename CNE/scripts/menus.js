/**
* Wraps menu methods
* @namespace
*/
var Menu = (function(){
	/**
	* Manages the actual values for the resized menu from {@link Menu.resizeLeft}
	* @private
	* @memberOf Menu
	* @param {event} e The mousemove event
	*/
	function resizeSplit(e) {
	    var current = e.clientY;
	    var total = window.innerHeight;
	    //var barThickness = Math.round((total/100)*2);
	    var percentage = Math.round((current / total) * 100);
	    if(percentage < 10) {
	        percentage = 11;
	        Menu.resizeLeft(false);
	    } else if(percentage > 90) {
	        percentage = 89;
	        Menu.resizeLeft(false);
	    }
	    document.getElementById('buildingContainer').style.height = percentage - 2 + '%';
	    document.getElementById('droneContainer').style.height = 98 - percentage + '%';
	}

	/**
	* Once a right click menu has been created, returns the HTML fragment to to be appended
	* @public
	* @memberOf Menu
	* @param {string} content Html content to put into the right click menu
	* @returns {Object} Document Fragment to append
	*/
	function context(content) {
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
	* resizes the left menus on mouse drag
	* @public
	* @memberOf Menu
	* @param  {boolean} [bool] check to see if we should be resizing
	*/
	function resizeLeft(bool) {
	    if(bool) {
	        document.getElementById('leftMenu').onmousemove = resizeSplit;
	    } else {
	        document.getElementById('leftMenu').onmousemove = null;
	    }
	}

	/**
	* Recounts the number of bots available and updates the counter bars appropriately
	* @public
	* @memberOf Menu
	* @param  {string} which The type of robot we're dealing with
	*/
	function recount(which) {
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
	* Manages the opening and closing of menus
	* @public
	* @memberOf Menu
	* @param {HTMLElement} containerIn Container containing the menu to show or hide
	* @param {HTMLElement} buttonIn Button for the container
	* @param {string} hideClass Class that determines visibility of the container
	*/
	function open(containerIn, buttonIn, hideClass) {
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


	return {
		context: context,
		resizeLeft: resizeLeft,
		recount: recount,
		open: open
	}
})();