"use strict";
/**
* All of the music functions
* @namespace Music
* @todo Move the music files etc. into a config
*/
var Music = (function(){
    var musicOn = true;
    var volume = 0.1;
    var track0 = new Audio('sound/Virus-Cured_Clearside.mp3');
    var track1 = new Audio('sound/Gone_Clearside.mp3');
    var track2 = new Audio('sound/Shapeless_Clearside.mp3');
    var track3 = new Audio('sound/Coma_Clearside.mp3');
    var currentTrack = track0;

    /**
    * Toggles music on or off
    * @memberOf Music
    */
    function toggleMusic(){
        if(!musicOn) {
            musicOn = true;
            jukebox.play();
        } else {
            musicOn = false;
            jukebox.pause();
        }
    }

    /**
    * Pauses music
    * @memberOf Music
    */
    function pause() {
        currentTrack.pause();
    }

    /**
    * Plays music
    * @memberOf Music
    */
    function play() {
        currentTrack.volume = volume;
        musicOn ? currentTrack.play() : currentTrack.pause();
    }

    /**
    * Sets volume to provided value
    * @memberOf Music
    * @param {float} val Desired volume level, from 0 to 1 (1 being 100%)
    */
    function setVolume(val){
        currentTrack.volume = val;
        volume = val;
    }

    //Sounds
    track0.addEventListener('ended', function() {
        this.currentTime = 0;
        track1.volume = volume;
        currentTrack = track1;
        track1.play();
    }, false);
    track1.addEventListener('ended', function() {
        this.currentTime = 0;
        track2.volume = volume;
        currentTrack = track2;
        track2.play();
    }, false);
    track2.addEventListener('ended', function() {
        this.currentTime = 0;
        track3.volume = volume;
        currentTrack = track3;
        track3.play();
    }, false);
    track3.addEventListener('ended', function() {
        this.currentTime = 0;
        track0.volume = volume;
        currentTrack = track0;
        track0.play();
    }, false);
    //!Sounds
    
    return {
        toggleMusic: toggleMusic,
        pause: pause,
        play: play,
        setVolume: setVolume
    } 
})();
