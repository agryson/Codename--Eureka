"use strict";
/**
* Moduled namespace, exposing everything we need to manage save games, load games etc.
* @namespace FileIO
*/
var FileIO = (function(){
    var fs = null;

    /**
    * Creates the appropriate format to save
    * @memberOf FileIO
    * @private
    * @function buildSave
    * @param {Object} Game Game object to be saved
    * @return {blob} The save game JSON, blobbified
    */
    function _buildSave(Game){
        var saveDataString = [];
        saveDataString.push(JSON.stringify(Conf.saveData()));
        var blob = new Blob(saveDataString);
        return blob;
    };

    /**
    * Success handler, assigning the filesystem to something we can use and then
    * starts loading any existing games
    * @private
    * @memberOf FileIO
    * @param {DOMFileSystem} filesystem The filesystem passed in from openfs()
    */
    function _success(filesystem){
        fs = filesystem;
        FileIO.loadList();
    };

    /**
    * Prints appropriate error information to console, if any
    * @private
    * @memberOf FileIO
    * @param {FileError} Error Error thrown
    */
    function _errorHandler(e) {
      console.log(e.name + ' : ' + e.message);
    };

    /**
    * Opens or creates a persistent local file system
    * @memberOf FileIO
    * @function openfs
    */
    function openfs(){
        window.webkitRequestFileSystem(window.PERSISTENT, 50*1024*1024 /*50MB*/, _success, _errorHandler);
    };

    /**
    * Fills the list of loadable games from the file system
    * @public
    * @memberOf FileIO
    */
    function loadList(){
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
        function toArray(list) {
            return Array.prototype.slice.call(list || [], 0);
        };

        /**
        * List the loaded results, creating buttons for the loads
        * @param {array} list The array of save games available
        * @todo The list parameter here, and the one in {@link toArray} could be confused, we should consider changing one or the other
        */
        function listResults(list){
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
    * @public
    * @memberOf FileIO
    * @param {string} name The name of the save game to delete
    */
    function deleteGame(name){
        fs.root.getFile(name, {create: false}, function(fileEntry) {fileEntry.remove(function() {
                console.log(name + ' has been removed.');
                FileIO.loadList();
            }, _errorHandler);
        }, _errorHandler);
    };

    /**
    * Saves the game to filesystem
    * @public
    * @memberOf FileIO
    * @param {Object} Game Game object to save
    */
    function saveGame(Game){
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
    * @public
    * @memberOf FileIO
    * @param {Object} Game Game object (default) that will be loaded onto
    */
    function loadGame(Game){
        fs.root.getFile(Conf.inputSeed, {}, function(fileEntry) {
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function(e){
                    Conf.saveData(JSON.parse(this.result));
                };
                reader.readAsText(file);
            }, _errorHandler);
        }, _errorHandler);
    };


    /**
    * Exposed functions
    */
    return {
        openfs : openfs,
        loadList : loadList,
        deleteGame : deleteGame,
        saveGame : saveGame,
        loadGame : loadGame
    }
})();