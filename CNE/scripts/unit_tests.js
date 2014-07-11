/**
* Wrapper for the Unit tests
* @namespace
* @todo create the assert function
*/
var Test = (function(){

    var _results = null;

    /**
    * Opens the test result window if it's not already open and kicks off the test suite
    * @public
    * @memberOf Test
    */
    function startTests(){
        if(chrome.app.window.getAll().length > 1){
            console.info("Tests have already been run on this instance.");
        } else {
            //Setup
            var world = new NewGame();
            try{
                FileIO.deleteGame("Running Tests");
            } catch (e){
                console.info("Seeing this is good:" + e);
            }
            document.getElementById('seed').value = "Running Tests";
            world.getSeed();
            //End Setup

            console.info("Opening Test Suite");
            chrome.app.window.create("CNE/test_results_pane.html",
                {
                    id:"testLog",
                    frame:"chrome"
                }, 
                function(resultWindow){
                    _results = resultWindow.contentWindow;
                    setTimeout(function(){
                        _ping("clear");
                        _ping("title$Starting Tests");
                        _ping("time$" + new Date());
                        _youMayBegin();
                    }, 200);
                });
        }

    };

    /**
    * Loops through the test groups one by one
    */
    function _youMayBegin(){
        for (var i = _tests.length - 1; i >= 0; i--) {
            _tests[i]();
        };
    }

    /**
    * Takes incoming message and passes it via postMessage to the results pane
    * @private
    * @memberOf Test
    * @param {string} message String formatted as type$message c.f. {@link TestResults.addToList}
    */
    function _ping(message){
        console.debug(message);
        _results.postMessage(message, '*');
    };

    /**
    * Asserts a value, if true, passes, if not, fails
    * @param {bool} test Function to test that should be posed to be a boolean (or at least truthy or falsy)
    * @param {string} title Name of the test being run
    * @param {string} type Whether this is a normal test 'test' or the last test 'lastTest'
    */
    function assert(test, title, type){
        if(test){
            _ping(type + "$&#x2713;&nbsp;" + title + "$pass");
        } else {
            _ping(type + "$&#x2717;&nbsp;" + title + "$fail");
        }
    }


    /**
    * Tests the Tools namespace
    */
    function _Tools(){
        _ping("group$Testing: Tools");
        //Test getMaxMin to ensure it returns appropriately scaled values
        var artMin = Math.floor(Math.random()*10);
        var artMax = Math.ceil(Math.random()*100 + 11);
        assert(
            (Tools.getMaxMin([[artMin,artMax]])[0] >= artMax + 1 && Tools.getMaxMin([[artMin,artMax]])[1] <= artMin),
            'getMaxMin with [' + artMin + ',' + artMax +'] returns ' + Tools.getMaxMin([[artMin,artMax]]), 
            'test'
            );
        //Test distance for a rounded value
        assert(
            (Tools.distance(0,0,2,2) === 3),
            'distance between 0,0 and 2,2',
            'lastTest');
    }

    function _generateWorld(){
        _ping("group$Testing: World Generation");
        assert(
        (Conf.map.length >= 1),
        'Conf exists',
        'test');
        assert(
        (Conf.map.length >= 1 && Conf.map[1].length >= 1 && Conf.map[1][1].length >= 1),
        'Map has 3 dimensions',
        'test');
    }

    var _tests = [
        _Tools,
        _generateWorld
    ];

    return {
        startTests: startTests
    }

})();