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
        getMousePos(Conf.mPanCanvas, evt, true); //tracker
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
                Conf.retY = Conf.retY - Math.round(Conf.yLimit / 2) + getTile('y') + 2;
                Conf.retX = Conf.retX - Math.round(Conf.xLimit / 2) + getTile('x');
            };
        if(event.wheelDelta > 0 && val < zoomMax) {
            if(!blocked) {
                setRet();
            }
            CneTools.zoom(val + 1);
            zoomPos.value = val + 1;
        } else if(event.wheelDelta < 0 && val > 1) {
            if(!blocked) {
                setRet();
            }
            CneTools.zoom(val - 1);
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
        CneTools.mapFit(true);
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
        getMousePos(Conf.radarCanvas, evt);
        Conf.highlight = false;
        jump();
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
    };

    document.getElementById('10Week').onclick = function(){
        execReview();
    };

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
        advanceTurn(1);
    };
    document.getElementById('zoom').onchange = function() {
        var zoomLevel = document.getElementById('zoom').value;
        CneTools.zoom(zoomLevel);
    };
})();
