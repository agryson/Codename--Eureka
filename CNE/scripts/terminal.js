"use strict";
/**
* Wraps the in-game terminal
* @namespace
*/
var Terminal = (function(){
    var terminal = {};
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
            Terminal.print(errText);
        } else if(err === 'command') {
            Terminal.print('"' + text + '"' + ' ' + TRANS.commandErr);
        } else {
            Terminal.print(text + ' ' + TRANS.consoleInputErr);
        }
    }

    /**
    * Prints provided text to the in-game console, functions as the notifications system
    * @public
    * @memberOf Terminal
    * @param {string} text Text to print
    */
    terminal.print = function(text){
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
    terminal.run = function(text){
        document.getElementById('consoleInput').value = '';
        Terminal.print(text);
        var input = text.split(" ");

        //switch(text)
        switch(input[0]){
            case TRANS.advance: //advance multiple turns
                if(!isNaN(input[1])){
                    CneTools.advanceTurns(input[1]);
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer);
                }
                break;
            case TRANS.hello:
                Terminal.print(TRANS.world);
                break;
            case TRANS.level:
                if(input[1] >= 0 || input[1] <= 4){
                    Conf.level = parseInt(input[1], 10);
                    CneTools.checkBuildings();
                    Display.drawRadar();
                    document.getElementById('slider').value = Conf.level;
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer, 0, 4);
                }
                break;
            case TRANS.home:
                if(Conf.home){
                    CneTools.moveTo(true, Conf.home[0], Conf.home[1], 0);
                } else {
                    Terminal.print(TRANS.setDown);
                }
                break;
            case TRANS.seed:
                Terminal.print(Conf.inputSeed);
                break;
            case TRANS.zoom:
                if(input[1] >= 1 || input[1] <= 6){
                    document.getElementById('zoom').value = input[1];
                    Display.zoom(input[1]);
                } else {
                    _error(input[1], 'value', input[0], TRANS.integer, 1, 6);
                }
                break;
            case TRANS.help:
                switch(input[1]){
                    case TRANS.advance:
                        Terminal.print(TRANS.advanceMan);
                        break;
                    case TRANS.hello:
                        Terminal.print(TRANS.helloMan);
                        break;
                    case TRANS.level:
                        Terminal.print(TRANS.levelMan);
                        break;
                    case TRANS.home:
                        Terminal.print(TRANS.home);
                        break;
                    case TRANS.seed:
                        Terminal.print(TRANS.seedMan);
                        break;
                    default:
                        Terminal.print(TRANS.helpMan);
                }
                break;
            default:
                _error(input[0], 'command');
        }
        document.getElementById('console').classList.add('console_open');
    }

    return terminal;
})();
