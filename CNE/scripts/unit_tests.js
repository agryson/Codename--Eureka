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
        var _tests = [
            _testTools
        ];
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
    * @param {string} title Name of teh test being run
    * @param {string} type Whether this is a normal test 'test' or the last test 'lastTest'
    */
    function assert(test, title, type){
        if(test){
            _ping(type + "$" + title + "$pass");
        } else {
            _ping(type + "$" + title + "$fail");
        }
    }


    /**
    * Tests the Tools namespace
    */
    function _testTools(){
        _ping("group$Testing Tools");
        assert((Tools.getMaxMin([1,100])[0] === 150 && Tools.getMaxMin([1,100])[1] === 0), 'getMaxMin with [1, 100]', 'lastTest');
        assert((Tools.getMaxMin([100,1000])[0] === 1050 && Tools.getMaxMin([100,1000])[1] === 100), 'getMaxMin with [100, 1000]', 'lastTest');
    }

    return {
        startTests: startTests
    }

})();