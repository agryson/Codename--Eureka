/**
* Moduled namespace, exposing everything we need to manage save games, load games etc.
* @namespace FileIO
*/
var FileIO = (function(){
    var fs = null;
    var publicFunctions = {};

    /**
    * Success handler, assigning the filesystem to something we can use and then
    * starts loading any existing games
    * @param {DOMFileSystem} filesystem The filesystem passed in from openfs()
    * @memberOf FileIO
    * @private
    */
    var _success = function(filesystem){
        fs = filesystem;
        FileIO.loadList();
    };

    /**
    * Prints appropriate error information to console, if any
    * @param {FileError} Error Error thrown
    * @memberOf FileIO
    * @private
    */
    var _errorHandler = function(e) {
      console.log(e.name + ' : ' + e.message);
    };

    /**
    * Opens or creates a persistent local file system
    * @memberOf FileIO
    * @function openfs
    */
    publicFunctions.openfs = function(){
        window.webkitRequestFileSystem(window.PERSISTENT, 50*1024*1024 /*50MB*/, _success, _errorHandler);
    };

    /**
    * Fills the list of loadable games from the file system
    * @memberOf FileIO
    * @function loadList
    */
    publicFunctions.loadList = function(){
        var dirReader = fs.root.createReader();
        var entries = [];

        /**
        * Iterates through all of the saved games available
        */
        var readEntries = function() {
            dirReader.readEntries (function(results) {
                if (!results.length) {
                    listResults(entries);//this function fills our list of saves
                } else {
                    entries = entries.concat(toArray(results));
                    readEntries();
                }
            }, _errorHandler);
        };

        /**
        * Takes the FileEntry object and returns it as an array
        * @param {FileEntry} list FileEntry object (basically an array representing
        * a list of save games)
        * @return {array} Returns an array of FileEntry objects
        */
        var toArray = function(list) {
            return Array.prototype.slice.call(list || [], 0);
        };

        /**
        * List the loaded results, creating buttons for the loads
        * @param {array} list The array of save games available
        * @todo The list parameter here, and the one in {@link toArray} could be confused, we should consider changing one or the other
        */
        var listResults = function(list){
            var fragment = document.createDocumentFragment();
            var title = document.createElement('span');
            title.innerHTML = TRANS.saves;
            fragment.appendChild(title);
            var ids = [];
            var rmIds = [];

            list.forEach(function(entry, i) {
                var btn = document.createElement('button');
                btn.classList.add('save_option');
                btn.classList.add('main_pointer');
                btn.id = 'save' + i;
                ids.push('save' + i);
                btn.value = entry.name;
                btn.innerHTML = entry.name;
                fragment.appendChild(btn);
                var del = document.createElement('button');
                del.classList.add('red_glass');
                del.classList.add('delete_save');
                del.classList.add('main_pointer');
                del.id = 'rm' + i;
                rmIds.push('rm' + i);
                del.value = entry.name;
                del.innerHTML = '&#215;';
                fragment.appendChild(del);
            });
            Tools.flush(document.getElementById('chooseSave'));
            document.getElementById('chooseSave').appendChild(fragment);
            for(var j = 0; j < ids.length; j++){
                //I've discovered closure! wow...
                (function(_j){
                    var id = ids[j];
                    var rmId = rmIds[j];
                    var obj = document.getElementById(id);
                    var rmObj = document.getElementById(rmId);

                    /**
                    * Sets the current seed value to the saved value, allowing for 
                    * procedural regeneration of the terrain
                    */
                    var objFn = function(){
                        document.getElementById('seed').value = document.getElementById(id).value;
                    };

                    /**
                    * Handles save game deletion on user input
                    */
                    var rmObjFn = function(){
                        var nameIn = document.getElementById(rmId).value;
                        document.getElementById('deleteOK').value = nameIn;
                        document.getElementById('confirmDeleteTxt').innerHTML = TRANS.confirmDelete + ' "' + nameIn + '"';
                        document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                        document.getElementById('deleteOK').onclick = function(){
                            FileIO.deleteGame(nameIn);
                            document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                            document.getElementById('deleteOK').onclick = null;
                        };
                        document.getElementById('deleteBad').onclick = function(){
                            document.getElementById('confirmDelete').classList.toggle('delete_toast_visible');
                            document.getElementById('deleteBad').onclick = null;
                        };
                    };
                    obj.addEventListener('click', objFn, false);
                    rmObj.addEventListener('click', rmObjFn, false);
                })();
            }
            document.getElementById('popup').classList.add('popup_open');
        };
        readEntries(); // Start reading dirs.
    };

    /**
    * Deletes the game from the filesystem
    * @memberOf FileIO
    * @function deleteGame
    * @param {string} name The name of the save game to delete
    */
    publicFunctions.deleteGame = function(name){
        fs.root.getFile(name, {create: false}, function(fileEntry) {fileEntry.remove(function() {
                console.log(name + ' has been removed.');
                FileIO.loadList();
            }, _errorHandler);
        }, _errorHandler);
    };

    /**
    * Saves the game to filesystem
    * @memberOf FileIO
    * @function saveGame
    * @param {Object} Game Game object to save
    */
    publicFunctions.saveGame = function(Game){
        fs.root.getFile(Conf.inputSeed, {create: true}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter){
                fileWriter.onwriteend = function(e){
                    console.log('File written');
                };
                fileWriter.onerror = function(e){
                    console.log('File write failed: ' + e.toString());
                };
                fileWriter.write(_buildSave(Game));
            }, _errorHandler);
        }, _errorHandler);
    };

    /**
    * Manages game loads, assigning the values to their proper places, effectively 
    * taking a fresh config and overwriting with the saved values
    * @memberOf FileIO
    * @function loadGame
    * @param {Object} Game Game object (default) that will be loaded onto
    */
    publicFunctions.loadGame = function(Game){
        fs.root.getFile(Conf.inputSeed, {}, function(fileEntry) {
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function(e){
                    //TODO: make sure the type is conserved e.g. Conf.mapTiles**[]** = saveDataOut[1];
                    var saveDataOut = JSON.parse(this.result);
                    Conf.turn = saveDataOut[0];
                    Conf.mapTiles = saveDataOut[1];
                    Conf.home = saveDataOut[2];
                    Conf.buildings = saveDataOut[3];
                    Conf.robotsList = saveDataOut[4];
                    Conf.commTowers = saveDataOut[5];
                    Conf.recyclerList = saveDataOut[6];
                    Conf.researchLabs = saveDataOut[7];
                    Conf.researchTopics = saveDataOut[8];
                    Conf.ores = saveDataOut[9];
                    Conf.procOres = saveDataOut[10];
                    Conf.inputSeed = saveDataOut[11];
                    Conf.housing = saveDataOut[12];
                    Conf.pop = saveDataOut[13];
                    Conf.tossPop = saveDataOut[14];
                    Conf.tossBabies = saveDataOut[15];
                    Conf.tossStudents = saveDataOut[16];
                    Conf.tossAdults = saveDataOut[17];
                    Conf.hipPop = saveDataOut[18];
                    Conf.hipBabies = saveDataOut[19];
                    Conf.hipStudents = saveDataOut[20];
                    Conf.hipAdults = saveDataOut[21];
                    Conf.artPop = saveDataOut[22];
                    Conf.artBabies = saveDataOut[23];
                    Conf.artStudents = saveDataOut[24];
                    Conf.artAdults = saveDataOut[25];
                    Conf.employed = saveDataOut[26];
                    Conf.sdf = saveDataOut[27];
                    Conf.tossMorale = saveDataOut[28];
                    Conf.hipMorale = saveDataOut[29];
                    Conf.artMorale = saveDataOut[30];
                    Conf.crime = saveDataOut[31];
                    Conf.storageCap = saveDataOut[32];
                    Conf.inStorage = saveDataOut[33];
                    Conf.food = saveDataOut[34];
                    Conf.energy = saveDataOut[35];
                    Conf.air = saveDataOut[36];
                    Conf.blackout = saveDataOut[37];
                    Conf.noAir = saveDataOut[38];
                    Conf.creche = saveDataOut[39];
                    Conf.uni = saveDataOut[40];
                    Conf.botAging = saveDataOut[41];
                    Conf.leisure = saveDataOut[42];
                    //Add code that gets read data and make Game equal to it...
                    Conf.buildings[37][1] = false;
                    CneTools.checkBuildings();
                    CneTools.checkRobots();
                    Menu.recount('all');
                    execReview();
                    Research.refreshMenu();
                    Display.drawRadar();
                    Conf.turnNum.innerHTML = TRANS.weekCounter + Conf.turn;
                    Tools.flush(document.getElementById('consoleContent'));
                    Terminal.print(TRANS.itIsNow + ' ' + TRANS.week + ' ' + Conf.turn);
                    CneTools.moveTo(true, Conf.home[0], Conf.home[1], 0);
                };
                reader.readAsText(file);
            }, _errorHandler);
        }, _errorHandler);
    };

    /**
    * Creates the appropriate format to save
    * @memberOf FileIO
    * @private
    * @function buildSave
    * @param {Object} Game Game object to be saved
    * @return {blob} The save game JSON, blobbified
    */
    var _buildSave = function(Game){
        var saveData = [
        Conf.turn,
        Conf.mapTiles,
        Conf.home,
        Conf.buildings,
        Conf.robotsList,
        Conf.commTowers,
        Conf.recyclerList,
        Conf.researchLabs,
        Conf.researchTopics,
        Conf.ores,
        Conf.procOres,
        Conf.inputSeed,
        Conf.housing,
        Conf.pop,
        Conf.tossPop,
        Conf.tossBabies,
        Conf.tossStudents,
        Conf.tossAdults,
        Conf.hipPop,
        Conf.hipBabies,
        Conf.hipStudents,
        Conf.hipAdults,
        Conf.artPop,
        Conf.artBabies,
        Conf.artStudents,
        Conf.artAdults,
        Conf.employed,
        Conf.sdf,
        Conf.tossMorale,
        Conf.hipMorale,
        Conf.artMorale,
        Conf.crime,
        Conf.storageCap,
        Conf.inStorage,
        Conf.food,
        Conf.energy,
        Conf.air,
        Conf.blackout,
        Conf.noAir,
        Conf.creche,
        Conf.uni,
        Conf.botAging,
        Conf.leisure
        ];
        var saveDataString = [];
        saveDataString.push(JSON.stringify(saveData));
        var blob = new Blob(saveDataString);
        return blob;
    };

    /**
    * Exposed functions
    */
    return publicFunctions;
})();