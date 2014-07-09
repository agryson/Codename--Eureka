"use strict";
/**
* Wraps research related functionality
* @namespace
* @todo These could probably be mostly split into tools, interface etc...
*/
var Research = (function(){
	var publicMethods = {};
	/**
	* @private
	* @memberOf Research
	* Opens appropriate research panel when a research menu item is clicked
	*/
	function _clickedResearch(){
	    var ident = this.id;
	    console.log(ident);
	    if(document.getElementById(ident + 'Cont')){
	        document.getElementById(ident + 'Cont').classList.toggle('research_cont_hidden');
	    }
	    Research.fillPanel(ident);
	    publicMethods.refreshMenu();
	}

	/**
	* Returns the research progress as a percenteage
	* @private
	* @memberOf Research
	* @param {string} ident The topic for which the research progress is needed
	* @returns {int} Research progress as a percentage
	*/
	function _researchProgress(ident){
	    var ref = _researchTopicRef(ident);
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
	* Based on an input string, finds the corresponding {@link Conf.researchTopics} sub-array
	* @private
	* @memberOf Research
	* @param {string} topic The topic for which a reference is needed
	* @returns {array} The {@link Conf.researchTopics} sub-array that corresponds to <tt>topic</tt>
	*/
	function _researchTopicRef(topic){
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
	* Populates a list of labs that are actively researching hte given topic, and/or are available to research it
	* @private
	* @memberOf Research
	* @param {string} ident The topic for which the player needs the lab list
	*/
	function _listLabs(ident){
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
	            progressBar.classList.add('research_progress_' + _researchProgress(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
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
	                _listLabs(ident);
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
	                _listLabs(ident);
	            };
	            obj.addEventListener('click', objFn, false);
	        })();
	    }
	}

	/**
	* Refreshes the research menu
	* @public
	* @memberOf Research
	*/
	function refreshMenu(){
	    var source = Conf.researchTopics[2];

	    //Tier0
	    for(var i = 0; i < source.length; i++){
	        if(Conf.researchTopics[3] === 0){
	            var tier0 = document.getElementById(source[i][0]);
	            if(!tier0.classList.contains('research_active')){
	                tier0.classList.add('research_active');
	                tier0.innerHTML = TRANS[source[i][0]];
	                tier0.onclick = _clickedResearch;
	            }
	            //Tier1
	            for(var j = 0; j < source[i][2].length; j++){
	                if(source[i][3] === 0){
	                    var tier1 = document.getElementById(source[i][2][j][0]);
	                    if(!tier1.classList.contains('research_active')){
	                        tier1.classList.add('research_active');
	                        tier1.innerHTML = TRANS[source[i][2][j][0]];
	                        console.log(source[i][2][j][0]);
	                        tier1.onclick = _clickedResearch;
	                    }
	                    //Tier2
	                    for(var k = 0; k < source[i][2][j][2].length; k++){
	                        if(source[i][2][j][3] === 0){
	                            var tier2 = document.getElementById(source[i][2][j][2][k][0]);
	                            if(!tier2.classList.contains('research_active')){
	                                tier2.classList.add('research_active');
	                                tier2.innerHTML = TRANS[source[i][2][j][2][k][0]];
	                                tier2.onclick = _clickedResearch;
	                            }
	                            //Tier3
	                            for(var l = 0; l < source[i][2][j][2][k][2].length; l++){
	                                if(source[i][2][j][2][k][3] === 0){
	                                    var tier3 = document.getElementById(source[i][2][j][2][k][2][l][0]);
	                                    if(!tier3.classList.contains('research_active')){
	                                        tier3.innerHTML = TRANS[source[i][2][j][2][k][2][l][0]];
	                                        tier3.onclick = _clickedResearch;
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
	* Populates the research panel with the appropriate information
	* @public
	* @memberOf Research
	* @param {string} ident ID of menu item that was clicked
	*/
	function fillPanel(ident){
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
	                progressBar.classList.add('research_progress_' + _researchProgress(Conf.mapTiles[lab[0]][lab[1]][lab[2]].researchTopic));
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
	        var topicArr = _researchTopicRef(ident);
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
	        progressBar2.classList.add('research_progress_' + _researchProgress(ident));
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
	            _listLabs(ident);
	        };
	    }
	}

	/**
	* Updates the research progress for the provided tile
	* @public
	* @memberOf Research
	* @param {Object} tile Tile Object to update research progress for
	*/
	function updateProgress(tile){
		console.log(tile.researchTopic);
        var topic = tile.researchTopic;
        var labRef = _researchTopicRef(topic);
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

	return {
		refreshMenu: refreshMenu,
		fillPanel: fillPanel,
		updateProgress: updateProgress
	}
})();