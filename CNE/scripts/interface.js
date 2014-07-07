/**
* Namespace containing all of the User Interface listeners (clicks, taps etc.)
* @namespace
* @todo This currently does too much direct manipulation, we should try to generalize
*/
var Interface = (function(){
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
        CneTools.checkBuildings();
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
        CneTools.mouse(Conf.mPanCanvas, evt, true); //tracker
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
                Conf.retY = Conf.retY - Math.round(Conf.yLimit / 2) + CneTools.getTile('y') + 2;
                Conf.retX = Conf.retX - Math.round(Conf.xLimit / 2) + CneTools.getTile('x');
            };
        if(event.wheelDelta > 0 && val < zoomMax) {
            if(!blocked) {
                setRet();
            }
            Display.zoom(val + 1);
            zoomPos.value = val + 1;
        } else if(event.wheelDelta < 0 && val > 1) {
            if(!blocked) {
                setRet();
            }
            Display.zoom(val - 1);
            zoomPos.value = val - 1;
        }
        return false;
    };
    //!Canvas Map
    //Level Slider
    var levelSlider = document.getElementById('slider');
    levelSlider.onchange = function() {
        CneTools.changeLevel(levelSlider.value);
    };
    //!Level Slider
    window.onresize = function() {
        Display.resizeMap(true);
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
        CneTools.mouse(Conf.radarCanvas, evt);
        Conf.highlight = false;
        CneTools.moveTo();
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
            rightClick();
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
        Display.drawRadar();
    };

    document.getElementById('10Week').onclick = function(){
        execReview();
    };

    document.getElementById("aluminiumRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("calciumRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("copperRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("goldRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("ironRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("leadRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("magnesiumRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("mercuryRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("phosphorousRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("potassiumRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("silverRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("sodiumRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("tinRadarOpt").onclick = function(){
        Display.drawRadar();
    };
    document.getElementById("zincRadarOpt").onclick = function(){
        Display.drawRadar();
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
        Research.refreshMenu();
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
        CneTools.skipTurns(1);
    };
    document.getElementById('zoom').onchange = function() {
        var zoomLevel = document.getElementById('zoom').value;
        Display.zoom(zoomLevel);
    };

    /**
     * Performs the appropriate actions for the tile that is clicked upon depending on 
     * the construction or robot chosen
     * @private
     * @memberOf Interface
     * @param {bool} direction If true, action takes place, if not, will ask for confirmation
     */
    function clicked(direction) {
        var y = Conf.retY - Math.round(Conf.yLimit / 2) + CneTools.getTile('y');
        var x = Conf.retX - Math.round(Conf.xLimit / 2) + CneTools.getTile('x');
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
            if(CneTools.isWet([y,x],Conf.level)){
                Terminal.print(TRANS.onWater);
            } else {
                Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(210, x, y, Conf.level);
                Conf.home = [x,y];
                for(var j = 0; j < 6; j++) {
                    var tempY = CneTools.adjacent(x, y, j)[0];
                    var tempX = CneTools.adjacent(x, y, j)[1];
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
                CneTools.checkBuildings();
                execReview();
                Display.drawRadar();
            }
            break;
        case 'dozer':
            if(!direction) {
                rightClick(confirmBot(TRANS.confirmDoze));
                document.getElementById('confirmBuild').onclick = function(){
                    console.log('how many times?');
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };
            } else {
                if((hex && (hex.kind < 200 && hex.kind > 2)) || (typeof hex.kind !== 'number' && tile.kind > 2 && tile.kind < 9) || tile.kind > 11) {
                    Terminal.print(TRANS.noDoze);
                } else if(!CneTools.inRange(x, y)){
                    Terminal.print(TRANS.outOfRange);
                } else {
                    Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(100, x, y, Conf.level);
                }
            }
            break;
        case 'digger':
            if(!direction) {
                rightClick(confirmBot(TRANS.confirmDig));
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };
            } else {
                //tile.digDown(x, y, lowerTile);
                var DBelow = Conf.mapTiles[Conf.level + 1];
                if(!CneTools.checkConnection(y,x)){
                    Terminal.print(TRANS.noConnection);
                } else if(CneTools.isWet([y, x], Conf.level + 1)){
                    Terminal.print(TRANS.onWater);
                } else if((hex && hex.kind >= 100) || (DBelow[y][x] && DBelow[y][x].kind >= 100)){
                    Terminal.print(TRANS.buildingPresent);
                } else if((hex.kind > 3 && hex.kind < 9) || hex.kind > 11) {
                    Terminal.print(TRANS.noDig);
                } else if(Conf.level === 4){
                    Terminal.print(TRANS.lastLevel);
                } else if(!CneTools.inRange(x, y)){
                    Terminal.print(TRANS.outOfRange);
                } else {
                    Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(101, x, y, Conf.level, true);
                    DBelow[y][x] = bobTheBuilder(101, x, y, Conf.level + 1, true);
                    for(var k = 0; k < 6; k++) {
                        var belowAdj = DBelow[CneTools.adjacent(x, y, k)[0]][CneTools.adjacent(x, y, k)[1]];
                        if((belowAdj.exists && (belowAdj.kind >= 100 || belowAdj[1].kind < 4)) || Conf.map[Conf.level + 1][CneTools.adjacent(x, y, k)[0]][CneTools.adjacent(x, y, k)[1]].kind === 4 || CneTools.isWet([CneTools.adjacent(x, y, k)[0], CneTools.adjacent(x, y, k)[1]], Conf.level + 1)) {
                            //do nothing
                        } else {
                            Conf.mapTiles[Conf.level + 1][CneTools.adjacent(x, y, k)[0]][CneTools.adjacent(x, y, k)[1]] = bobTheBuilder(101101, CneTools.adjacent(x, y, k)[1], CneTools.adjacent(x, y, k)[0], Conf.level + 1);
                        }
                    }
                }
            }
            break;
        case 'cavernDigger':
            if(!direction) {
                rightClick(confirmBot(TRANS.confirmDigCavern));
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };
            } else {
                if(CneTools.isWet([y, x], Conf.level)){
                    Terminal.print(TRANS.onWater);
                } else if((hex && hex.kind > 3) || Conf.level === 0 || (hex.kind > 2 && hex.kind < 9) || hex.kind > 11) {
                    Terminal.print(TRANS.noCavern);
                } else if(!CneTools.inRange(x, y)){
                    Terminal.print(TRANS.outOfRange);
                } else {
                    Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(101, x, y, Conf.level);
                    for(var z = 0; z < 6; z++) {
                        var around = Conf.mapTiles[Conf.level][CneTools.adjacent(x, y, z)[0]][CneTools.adjacent(x, y, z)[1]];
                        if((around && (around.kind >= 100 || around.kind < 4)) || Conf.map[Conf.level][CneTools.adjacent(x, y, z)[0]][CneTools.adjacent(x, y, z)[1]].kind < 4 || CneTools.isWet([CneTools.adjacent(x, y, z)[0], CneTools.adjacent(x, y, z)[1]], Conf.level + 1)) {
                            //do nothing
                        } else {
                            Conf.mapTiles[Conf.level][CneTools.adjacent(x, y, z)[0]][CneTools.adjacent(x, y, z)[1]] = bobTheBuilder(101101, CneTools.adjacent(x, y, z)[1], CneTools.adjacent(x, y, z)[0], Conf.level);
                        }
                    }
                }
            }
            break;
        case 'miner':
            if(!direction) {
                rightClick(confirmBot(TRANS.confirmMine));
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };
            } else {
                if(CneTools.isWet([y, x], Conf.level + 1)){
                    Terminal.print(TRANS.onWater);
                } else if(hex && hex.kind !== 221 && hex.kind >= 100) {
                    Terminal.print(TRANS.noMine);
                } else if(Conf.level !== 0 && (!hex || hex && hex.kind !== 221)){
                    Terminal.print(TRANS.noMine);
                } else if(Conf.level === 4) {
                    Terminal.print(TRANS.lastLevel);
                } else if(!CneTools.inRange(x, y)){
                    Terminal.print(TRANS.outOfRange);
                } else {
                    Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(102, x, y, Conf.level, true);
                    Conf.mapTiles[Conf.level + 1][y][x] = bobTheBuilder(102102, x, y, Conf.level + 1, true);
                    for(var m = 0; m < 6; m++) {
                        var mineY = CneTools.adjacent(x, y, m)[0];
                        var mineX = CneTools.adjacent(x, y, m)[1];
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
                rightClick(confirmBot(TRANS.confirmRecycle));
                document.getElementById('confirmBuild').onclick = function(){
                    clicked(true);
                    document.getElementById('confirmBuild').onclick = null;
                };
            } else {
                if(hex && hex.kind >= 200){
                    recycle(hex.kind, x, y, Conf.level);
                } else {
                    Terminal.print(TRANS.noRecycle);
                }
            }
            //TODO: add recycle code
            break;
        default:
            if(!direction){
                rightClick(Resources.required(Conf.clickedOn));
                if(document.getElementById('confirmBuild')){
                    document.getElementById('confirmBuild').onclick = function(){
                        clicked(true);
                        document.getElementById('confirmBuild').onclick = null;
                    };}
            } else {
                if((CneTools.checkConnection(y, x) || Conf.clickedOn === 'commarray' || Conf.clickedOn === 'commarray2') && hex && hex.kind === 3) {
                    if(Resources.required(Conf.clickedOn, true)){
                        Conf.mapTiles[Conf.level][y][x] = bobTheBuilder(getBuildingRef(Conf.clickedOn), x, y, Conf.level);
                    }
                } else {
                    !CneTools.checkConnection(y, x) ? Terminal.print(TRANS.noConnection) : Terminal.print(TRANS.notPrepared);
                }
            }
        }
        Display.drawRadar();
    }
    
    /**
     * Depending on the key pressed, changes the reference reticule
     * and then redraws the maps and radar
     * @private
     * @memberOf Interface
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
            CneTools.checkBuildings();
            Display.drawRadar();
            document.getElementById('slider').value = Conf.level;
            break;
        default:
            break;
        }
        Display.drawReticule();
    }

    
    /**
    * Upon right click, creates the context menu
    * @memberOf Interface
    * @private
    * @param {string} content The content for the right click menu in html
    */
    function rightClick(content) {
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
    var controls = {};
    /**
     * Generic keyboard listener
     * @memberOf Interface
     * @method keydown
     * @param  {Event} e The event passed in upon key press
     */
    controls.keydown = function(e) {
        if(document.activeElement === document.getElementById('consoleInput')){
            switch(e.keyCode){
                case 13: //enter
                    Terminal.run(document.getElementById('consoleInput').value);
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
                Display.drawRadar();
                break;
            case 48:
                Conf.level = 0;
                CneTools.checkBuildings();
                Display.drawRadar();
                document.getElementById('slider').value = Conf.level;
                break;
            case 49:
                Conf.level = 1;
                CneTools.checkBuildings();
                Display.drawRadar();
                document.getElementById('slider').value = Conf.level;
                break;
            case 50:
                Conf.level = 2;
                CneTools.checkBuildings();
                Display.drawRadar();
                document.getElementById('slider').value = Conf.level;
                break;
            case 51:
                Conf.level = 3;
                CneTools.checkBuildings();
                Display.drawRadar();
                document.getElementById('slider').value = Conf.level;
                break;
            case 52:
                Conf.level = 4;
                CneTools.checkBuildings();
                Display.drawRadar();
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
                Research.fillPanel('overview');
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
                CneTools.skipTurns(1);
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


    return controls;
})();
