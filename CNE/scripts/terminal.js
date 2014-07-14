"use strict";
/**
* Wraps the in-game terminal
* @namespace
*/
var Terminal = (function(){
    var _commands = {
        advance: TRANS.advance,
        hello: TRANS.hello,
        level: TRANS.level,
        home: TRANS.home,
        seed: TRANS.seed,
        zoom: TRANS.zoom,
        help: TRANS.help
    }
    /**
    * In the event of bad input to the in-game console, prints the error message
    * @private
    * @memberOf Terminal
    * @param {string} text The erroneous console input
    * @param {string} err The error type
    * @param {string} [command] The command that was passed
    * @param {string} [fix] Proposed fix
    * @param {int} [lwrLimit] Lowest accepted value for this command
    * @param {int} [uprLimit] Highest accepted value for this command
    */
    function _error(text, err, command, fix, lwrLimit, uprLimit){
        if(err === 'value'){
            var errText = text + ' ' + TRANS.valueErr + ' "' + command + '"' + ', ' + fix;
            if(lwrLimit){
                errText += ' ' + TRANS.between + ' ' + lwrLimit + ' ' + TRANS.and + ' ' + uprLimit;
            }
            print(errText);
        } else if(err === 'command') {
            print('"' + text + '"' + ' ' + TRANS.commandErr);
        } else {
            print(text + ' ' + TRANS.consoleInputErr);
        }
    }

    /**
    * Prints provided text to the in-game console, functions as the notifications system
    * @public
    * @memberOf Terminal
    * @param {string} text Text to print
    */
    function print(text){
        if(!document.getElementById('console').classList.contains('console_open')){
            document.getElementById('console').classList.add('console_notif');
            setTimeout(function(){
                document.getElementById('console').classList.remove('console_notif');
            }, 2500);
        }
        var output = document.getElementById('consoleContent');
        var frag = document.createDocumentFragment();
        var input = document.createElement('span');
        var spacer = document.createElement('br');
        input.innerHTML = text;
        frag.appendChild(input);
        frag.appendChild(spacer);
        output.appendChild(frag);
        output.scrollTop = output.scrollHeight;
    }

    /**
    * Parses the provided string and runs appropriate command or throws appropriate error
    * @public
    * @memberOf Terminal
    * @param {string} text The text to parse and run
    */
    function run(text){
        document.getElementById('consoleInput').value = '';
        print(text);
        var input = text.split(" ");

        //switch(text)
        switch(input[0]){
            case _commands.advance: //advance multiple turns
                if(!isNaN(input[1])){
                    CneTools.advanceTurns(input[1]);
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer);
                }
                break;
            case _commands.hello:
                print(TRANS.world);
                break;
            case _commands.level:
                if(input[1] >= 0 || input[1] <= 4){
                    Conf.level = parseInt(input[1], 10);
                    CneTools.checkBuildings();
                    Display.drawRadar();
                    document.getElementById('slider').value = Conf.level;
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer, 0, 4);
                }
                break;
            case _commands.home:
                if(Conf.home){
                    CneTools.moveTo(true, Conf.home[0], Conf.home[1], 0);
                } else {
                    print(TRANS.setDown);
                }
                break;
            case _commands.seed:
                print(Conf.inputSeed);
                break;
            case _commands.zoom:
                if(input[1] >= 1 || input[1] <= 6){
                    document.getElementById('zoom').value = input[1];
                    Display.zoom(input[1]);
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer, 1, 6);
                }
                break;
            case _commands.help:
                switch(input[1]){
                    case TRANS.advance:
                        print(TRANS.advanceMan);
                        break;
                    case TRANS.hello:
                        print(TRANS.helloMan);
                        break;
                    case TRANS.level:
                        print(TRANS.levelMan);
                        break;
                    case TRANS.home:
                        print(TRANS.home);
                        break;
                    case TRANS.seed:
                        print(TRANS.seedMan);
                        break;
                    default:
                        print(TRANS.helpMan);
                }
                break;
            default:
                _error(input[0], 'command');
        }
        document.getElementById('console').classList.add('console_open');
    }

    /**
    * Searches available commands for something that matches input text, printing it to the console
    * @public
    * @memberOf Terminal
    * @param {string} text String to test for command matches
    */
    function autoComplete(text){      
        var candidates = [];
        for(var command in _commands) {
            if(command.substring(0, text.length) === text && text !== ""){
                candidates.push(command);
            }
        };
        if(candidates.length > 1){
            var helpString = "";
            for (var i = candidates.length - 1; i >= 0; i--) {
                helpString += candidates[i] + " ";
            };
            print(TRANS.didYouMean);
            print(helpString);
        } else if(candidates.length === 0){
            //Do nothing
        } else {
            document.getElementById('consoleInput').value = candidates[0];
        }
        setTimeout(function(){
            document.getElementById('consoleInput').focus();
            }, 10);
    }

    return {
        run: run,
        print: print,
        autoComplete: autoComplete
    }
})();
