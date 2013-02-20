/*jslint node: true */
"use strict"; //this will break everything if there's any errors... that's a good thing
var Game; //Global so I can get at it from other scripts...
var Lang;
//CONSTRUCTORS**********************************************************************************************
/*Define our Constructors*/
function Construction() {
    /*
    Notes: I got rid of food because why would one building use more than another?! So it should become a global variable.
    Think about making tile[x][y][0] the terrain and tile[x][y][1] the construction
     */
    this.position = [150,150];
    this.kind = 3;
    this.exists = false;
    this.buildTime = -1;
    this.age = 0;
    this.health = 0;
    this.energy = 0;
    this.tossMorale = 0;
    this.hipMorale = 0;
    this.artMorale = 0;
    this.age = 0;
    this.air = 0;
    this.crime = 0;
    this.waste = 0;
    this.storage = 0;
    this.tossPop = 0;
    this.hipPop = 0;
    this.artPop = 0;

    this.future = [3, Lang.prepared];
    this.robot = -1;
}

function nextTurn(x, y, level){
    var tile = level[y][x][1];
    if(tile){
        if(tile.exists) {
            tile.age += 1;
        }
        if(tile.buildTime > 0) {
            tile.buildTime -= 1;
        } else if (tile.buildTime === 0){
            tile.buildTime = -1;
            tile.kind = tile.future[0];
            if(tile.robot >= 0){
                Game.robotsList[tile.robot][0] -= 1;
                tile.robot = -1;
            }
            level[y][x][0].ref = changeName(tile.future[1], level[y][x][0].ref);
            tile.exists = true;
        }
    }
}

function bobTheBuilder(kind, x, y, level){
    if(returnLevel(level)[y][x][0].kind !== 4){
        var o = new Construction();
        o.kind = 100;
        o.position = [level,x,y];
        if(kind >= 200){
            returnLevel(level)[y][x][0].ref = changeName(Lang.building + Game.buildings[kind - 200][3], returnLevel(level)[y][x][0].ref);
        }
    
        var eta = function(turns){
            if(returnLevel(level)[y][x][0].kind === 1 || returnLevel(level)[y][x][0].kind === 6) {
            return Math.floor(turns * 1.5);
        } else if(returnLevel(level)[y][x][0].kind === 2 || returnLevel(level)[y][x][0].kind === 7) {
            return Math.floor(turns * 2.4);
        } else {
            return turns;
        }
        };
    
        switch(kind){
            //Bots
            case 100:
                o.buildTime = eta(2);
                o.future = [3, Lang.prepared];
                returnLevel(level)[y][x][0].ref = changeName(Lang.preparing, returnLevel(level)[y][x][0].ref);
                o.robot = 0;
                Game.robotsList[0][0] += 1;
                reCount('dozer');
                break;
            case 101:
                o.kind = kind;
                o.buildTime = eta(2);
                o.future = [204, Lang.airlift];
                returnLevel(level)[y][x][0].ref = changeName(Lang.digging, returnLevel(level)[y][x][0].ref);
                o.robot = 1;
                Game.robotsList[1][0] += 1;
                reCount('digger');
                break;
            //Buildings
            case 200: //agridome
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -20;
                o.tossMorale = 1;
                o.hipMorale = 2;
                o.crime = 2;
                o.waste = 2;
                o.storage = 15;
                o.future = [kind, Lang.agri];
                break;
            case 201: //advanced agridome
                o.buildTime = eta(3);
                o.health = 90;
                o.energy = -25;
                o.tossMorale = 2;
                o.hipMorale = 4;
                o.artMorale = 1;
                o.crime = 1;
                o.waste = 1;
                o.storage = 20;
                o.future = [kind, Lang.agri2];
                break;
            case 202: //airport
                o.buildTime = eta(3);
                o.health = 60;
                o.energy = -15;
                o.tossMorale = -1;
                o.hipMorale = -2;
                o.crime = 3;
                o.waste = 1;
                o.storage = 15;
                o.air = -1;
                o.future = [kind, Lang.airport];
                break;
            case 203: //arp
                o.buildTime = eta(2);
                o.health = 80;
                o.energy = -60;
                o.tossMorale = 5;
                o.hipMorale = 5;
                o.crime = 2;
                o.storage = 2;
                o.air = 100;
                o.future = [kind, Lang.arp];
                break;
            case 204: //airshaft
                o.buildTime = eta(2);
                o.health = 50;
                o.energy = -5;
                o.storage = 1;
                o.future = [kind, Lang.airlift];
                break;
            case 205: //barracks
                o.buildTime = eta(2);
                o.health = 90;
                o.energy = -15;
                o.tossMorale = -5;
                o.hipMorale = -10;
                o.crime = -5;
                o.waste = 5;
                o.storage = 5;
                o.future = [kind, Lang.barracks];
                break;
            case 206: //civil protection
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -10;
                o.tossMorale = 1;
                o.hipMorale = 1;
                o.artMorale = 1;
                o.crime = -15;
                o.waste = 2;
                o.storage = 2;
                o.future = [kind, Lang.civprot];
                break;
            case 207: //civil protection 2
                o.buildTime = eta(3);
                o.health = 90;
                o.energy = -15;
                o.tossMorale = 2;
                o.hipMorale = 2;
                o.artMorale = 2;
                o.crime = -30;
                o.waste = 1;
                o.storage = 3;
                o.future = [kind, Lang.civprot2];
                break;
            case 208://comm array
                o.buildTime = eta(1);
                o.health = 60;
                o.energy = -10;
                o.hipMorale = -3;
                o.crime = 1;
                o.storage = 2;
                o.future = [kind, Lang.commarray];
                break;
            case 209://comm array 2
                o.buildTime = eta(2);
                o.health = 80;
                o.energy = -15;
                o.tossMorale = -1;
                o.hipMorale = -5;
                o.artMorale = 1;
                o.artMorale = 2;
                o.crime = 2;
                o.storage = 2;
                o.future = [kind, Lang.commarray2];
                break;
            case 210://command
                o.buildTime = eta(2);
                o.health = 100;
                o.energy = -30;
                o.tossMorale = 5;
                o.hipMorale = 5;
                o.artMorale = 5;
                o.crime = -3;
                o.waste = 1;
                o.storage = 10;
                o.future = [kind, Lang.command];
                break;
            case 211: // connector
                o.buildTime = eta(1);
                o.health = 20;
                o.energy = -1;
                o.storage = 1;
                o.future = [kind, Lang.connector];
                break;
            case 212: // drone factory
                o.buildTime = eta(4);
                o.health = 80;
                o.energy = -100;
                o.tossMorale = -5;
                o.hipMorale = -10;
                o.artMorale = 5;
                o.crime = 2;
                o.waste = 5;
                o.storage = 30;
                o.future = [kind, Lang.dronefab];
                break;
            case 213: // fission
                o.buildTime = eta(4);
                o.health = 70;
                o.energy = 1500;
                o.tossMorale = -10;
                o.hipMorale = -20;
                o.artMorale = -5;
                o.crime = 3;
                o.waste = 8;
                o.storage = 5;
                o.future = [kind, Lang.chernobyl];
                break;
            case 214: // fusion
                o.buildTime = eta(5);
                o.health = 90;
                o.energy = 2500;
                o.tossMorale = 5;
                o.hipMorale = 5;
                o.artMorale = 5;
                o.waste = 3;
                o.storage = 5;
                o.future = [kind, Lang.tokamak];
                break;
            case 215: // factory
                o.buildTime = eta(3);
                o.health = 70;
                o.energy = -100;
                o.tossMorale = -5;
                o.hipMorale = -10;
                o.artMorale = 0;
                o.crime = 3;
                o.waste = 5;
                o.storage = 30;
                o.future = [kind, Lang.genfab];
                break;
            case 216: // geothermal
                o.buildTime = eta(4);
                o.health = 70;
                o.energy = 200;
                o.tossMorale = 5;
                o.hipMorale = 5;
                o.artMorale = 5;
                o.storage = 2;
                o.future = [kind, Lang.geotherm];
                break;
            case 217: // habitat
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -15;
                o.tossMorale = 2;
                o.hipMorale = 2;
                o.artMorale = 2;
                o.crime = 3;
                o.waste = 3;
                o.storage = 10;
                o.future = [kind, Lang.hab];
                break;
            case 218: // habitat 2
                o.buildTime = eta(3);
                o.health = 80;
                o.energy = -20;
                o.tossMorale = 4;
                o.hipMorale = 4;
                o.artMorale = 4;
                o.crime = 2;
                o.waste = 2;
                o.storage = 10;
                o.future = [kind, Lang.hab2];
                break;
            case 219: // habitat 3
                o.buildTime = eta(4);
                o.health = 90;
                o.energy = -25;
                o.tossMorale = 6;
                o.hipMorale = 6;
                o.artMorale = 6;
                o.crime = 1;
                o.waste = 1;
                o.storage = 15;
                o.future = [kind, Lang.hab3];
                break;
            case 220: // hospital
                o.buildTime = eta(3);
                o.health = 80;
                o.energy = -40;
                o.tossMorale = 10;
                o.hipMorale = 10;
                o.artMorale = 0;
                o.crime = 2;
                o.waste = 5;
                o.storage = 5;
                o.future = [kind, Lang.er];
                break;
            case 221: // mine
                o.buildTime = eta(2);
                o.health = 80;
                o.energy = -40;
                o.tossMorale = -2;
                o.hipMorale = -2;
                o.artMorale = -2;
                o.crime = 5;
                o.waste = 1;
                o.storage = 20;
                o.future = [kind, Lang.mine];
                break;
            case 222: // nursery
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -30;
                o.tossMorale = 5;
                o.hipMorale = 5;
                o.artMorale = 0;
                o.crime = 2;
                o.waste = 3;
                o.storage = 2;
                o.future = [kind, Lang.nursery];
                break;
            case 223: // ore processor
                o.buildTime = eta(2);
                o.health = 80;
                o.energy = -120;
                o.tossMorale = -15;
                o.hipMorale = -15;
                o.artMorale = -15;
                o.crime = 5;
                o.waste = 2;
                o.storage = 50;
                o.future = [kind, Lang.oreproc];
                break;
            case 224: // recreation center
                o.buildTime = eta(3);
                o.health = 60;
                o.energy = -20;
                o.tossMorale = 15;
                o.hipMorale = 15;
                o.artMorale = 5;
                o.crime = 5;
                o.waste = 2;
                o.storage = 50;
                o.future = [kind, Lang.rec];
                break;
            case 225: // recycler
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -80;
                o.tossMorale = 5;
                o.hipMorale = 10;
                o.artMorale = 5;
                o.crime = 3;
                o.waste = -25;
                o.storage = 30;
                o.future = [kind, Lang.recycler];
                break;
            case 226: // red light district
                o.buildTime = eta(2);
                o.health = 30;
                o.energy = -15;
                o.tossMorale = 25;
                o.hipMorale = 20;
                o.artMorale = 10;
                o.crime = 15;
                o.waste = 10;
                o.storage = 5;
                o.future = [kind, Lang.clichy];
                break;
            case 227: // research center
                o.buildTime = eta(3);
                o.health = 80;
                o.energy = -15;
                o.tossMorale = 2;
                o.hipMorale = 1;
                o.artMorale = 2;
                o.crime = 2;
                o.waste = 5;
                o.storage = 2;
                o.future = [kind, Lang.research];
                break;
            case 228: // research 2
                o.buildTime = eta(4);
                o.health = 60;
                o.energy = -20;
                o.tossMorale = 3;
                o.hipMorale = 2;
                o.artMorale = 3;
                o.crime = 1;
                o.waste = 3;
                o.storage = 3;
                o.future = [kind, Lang.research2];
                break;
            case 229: // solar farm
                o.buildTime = eta(2);
                o.health = 30;
                o.energy = 250;
                o.tossMorale = 4;
                o.hipMorale = 8;
                o.artMorale = 4;
                o.future = [kind, Lang.solar];
                break;
            case 230: // space port
                o.buildTime = eta(5);
                o.health = 80;
                o.energy = -80;
                o.tossMorale = 5;
                o.hipMorale = -5;
                o.artMorale = 0;
                o.crime = 5;
                o.waste = 2;
                o.storage = 20;
                o.future = [kind, Lang.space];
                break;
            case 231: // stasis block
                o.buildTime = eta(4);
                o.health = 100;
                o.energy = -40;
                o.crime = 5;
                o.waste = 1;
                o.storage = 15;
                o.future = [kind, Lang.stasis];
                break;
            case 232: // Storage Tanks
                o.buildTime = eta(1);
                o.health = 40;
                o.energy = -5;
                o.tossMorale = -3;
                o.hipMorale = -3;
                o.artMorale = -3;
                o.crime = 3;
                o.waste = 1;
                o.storage = 2000;
                o.future = [kind, Lang.store];
                break;
            case 233: // University
                o.buildTime = eta(2);
                o.health = 70;
                o.energy = -15;
                o.tossMorale = 10;
                o.hipMorale = 5;
                o.artMorale = 2;
                o.crime = -2;
                o.waste = 2;
                o.storage = 3;
                o.future = [kind, Lang.uni];
                break;
            case 234: // warehouse
                o.buildTime = eta(1);
                o.health = 40;
                o.energy = -5;
                o.tossMorale = -3;
                o.hipMorale = -3;
                o.artMorale = -3;
                o.crime = 3;
                o.waste = 1;
                o.storage = 150;
                o.future = [kind, Lang.warehouse];
                break;
            case 235: // windfarm
                o.buildTime = eta(3);
                o.health = 40;
                o.energy = 200;
                o.tossMorale = 2;
                o.hipMorale = 4;
                o.artMorale = 2;
                o.future = [kind, Lang.windfarm];
                break;
            case 236: // workshop
                o.buildTime = eta(3);
                o.health = 70;
                o.energy = -30;
                o.tossMorale = 5;
                o.hipMorale = -2;
                o.artMorale = 10;
                o.crime = 3;
                o.waste = 2;
                o.storage = 5;
                o.future = [kind, Lang.workshop];
                break;
            case 237: // lander
                o.kind = 237;
                o.buildTime = eta(0);
                o.health = 70;
                o.storage = 50;
                o.future = [kind, Lang.lander];
                returnLevel(level)[y][x][0].ref = changeName(Lang.lander, returnLevel(level)[y][x][0].ref);
                break;
            default:
                console.log("Bob can't build it... :( " + kind);
                return false;
        }
        return o;
    } else {
        notify(Lang.onWater);
    }
}

/**
 * The main object for a tile, tracking its kind, and state
 */

function Terrain() {
    /*
    this.kind; // 0=Smooth, 1=Rough, 2=Mountainous, 3=Prepared/MinedOut 4=Water 5=constructionAnimation
    this.altitude; //altitude
    this.UG;
    this.turns; //remembers how many turns are left to become a tile of the desired kind
    this.diggable;
    */
    this.resources = [];
    this.mining = false;
    var wip = false; //Work in Progress?
    var prepared = false;
    //this.ref;
    this.willBe = 3;
    this.willBeDiggable = false;
    //robots
    /*
    this.robotInUse;
    */
    //buildings
    this.health = 0;
    this.air = false;
    this.age = 0;
    this.exists = false; //does the building exist?
    /**
     * Calculates the next turn for the tile
     */
    this.nextTurn = function() {
        if(this.turns > 0) {
            this.turns -= 1;
        } else if(this.turns === 0) {
            if(this.robotInUse >= 0) {
                console.log(this.ref);
                Game.robotsList[this.robotInUse][0] -= 1;
                this.robotInUse = -1;
            }
            this.turns = false;
            this.wip = false;
            this.kind = 3; //terrain is prepared before putting anything else on it...
            switch(this.willBe) {
            case 1000:
                this.build(204, 50, 2); //obviously building an airshaft here...
                break;
            case 1100:
                this.build(221, 80, 2); //obviously building a mine... TODO: cahnge this to the mine ;)
                this.mining = true;
                break;
            case 3:
                this.kind = this.willBe;
                this.ref = changeName(Lang.prepared, this.ref);
                break;
            case 217:
                this.kind = this.willBe;
                this.ref = changeName(Lang.hab, this.ref);
                Game.housing += 10;
                break;
            default:
                this.kind = this.willBe;
                if(this.kind < 100) {
                    var names = [Lang.smooth, Lang.rough, Lang.mountainous, Lang.prepared];
                    this.ref = changeName(names[this.kind], this.ref);
                } else {
                    this.ref = changeName(Game.buildings[this.kind - 200][3], this.ref);
                }

            }
            this.diggable = this.willBeDiggable;
        }
        if(this.mining) {
            var stillMining = false;
            for(var ore in this.resources) {
                if(this.resources[ore] && this.resources[ore] > 0) {
                    stillMining = true;
                    var mined = Math.floor(Math.random() + 1);
                    this.resources[ore] -= mined;
                    Game.ores[ore] ? Game.ores[ore] += mined : Game.ores[ore] = 1;
                }
            }
            if(!stillMining) {
                this.mining = false;
            }
        }
        if(this.exists) {
            this.age += 1;
        }
    };

    /**
     * The 'dozing' function does everything necessary when we're dozing that terrain
     */
    this.prepare = function() {
        if(!prepared && !this.wip && this.diggable && Game.robotsList[0][0] < Game.robotsList[0][1]) {
            this.turns = eta(2, this.kind);
            this.kind = 100;
            this.wip = true; //tells us that work is in progress
            this.willBe = 3;
            this.robotInUse = 0;
            Game.robotsList[0][0] += 1;
            reCount('dozer');
            this.ref = changeName(Lang.preparing, this.ref);
        } else {
            notify(Lang.noDoze);
        }
    };

    /**
     * The 'dozing' function does everything necessary when we're dozing that terrain
     * @param  {int} x         X coordinate of tile to dig
     * @param  {int} y         Y coordinate of the tile to dig
     * @param  {Object} lowerTile The tile that is below this one
     */
    this.digDown = function(x, y, lowerTile) {

        if(Game.level < 4 && !wetTest([y, x], Game.level + 1) && lowerTile.kind !== 4 && !lowerTile.wip && this.diggable && Game.robotsList[1][0] < Game.robotsList[1][1] - 1) {
            this.willBe = 1000; //TODO: fix to be a real airlift...
            this.turns = eta(2, this.kind);
            this.kind = 101;
            this.ref = changeName(Lang.digging, this.ref);
            Game.robotsList[1][0] += 1;
            this.robotInUse = 1;
            this.digCavern(x, y, lowerTile, Game.level + 1, true, 1000);
            reCount('digger');
        } else {
            notify(Lang.noDig);
        }
    };

    /*digCavern takes the x & y coordinates of the clicked upon tile, the level (0-4) you want the cavern built on (to allow for digging down)
    a boolean 'nearWallKnown' (true if digging down, false otherwise) and a willBe tile type so that we can place a building (airshaft) if necessary*/
    /**
     * Digs a cavern at the given coordinates
     * @param  {int} x             X coordinate
     * @param  {int} y             Y coordinate
     * @param  {Object} tile          The tile to dig cavern at
     * @param  {int} level         What level we are on
     * @param  {boolean} nearWallKnown Do we know if we're near a wall/water or not?
     * @param  {int} willBe        The eventual type of this tile
     */
    this.digCavern = function(x, y, tile, level, nearWallKnown, willBe) {
        var nearWall = nearWallKnown;
        var adj;
        var free;
        for(var i = 0; i < 6; i++) {
            adj = returnLevel(level)[adjacent(x, y, i)[0]][adjacent(x, y, i)[1]][1];
            if(adj.diggable) {
                nearWall = true;
            }
        }
        if(!wetTest([y, x], level) && nearWall && !tile.wip && Game.robotsList[1][0] < Game.robotsList[1][1] && !this.exists) {
            Game.robotsList[1][0] += 1;
            tile.robotInUse = 1;
            reCount('digger');
            willBe >= 0 ? tile.willBe = willBe : tile.willBe = willBe + 5; //this is for if we try to do it on prepared terrain
            tile.wip = true;
            tile.turns = eta(2, this.kind);
            tile.kind = 101;
            tile.willBeDiggable = true;
            tile.ref = changeName(Lang.diggingCavern, tile.ref);
            for(var j = 0; j < 6; j++) {
                adj = returnLevel(level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1];
                if(adj.kind !== 4 && !wetTest(adjacent(x, y, j), level) && !adj.diggable && !adj.wip && adj.kind > 4 && !adj.exists) {
                    adj.turns = eta(2, adj.kind);
                    adj.willBe = adj.kind - 5;
                    adj.kind = 8;
                    adj.ref = changeName(Lang.diggingCavern, adj.ref);
                    adj.wip = true;
                    adj.willBeDiggable = true;
                }
            }
        } else {
            notify(Lang.noCavern);
        }
    };

    /**
     * The 'mining' function does everything necessary when we're mining that terrain
     * @param  {int} x         X coordinate
     * @param  {int} y         Y coordinate
     * @param  {Object} lowerTile The tile below this one
     */
    this.mine = function(x, y, lowerTile) {
        var wet = false;
        for(var i = 0; i < 6; i++) {
            if(wetTest(adjacent(x, y, i), Game.level)) {
                wet = true;
            }
        }
        if(Game.level < 4 && lowerTile.kind !== 4 && lowerTile.kind < 100 && !this.wip && this.diggable && !lowerTile.diggable && Game.robotsList[3][0] < Game.robotsList[3][1] && (this.mineable || lowerTile.mineable)) {
            Game.robotsList[3][0] += 1;
            this.robotInUse = 3;
            reCount('miner');
            this.turns = eta(5, this.kind);
            this.kind = 102;
            this.ref = changeName(Lang.mining, this.ref);
            this.wip = true;
            this.willBe = 1100;
            for(var j = 0; j < 6; j++) {
                var adj = returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1];
                if(adj.kind !== 4 && !wetTest(adjacent(x, y, j), Game.level) && !adj.wip && !adj.exists && adj.mineable) {
                    adj.turns = eta(5, this.kind);
                    adj.ref = changeName(Lang.mining, adj.ref);
                    adj.wip = true;
                    adj.willBeDiggable = true;
                    adj.willBe = 1100;
                    console.log("digging underground");
                }
                if(Game.level + 1 !== 4) {
                    adj = returnLevel(Game.level + 1)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1];
                    if(adj.kind !== 4 && !wetTest(adjacent(x, y, j), Game.level + 1) && !adj.diggable && !adj.wip && !adj.exists && adj.mineable) {
                        adj.turns = eta(5, this.kind);
                        adj.ref = changeName(Lang.mining, adj.ref);
                        adj.wip = true;
                        adj.willBeDiggable = true;
                        adj.willBe = 1100;
                    }
                }
            }
            if(lowerTile.mineable) {
                lowerTile.turns = eta(5, lowerTile.kind);
                lowerTile.wip = true;
                lowerTile.willBe = 1100;
                lowerTile.ref = changeName(Lang.mining, lowerTile.ref);
                lowerTile.willBeDiggable = true;
                lowerTile.kind = 102;
            }
        } else {
            notify(Lang.noMine);
        }
        //TODO: get the resources from this and adjacent tiles...
    };

    /**
     * The 'recycling' function does everything necessary when we're recycling that terrain
     */
    this.recycle = function() {
        if(!wip && this.kind !== 4 && Game.robotsList[3][0] < Game.robotsList[3][1]) {
            this.turns = eta(3, this.kind);
            this.kind = 103;
            this.ref = changeName(Lang.recycling, this.ref);
            this.wip = true;
            this.willBe = 3;
            Game.robotsList[3][0] += 1;
            this.robotInUse = 3;
            reCount('recycler');
        } else {
            notify(Lang.noRecycle);
        }
        //TODO: get the resources from the recycled building if I can...
    };

    /**
     * The 'building' function does everything necessary when we're building on that terrain
     * @param  {int} building The building type we want to build
     * @param  {int} health   the health of that building
     * @param  {int} turns    The turns it takes to build that building
     */
    this.build = function(building, health, turns) {
        console.log(building);
        if(this.kind === 3) {
            this.kind = 100; //TODO: replace with a construction animation
            /*
            if(this.UG) {
                this.willBe = building + 1; //TODO: if underground add 1 and have a different tile for underground ones...
            } else {
                this.willBe = building;
            }*/
            this.willBe = building;
            this.ref = changeName(Lang.building + Game.buildings[building - 200][3], this.ref);
            this.wip = true;
            this.health = health; //health of building
            this.turns = turns;
            this.exists = true;
            this.age = 0;
            if(turns === 0) {
                this.nextTurn();
            }
        }
    };

}

/**
 * Gives the number of turns necessary to build on a given terrain type
 * @param  {int} baseTurns The base number of turns taken to do something on that terrain
 * @param  {int} kind      The kind of tile we're dealing with
 * @return {int}
 */
/*
function eta(baseTurns, kind) {
    //calculates the turns necessary to do something on this terrain
    if(kind === 1 || kind === 6) {
        return Math.floor(baseTurns * 1.5);
    } else if(kind === 2 || kind === 7) {
        return Math.floor(baseTurns * 2.4);
    } else {
        return baseTurns;
    }
}
//GENERAL SETUP AND TOOLS**********************************************************************************************
/**
 * The main game object
 */

function Param() {
    //Radar related vars...
    this.radarRad = 150; //this is the radius of the map that we want, changing it here should change it everywhere except the html
    //The zoomed in map related thigs...
    this.destinationWidth = 120;
    this.destinationHeight = 140;
    //this.xLimit = Math.ceil(document.width / 90);
    //this.yLimit = Math.ceil(document.height / 78);
    this.highlight = false;
    this.retX = this.radarRad;
    this.retY = this.radarRad;
    this.animate = 0;
    this.augment = true;

    this.tileHighlight = new Image();
    this.tileHighlight.src = 'images/tools.png';
    this.drones = new Image();
    this.drones.src = 'images/drones.png';
    this.constructions = new Image();
    this.constructions.src = 'images/buildings.png';
    this.terrain = new Image();
    this.terrain.src = 'images/terrain.png';

    this.clickedOn = 'none';
    this.level = 0;

    this.music = new Audio('sound/spacial_winds_ambient_electronic.mp3');
    this.musicOn = true;
    /*
    this.mouseX;
    this.mouseY;
    */
    //General game stuff
    this.turnNum = document.getElementById('turnNumber');
    this.turn = 0;
    this.map = [];
    this.map1 = [];
    this.map2 = [];
    this.map3 = [];
    this.map4 = [];
    //I <3  Sublime Text 2's multiple cursors!!!
    /**
     * [[string: 'id of menu option', boolean: available to player?, int: surface(0)/subsurface(1)/both(2)]]
     * @type {Array}
     */
    this.buildings = [
        ["agri", false, 0, Lang.agri], //
        ["agri2", false, 0, Lang.agri2],
        ["airport", false, 0, Lang.airport],
        ["arp", false, 2, Lang.arp], //
        ["airlift", false, 2, Lang.airlift], //
        ["barracks", false, 1, Lang.barracks],
        ["civprot", false, 2, Lang.civprot],
        ["civprot2", false, 2, Lang.civprot2],
        ["commarray", false, 0, Lang.commarray], //
        ["commarray2", false, 0, Lang.commarray2],
        ["command", false, 2, Lang.command], //
        ["connector", false, 2, Lang.connector], //
        ["dronefab", false, 0, Lang.dronefab],
        ["chernobyl", false, 0, Lang.chernobyl],
        ["tokamak", false, 0, Lang.tokamak],
        ["genfab", false, 0, Lang.genfab], //
        ["geotherm", false, 1, Lang.geotherm],
        ["hab", false, 1, Lang.hab], //
        ["hab2", false, 1, Lang.hab2],
        ["hab3", false, 1, Lang.hab3],
        ["er", false, 1, Lang.er],
        ["mine", false, 2, Lang.mine],
        ["nursery", false, 1, Lang.nursery],
        ["oreproc", false, 0, Lang.oreproc], //
        ["rec", false, 1, Lang.rec],
        ["recycler", false, 0, Lang.recycler],
        ["clichy", false, 1, Lang.clichy], //
        ["research", false, 2, Lang.research], //
        ["research2", false, 2, Lang.research2],
        ["solar", false, 0, Lang.solar],
        ["space", false, 0, Lang.space],
        ["stasis", false, 1, Lang.stasis],
        ["store", false, 2, Lang.store], //
        ["uni", false, 1, Lang.uni],
        ["warehouse", false, 2, Lang.warehouse], //
        ["windfarm", false, 0, Lang.windfarm], //
        ["workshop", false, 1, Lang.workshop], //
        ["lander", true, 0, Lang.lander]
    ];
    /**
     * List of robots
     * [[int: inUse, int: totalAvailable, string: 'idString', boolean: availableToPlayer, int: surface(0)/subsurface(1)/both(2)]]
     * @type {Array}
     */
    this.robotsList = [
        [0, 5, "dozer", false, 2], //
        [0, 3, "digger", false, 2], //
        [0, 1, "cavernDigger", false, 1], //
        [0, 3, "miner", false, 2], //
        [0, 1, "recycler", false, 2]
    ];

    this.ores = [];

    //Map generation vars
    this.seeder = '';
    /*
    this.rng;
    this.noise;
    this.noise2;
    this.noise3;
    */
    //General canvas vars...
    this.mPanCanvas = document.getElementById('mPanOverlay');
    this.mPanLoc = document.getElementById('mPanOverlay').getContext('2d');
    this.mPanelCanvas = document.getElementById('mainPanel');
    this.mPanel = document.getElementById('mainPanel').getContext('2d');
    this.radarCanvas = document.getElementById('mapOverlay');
    this.radar = document.getElementById('map').getContext('2d');
    this.radarLoc = document.getElementById('mapOverlay').getContext('2d');

    //Stats
    this.housing = 0;
    this.tossPop = 50;
    this.hipPop = 50;
    this.artPop = 50;
    this.sdf = 150;
}

/**
 * Initialize the game
 */

window.onload = function init() {
    Lang = new Lang();
    eavesdrop();
};

function eavesdrop() {
    //Start Screen
    document.getElementById('login').onclick = function() {
        Game = new Param(); //TODO: Should add save and load game code here...
        checkBuildings();
        reCount('all');
        getSeed(false);
    };
    document.getElementById('newSession').onclick = function() {
        Game = new Param(); //TODO: Should add save and load game code here...
        checkBuildings();
        reCount('all');
        getSeed(true);
    };
    //!Start Screen
    //Sound
    var radioCheck = document.getElementById('musicOptionViz');
    radioCheck.onclick = function() {
        radioCheck.classList.toggle('checkbox_checked');
        if(!Game.musicOn) {
            Game.musicOn = true;
            music();
        } else {
            Game.musicOn = false;
            music();
        }
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
        getMousePos(Game.mPanCanvas, evt, true); //tracker
    };
    mainMap.onmouseover = function() {
        Game.highlight = true;
    };
    mainMap.onmouseout = function() {
        Game.mPanLoc.clearRect(0, 0, document.width, document.height + 50);
    };
    mainMap.onclick = function() {
        clicked();
    };
    //should consider having zoom on the radar instead of the main map or storing the retX retY for a second or two
    var blocked = false;
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
                var yTemp = Game.retY - Math.round(Game.yLimit / 2) + getTile('y') + 2;
                var xTemp = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
                Game.retY = yTemp;
                Game.retX = xTemp;
            };
        if(event.wheelDelta > 0 && val < zoomMax) {
            console.log(blocked);
            if(!blocked) {
                setRet();
            }
            zoom(val + 1);
            zoomPos.value = val + 1;
        } else if(event.wheelDelta < 0 && val > 1) {
            if(!blocked) {
                setRet();
            }
            zoom(val - 1);
            zoomPos.value = val - 1;
        }
        return false;
    };
    //!Canvas Map
    //Level Slider
    var levelSlider = document.getElementById('slider');
    levelSlider.onchange = function() {
        changeLevel(levelSlider.value);
    };
    //!Level Slider
    window.onresize = function() {
        mapFit(true);
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
        Game.highlight = false;
        Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    };
    var radarMap = document.getElementById('mapOverlay');
    radarMap.onclick = function(evt) {
        getMousePos(Game.radarCanvas, evt);
        Game.highlight = false;
        jump();
    };
    radarMap.onmouseover = function() {
        Game.highlight = false;
    };
    radarMap.onmouseout = function() {
        Game.radarCanvas.onmousemove = null;
    };
    window.oncontextmenu = function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        rightClicked();
        return false;
    };

    //Left Menu
    var leftMenu = document.getElementById('menuWrap');
    leftMenu.onmouseover = function() {
        leftMenu.classList.remove('left_menu_hide');
        leftMenu.classList.add('left_menu_show');
        leftMenu.classList.add('menu_visible');
        leftMenu.classList.remove('menu_hidden');
    };
    leftMenu.onmouseout = function() {
        leftMenu.classList.remove('left_menu_show');
        leftMenu.classList.add('left_menu_hide');
        leftMenu.classList.remove('menu_visible');
        leftMenu.classList.add('menu_hidden');
    };
    //!Left Menu
    //Executive Drop-Down Menu
    var exec = document.getElementById('execDropDown');
    var execDrop = document.getElementById('execDropDownContainer');
    var execBtnContainer = document.getElementById('execBtnContainer');
    var execButton = document.getElementById('execButton');
    execBtnContainer.onclick = function() {
        menu(exec, execButton, 'exec_hidden');
    };
    exec.onmouseout = function() {
        if(execButton.classList.contains('arrow_down')) {
            exec.classList.remove('menu_visible');
            exec.classList.add('menu_hidden');
        } else {
            exec.classList.remove('menu_hidden');
            exec.classList.add('menu_visible');
        }
    };
    exec.onmouseover = function() {
        if(execButton.classList.contains('arrow_down')) {
            exec.classList.add('menu_visible');
            exec.classList.remove('menu_hidden');
        }
    };
    document.getElementById('globalReport').onclick = function() {
        menu(exec, execButton, 'exec_hidden');
    };
    //!Executive Drop Down
    //
    //Global Menu
    var settings = document.getElementById('settingsContainer');
    var setBtn = document.getElementById('settings');
    var mail = document.getElementById('mailContainer');
    var mailBtn = document.getElementById('mail');
    setBtn.onclick = function() {
        settings.classList.toggle('global_container_hidden');
    };
    mailBtn.onclick = function() {
        mail.classList.toggle('global_container_hidden');
    };

    var menu = function(containerIn, buttonIn, hideClass) {
            var container = containerIn;
            var button = buttonIn;
            if(button.classList.contains('arrow_down')) {
                container.classList.add('menu_visible');
                container.classList.remove('menu_hidden');
            } else {
                container.classList.remove('menu_visible');
                container.classList.add('menu_hidden');
            }
            container.classList.toggle(hideClass);
            button.classList.toggle('arrow_down');
            button.classList.toggle('arrow_up');

        };
    document.getElementById('turn').onclick = function() {
        var x;
        var y;
        Game.turn += 1;
        for(y = 0; y < Game.radarRad * 2; y++) {
            for(x = 0; x < Game.radarRad * 2; x++) {
                for(var l = 0; l < 5; l++) {
                    // TEST temp test code
                    //try{
                      //  returnLevel(l)[y][x][0].nextTurn();
                   // }
                    //catch(e){
                        nextTurn(x, y, returnLevel(l));
                    //}
                }
            }
        }
        Game.sdf = (Game.artPop + Game.hipPop + Game.tossPop) - Game.housing;
        drawRadar();
        Game.turnNum.innerHTML = "Week: " + Game.turn;
        reCount('all');
        //The following hold code just prevents accidentally skipping two turns with accidental clicks...
        document.getElementById('turn').disabled = true;
        setTimeout(function() {
            document.getElementById('turn').disabled = false;
        }, 300);
    };
    document.getElementById('zoom').onchange = function() {
        var zoomLevel = document.getElementById('zoom').value;
        zoom(zoomLevel);
    };
}

function music() {
    Game.musicOn ? Game.music.play() : Game.music.pause();
}

function zoom(zoomLevel) {
    Game.destinationWidth = zoomLevel * 6 * 6;
    Game.destinationHeight = zoomLevel * 7 * 6;
    mapFit();
}

//TODO: Clean this up! :-S

function mapFit(bool) {
    console.log('I\'m refitting!');
    var quarterHeight = Math.floor(Game.destinationHeight * 0.25);
    if(bool) {
        var overlay = document.getElementById('mPanOverlay');
        var mainMap = document.getElementById('mainPanel');

        //Nasty stuff... hence we use the if to touch this as little as possible
        overlay.width = window.innerWidth + Game.destinationWidth;
        overlay.height = window.innerHeight + quarterHeight * 2;
        overlay.style.top = -quarterHeight + 'px';
        overlay.style.left = -Game.destinationWidth / 2 + 'px';
        mainMap.width = window.innerWidth + Game.destinationWidth; //Maybe avoid using screen, as we're not *certain* we'll be fullscreen, even if that's the permission we'll ask for
        mainMap.height = window.innerHeight + quarterHeight * 2;
        mainMap.style.top = -quarterHeight + 'px';
        mainMap.style.left = -Game.destinationWidth / 2 + 'px';
    }
    Game.xLimit = Math.floor(Game.mPanCanvas.width / Game.destinationWidth);
    Game.yLimit = Math.floor(Game.mPanCanvas.height / (quarterHeight * 3));
    Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    drawTile(0, getTile('x'), getTile('y'), Game.tileHighlight, Game.mPanLoc);

    //Messy stuff...
    if(Game.retY - Game.yLimit / 2 < 0) {
        Game.retY = Math.ceil(Game.retY - (Game.retY - Game.yLimit / 2));
    } else if(Game.retY + Game.yLimit / 2 > Game.radarRad * 2) {
        Game.retY = Math.floor(Game.retY - Game.yLimit / 2);
    }
    if(Game.retX - Game.xLimit / 2 < 0) {
        Game.retX = Math.ceil(Game.retX - (Game.retX - Game.xLimit / 2));
    } else if(Game.retX + Game.xLimit / 2 > Game.radarRad * 2) {
        Game.retX = Math.floor(Game.retX - Game.xLimit / 2);
    }
    if(Game.yLimit % 2 === 0) {
        Game.yLimit += 1;
    }
    drawRadar();
    drawLoc();
}

/**
 * Checks which buildings are available to the player and
 * populates the sidebar with those buildings
 */

function checkBuildings() {
    for(var thing in Game.buildings) {
        var idString = Game.buildings[thing][0];
        var elem = document.getElementById(idString);
        if(Game.buildings[thing][1]) {
            if(elem.style.display === 'none' || elem.style.display === '') {
                elem.style.display = 'table';
            }
            switch(Game.buildings[thing][2]) {
            case 0:
                if(Game.level === 0) {
                    elem.classList.add('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = null;
                }
                break;
            case 1:
                if(Game.level > 0) {
                    elem.classList.add('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = construct;
                } else {
                    elem.classList.remove('active');
                    document.getElementById(Game.buildings[thing][0]).onclick = null;
                }
                break;
            default:
                elem.classList.add('active');
                document.getElementById(Game.buildings[thing][0]).onclick = construct;
            }
        } else {
            elem.style.display = 'none';
            console.log(elem.style.display);
            if(Game.clickedOn === idString) {
                Game.clickedOn = 'none';
                document.body.style.cursor = "url('images/pointers/pointer.png'), default";
            }
        }
    }
    checkRobots();
}

function checkRobots() {
    for(var r2d2 in Game.robotsList) {
        var wallE = Game.robotsList[r2d2];
        var idString = wallE[2];
        var c3po = document.getElementById(idString);
        if(wallE[3]) {
            if(c3po.style.display !== 'table') {
                c3po.style.display = 'table';
            }
            switch(wallE[4]) {
            case 0:
                if(Game.level === 0) {
                    c3po.classList.add('active');
                    c3po.onclick = construct;
                } else {
                    c3po.classList.remove('active');
                    c3po.onclick = null;
                }
                break;
            case 1:
                if(Game.level > 0) {
                    c3po.classList.add('active');
                    c3po.onclick = construct;
                } else {
                    c3po.classList.remove('active');
                    c3po.onclick = null;
                }
                break;
            default:
                c3po.classList.add('active');
                c3po.onclick = construct;
            }
            if(wallE[1] - wallE[0] === 0) {
                c3po.classList.remove('active');
                c3po.onclick = null;
                document.getElementById(wallE[2]).style.background = '#000';
                if(Game.clickedOn === idString) {
                    Game.clickedOn = 'none';
                    document.body.style.cursor = "url('images/pointers/pointer.png'), default";
                }
            }
        }
    }
    //special case for digger
    if(Game.robotsList[1][1] - Game.robotsList[1][0] <= 1) {
        var rob = document.getElementById(Game.robotsList[1][2]);
        rob.classList.remove('active');
        rob.onclick = null;
        rob.style.background = '#000';
        if(Game.clickedOn === 'digger' || (Game.clickedOn === 'cavernDigger' && Game.robotsList[1][1] - Game.robotsList[1][0] === 0)) {
            Game.clickedOn = 'none';
            document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        }
        if(Game.robotsList[1][1] - Game.robotsList[1][0] === 0) {
            var cavDig = document.getElementById('cavernDigger');
            cavDig.classList.remove('active');
            cavDig.onclick = null;
            cavDig.style.background = '#000';
        }
    }
}

/**
 * Provides notifications to the user
 * @param  {string} notif The notification to send
 */

function notify(notif) {
    var notification = document.getElementById('notifications');
    //var test = new JSON;
    //test.src = "../strings/strings.jsonp";
    //var notifString = JSON.parse(warnings);
    notification.innerHTML = notif;
    notification.style.width = 700 + 'px';


    /*
    var notification = document.getElementById('notifications');
    notification.innerHTML = '';
    notification.innerHTML = notif;
    notification.style.width = 700 + 'px';
    */
    setTimeout(

    function() {
        notification.style.width = 0;
    }, 2800);
}

/**
 * Generates a random number, from a base value
 * @param  {int} num is the modifier
 * @param  {int} min is the base value
 * @return {int}
 */

function randGen(num, min) {
    return Math.floor(Math.random() * num) + min;
}

/**
 * Changes level from an input (slider etc.)
 * @param  {int} newLevel the level we would change to
 */

function changeLevel(newLevel) {
    Game.level = parseInt(newLevel, 10);
    checkBuildings();
    drawRadar();
}

/**
 * Recounts the number of bots available and updates the counter bars appropriately
 * @param  {string} which is the type of robot we're dealing with
 */

function reCount(which) {
    var count = function(id, numID, index) {
            document.getElementById(id).style.height = ((Game.robotsList[index][1] - Game.robotsList[index][0]) / Game.robotsList[index][1]) * 100 + '%';
            document.getElementById(numID).innerHTML = 'Available: ' + (Game.robotsList[index][1] - Game.robotsList[index][0]);
        };
    switch(which) {
    case 'dozer':
        count('dozerCount', 'dozerCountNum', 0);
        break;
    case 'digger':
        count('diggerCount', 'diggerCountNum', 1);
        count('cavernDiggerCount', 'cavernDiggerCountNum', 1);
        break;
    case 'miner':
        count('minerCount', 'minerCountNum', 3);
        break;
    case 'recycler':
        count('recyclerCount', 'recyclerCountNum', 4);
        break;
    case 'all':
        count('dozerCount', 'dozerCountNum', 0);
        count('diggerCount', 'diggerCountNum', 1);
        count('cavernDiggerCount', 'cavernDiggerCountNum', 1);
        count('minerCount', 'minerCountNum', 3);
        count('recyclerCount', 'recyclerCountNum', 4);
        break;
    default:
        console.log("Wait, I've lost count of the drones...");
    }
    checkRobots();
}

/**
 * resizes the left menus on mouse drag
 * @param  {boolean} bool check to see if we should be resizing
 */

function leftMenuResize(bool) {
    if(bool) {
        document.getElementById('leftMenu').onmousemove = resize;
    } else {
        document.getElementById('leftMenu').onmousemove = null;
    }
}

/**
 * manages the actual values for the resize (see leftMenuResize)
 */

function resize(e) {
    var current = e.clientY - 10;
    var total = window.innerHeight;
    var percentage = Math.round((current / total) * 100);
    if(percentage < 10) {
        percentage = 11;
        leftMenuResize(false);
    } else if(percentage > 90) {
        percentage = 89;
        leftMenuResize(false);
    }
    document.getElementById('buildingContainer').style.height = percentage + '%';
    document.getElementById('droneContainer').style.height = 100 - percentage + '%';
    document.getElementById('leftMenuSlider').style.marginTop = percentage + '%';
}

/**
 * The main game loop
 */

function mainLoop() {
    var N = 22; //Number of animation frames from 0 e.g. N=1 is the same as having two images which swap...
    Game.augment ? Game.animate += 1 : Game.animate -= 1;
    if(Game.animate === 0 || Game.animate === N) {
        Game.augment ? Game.augment = false : Game.augment = true;
    }
}

/**
 * reacts to keyboard input appropriately
 * @param  {Object} e
 */

function keypressed(e) {
    switch(e.keyCode) {
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
        drawRadar();
        break;
    case 48:
        Game.level = 0;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    case 49:
        Game.level = 1;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    case 50:
        Game.level = 2;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    case 51:
        Game.level = 3;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    case 52:
        Game.level = 4;
        checkBuildings();
        drawRadar();
        document.getElementById('slider').value = Game.level;
        break;
    case 27:
        document.getElementById(Game.clickedOn).style.background = '#000';
        Game.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
        break;
    default:
        console.log("Uhm... that key doesn't do anything... ");
        break;
    }
}

/**
 * Gets the mouse position on the main canvas
 * @param  {Object} canvas
 * @param  {Event} evt
 */

function getMousePos(canvas, evt, onMap) {
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while(obj && obj.tagName != 'BODY') {
        top += obj.offsetTop - 10;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }

    // return relative mouse position
    Game.mouseX = evt.clientX - left + window.pageXOffset + Game.destinationWidth / 2;
    Game.mouseY = evt.clientY - top + window.pageYOffset;
}

/**
 * Depending on the key pressed, changes the reference reticule
 *and then redraws the maps and radar
 * @param  {string} dir is the direction to move
 */

function move(dir) {
    var upY = Game.retY - 2;
    var downY = Game.retY + 2;
    var leftX = Game.retX - 1;
    var rightX = Game.retX + 1;
    switch(dir) {
    case 'up':
        if(upY >= (Game.yLimit / 2)) {
            Game.retY = upY;
        }
        break;
    case 'down':
        if(downY <= (Game.radarRad * 2) - (Game.yLimit / 2)) {
            Game.retY = downY;
        }
        break;
    case 'left':
        if(leftX >= (Game.xLimit / 2)) {
            Game.retX = leftX;
        }
        break;
    case 'right':
        if(leftX < (Game.radarRad * 2) - (Game.xLimit / 2) - 2) {
            Game.retX = rightX;
        }
        break;
    case 'level':
        Game.level == 4 ? Game.level = 0 : Game.level += 1;
        checkBuildings();
        document.getElementById('slider').value = Game.level;
        break;
    default:
        break;
    }
    drawLoc();
    drawRadar();
}

/**
 * Returns the adjacent tile reference in y and x (inverted for historical reasons)
 * @param  {int} x
 * @param  {int} y
 * @param  {int} index Which tile are we checking? 0 for top left then count up
 * clockwise
 * @return {array}
 */

function adjacent(x, y, index) {
    if(y % 2 === 0) {
        index += 6;
    }
    switch(index) {
    case 0:
        return [y + 1, x - 1];
    case 1:
    case 6:
        return [y + 1, x];
    case 2:
    case 8:
        return [y, x + 1];
    case 3:
    case 10:
        return [y - 1, x];
    case 4:
        return [y - 1, x - 1];
    case 5:
    case 11:
        return [y, x - 1];
    case 7:
        return [y + 1, x + 1];
    case 9:
        return [y - 1, x + 1];
    default:
        console.log('There was a problem jim, x:' + x + ' y:' + y + ' index:' + index);
    }
}

/**
 * Checks if any adjacent tiles are wet
 * @param  {array} yxArrayIn is an array of the y & x coordinates of the tile to test
 * @param  {int} level provides the level to test on
 * @return {boolean}
 */

function wetTest(yxArrayIn, level) {
    var yxArray = yxArrayIn.slice(0);
    for(var i = 0; i < 6; i++) {
        var tileToTest = returnLevel(level)[adjacent(yxArray[1], yxArray[0], i)[0]][adjacent(yxArray[1], yxArray[0], i)[1]][0];
        if(tileToTest.kind === 4) {
            return true;
        }
    }
    return false;
}

/**
 * returns the distance of the given point from the centrepoint
 * @param  {int} x1
 * @param  {int} y1
 * @param  {int} x2
 * @param  {int} y2
 * @return {float}
 */

function distance(x1, y1, x2, y2) {
    return Math.round(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
}
/**
 * Random walk function for "clumpy" randomness
 * @return {int}
 */

function randWalk() {
    var walk = Math.floor(Math.random() * 3);
    switch(walk) {
    case 0:
        return -1;
    case 1:
        return 0;
    case 2:
        return 1;
    default:
        break;
    }
}

/*Get the tile x or y value for the tile the mouse is currently over*/
/**
 * Gets the x or y value for the currently moused over tile
 * @param  {string} axis Which axis are we working with?
 * @return {int}
 */

function getTile(axis) {
    var x, y, yDiff, xDiff, left, right;

    //set the general cases
    y = Math.floor(Game.mouseY / (Game.destinationHeight * 0.75));

    y % 2 !== 0 ? x = Math.floor((Game.mouseX - Game.destinationWidth / 2) / Game.destinationWidth) : x = Math.floor(Game.mouseX / Game.destinationWidth);

    //corner case code
    yDiff = (Game.mouseY / (Game.destinationHeight * 0.75)) - y;
    if(yDiff < 0.33) { //If we're in the top third of the reference rectangle
        //tells which intermediate block we're in...
        if(y % 2 !== 0) {
            xDiff = ((Game.mouseX - Game.destinationWidth / 2) / Game.destinationWidth - x);
            //I now do some basic Pythagoras theorem to figure out which hexagon I'm in
            //Are we on the left or right hand side of the top third?
            if(xDiff < 0.5) {
                left = 0.5 - xDiff; //Adjust to get the opposite length of the 60° internal angle
                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) { //I multiply by 10 so that I'm not dealing with numbers less than 1
                    y -= 1; //change the reference appropriately
                }
            } else { //rinse repeat for all cases
                right = xDiff - 0.5;
                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                    x += 1;
                }
            }

        } else {
            xDiff = (Game.mouseX / Game.destinationWidth - x);
            if(xDiff < 0.5) {
                left = 0.5 - xDiff;
                if(left * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                    x -= 1;
                }
            } else {
                right = xDiff - 0.5;
                if(right * 10 > yDiff * 10 * Math.tan(Math.PI / 3)) {
                    y -= 1;
                }
            }
        }

    }
    if(axis === 'x') { //return the appropriate tile axis reference
        return x;
    } else {
        return y;
    }
}

/**
 * When the radar is clicked, moves the map to that location
 */

function jump(bool) {
    Game.retX = Math.floor(Game.mouseX - Game.destinationWidth / 2);
    Game.retY = Game.mouseY - 20;
    mapFit();
    drawLoc();
}

/**
 * Returns the map array for the inputted level
 * @param  {int} level Which level to get the map for
 * @return {array}
 */

function returnLevel(level) {
    switch(level) {
    case 0:
        return Game.map;
    case 1:
        return Game.map1;
    case 2:
        return Game.map2;
    case 3:
        return Game.map3;
    case 4:
        return Game.map4;
    default:
        console.log('There was a problem with the level... ' + level);
    }
}

//MAPS**********************************************************************************
/**
 * Draws the radar properly
 */

function drawRadar() {
    var radarPixels = Game.radar.createImageData(Game.radarRad * 2, Game.radarRad * 2);
    var surfaceColor = [
        [212, 197, 174, 255],
        [201, 179, 165, 255],
        [211, 206, 203, 255],
        [0, 132, 0, 255],
        [108, 168, 204, 255]
    ]; //rgba of terrain 0,1,2,3,4
    var ugColor = [
        [112, 97, 74, 255],
        [101, 79, 65, 255],
        [111, 106, 103, 255],
        [0, 32, 0, 255],
        [8, 68, 104, 255]
    ]; //rgba of terrain 0,1,2,3,4
    var other = [0, 180, 0, 255];

    for(var x = 0; x < radarPixels.width; x++) {
        for(var y = 0; y < radarPixels.height; y++) {
            // Index of the pixel in the array
            var idx = (x + y * radarPixels.width) * 4;
            var kind = returnLevel(Game.level)[y][x][0].kind;
            for(var i = 0; i < 4; i++) {
                if(kind < 4 && kind >= 0) {
                    radarPixels.data[idx + i] = surfaceColor[kind][i];
                } else if(kind > 4 && kind < 8) {
                    radarPixels.data[idx + i] = ugColor[kind - 5][i];
                } else if(kind === 4) {
                    Game.level !== 0 ? radarPixels.data[idx + i] = ugColor[4][i] : radarPixels.data[idx + i] = surfaceColor[4][i];
                } else {
                    radarPixels.data[idx + i] = other[i];
                }
            }
        }
    }
    Game.radar.putImageData(radarPixels, 0, 0);
    Game.level === 0 ? Game.radar.fillStyle = "#000000" : Game.radar.fillStyle = "#ffffff";
    Game.radar.font = "14px Arial";
    Game.radar.fillText('Depth: ' + Game.level * 50 + 'm', 215, 298);
}

/**
 * accepts the kind of tile to draw, the x column number and the y column number, then draws it
 * @param  {int} tileType  type of tile to draw
 * @param  {int} tilePosX  Tile's x coordinate
 * @param  {int} tilePosY  Tile's y coordinate
 * @param  {boolean} highlight Whether or not we should highlight the tile
 * @param  {boolean} darkness  Whether or not we should darken this tile
 */

function drawTile(tileType, tilePosX, tilePosY, source, destination, animateIt) {
    var sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY; //Canvas vars
    sourceWidth = 216; //original tile width
    sourceHeight = 252; //original tile height
    destinationY = Math.floor(tilePosY * Game.destinationWidth * 0.86); //shift it, the number here is a constant that depends on the hexagon deformation
    if(tilePosY % 2 === 0) { //if the row is even...
        destinationX = Math.floor(tilePosX * Game.destinationWidth - Game.destinationWidth / 2); //we set its X normally
    } else { //if it’s odd though
        destinationX = Math.floor(tilePosX * Game.destinationWidth); //we need a little bit of displacement
    }
    animateIt ? sourceX = Game.animate * sourceWidth : sourceX = 0;
    sourceY = tileType * sourceHeight;
    destination.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, Game.destinationWidth, Game.destinationHeight);
}

/**
 * this draws the tiles, looping through the zoomMap's grid and placing the appropriate tile with respect to the reticule
 */

function drawZoomMap() {
    //Game.mPanel.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    var y, x, tileKind;
    var sourceTile = returnLevel(Game.level);
    mainLoop();
    webkitRequestAnimationFrame(drawZoomMap);
    Game.mPanLoc.clearRect(0, 0, Game.mPanCanvas.width, Game.mPanCanvas.height);
    if(Game.highlight) {
        drawTile(0, getTile('x'), getTile('y'), Game.tileHighlight, Game.mPanLoc);
    }
    if(Game.retY % 2 !== 0) {
        Game.retY -= 1;
    }
    //TODO : Maybe move all this yShift xShift stuff to Game?
    var yShift = Math.round(Game.yLimit / 2);
    if(yShift % 2 === 0) {
        yShift -= 1;
        Game.yLimit += 2;
    }
    for(y = 0; y < Game.yLimit; y++) {
        x = 0;
        while(x <= Game.xLimit) {
            if(sourceTile[Game.retY - yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x][1]){
                tileKind = sourceTile[Game.retY - yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x][1].kind;
            } else {
                tileKind = sourceTile[Game.retY - yShift + y][(Game.retX - Math.round(Game.xLimit / 2)) + x][0].kind;
            }

            if(tileKind < 100) {
                drawTile(tileKind, x, y, Game.terrain, Game.mPanel);
            } else if(tileKind >= 200) {
                drawTile(tileKind - 200, x, y, Game.constructions, Game.mPanel);
            } else {
                drawTile(tileKind - 100, x, y, Game.drones, Game.mPanel, true);
            }
            x++;
        }
    }
}

/**
 * draws the current location on the small radar map
 */

function drawLoc() {
    Game.radarLoc.clearRect(0, 0, Game.radarRad * 2, Game.radarRad * 2);
    Game.radarLoc.beginPath();
    Game.radarLoc.fillRect(Game.retX - (Game.xLimit / 2), Game.retY - (Game.yLimit / 2), Game.xLimit, Game.yLimit);
    Game.radarLoc.fillStyle = 'rgba(255,251,229,0.3)';
    Game.radarLoc.fill();
    Game.radarLoc.closePath();
    Game.radarLoc.beginPath();
    Game.radarLoc.strokeRect(Game.retX - (Game.xLimit / 2), Game.retY - (Game.yLimit / 2), Game.xLimit, Game.yLimit);
    Game.radarLoc.strokeStyle = '#BD222A';
    Game.radarLoc.stroke();
    Game.radarLoc.closePath();
}

function rightClicked(content, option) {
    //TODO : Make context menu appear on the correct side relative to mouse position near screen edges
    var popFrame = document.getElementById('contextMenuWrapper');
    var pop = document.getElementById('contextMenu');
    pop.innerHTML = contextContent(content);
    popFrame.style.top = event.clientY - 25 + 'px';
    popFrame.style.left = event.clientX - 10 + 'px';
    popFrame.style.display = 'inline-block';
    popFrame.style.opacity = '1';
    popFrame.addEventListener('mouseout', function() {
        if(((event.relatedTarget || event.toElement) == popFrame.nextElementSibling) || ((event.relatedTarget || event.toElement) == popFrame.parentNode)) {
            popFrame.style.opacity = '0';
            popFrame.addEventListener('webkitTransitionEnd', function() {
                popFrame.style.display = 'none';
                pop.innerHTML = '';
                popFrame.onmouseout = null;
            }, false);
        }
    }, false);
}

function contextContent(content, option) {
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    var tile = returnLevel(Game.level)[y][x][0];
    var resources = false;
    var htmlString = '';
    var resourceArray = [ //[ORENAME,PRODUCTNAME]
    //Will need to look into this for internationalisation
    ["Bauxite", "Aluminium (Al)"],
        ["Corundum", "Aluminium (Al)"],
        ["Kryolite", "Aluminium (Al)"],
        ["Haematite", "Iron (Fe)"],
        ["Magnetite", "Iron (Fe)"],
        ["Iron Pyrite", "Iron (Fe)"],
        ["Siderite", "Iron (Fe)"],
        ["Copper Pyrite", "Copper (Cu)"],
        ["Copper Glance", "Copper (Cu)"],
        ["Malachite", "Copper (Cu)"],
        ["Zinc Blende", "Zinc (Zn)"],
        ["Calamine", "Zinc (Zn)"],
        ["Rock Salt", "Sodium (Na)"],
        ["Sodium Carbonate", "Sodium (Na)"],
        ["Karnalite", "Potassium (K)"],
        ["Salt Petre", "Potassium (K)"],
        ["Galena", "Lead (Pb)"],
        ["Anglesite", "Lead (Pb)"],
        ["Tin Pyrites", "Tin (Sn)"],
        ["Cassiterite", "Tin (Sn)"],
        ["Silver Glance", "Silver (Ag)"],
        ["Calverite", "Gold (Au)"],
        ["Syvanite", "Gold (Au)"],
        ["Cinnabar", "Mercury (Hg)"],
        ["Calomel", "Mercury (Hg)"],
        ["Dolomite", "Magnesium (Mg)"],
        ["Karnalite", "Magnesium (Mg)"],
        ["Lime Stone", "Calcium (Ca)"],
        ["Dolomite", "Calcium (Ca)"],
        ["Phosphorite", "Phosphorous (P)"],
        ["Floreapetite", "Phosphorous (P)"]
    ];
    if(!option) {
        htmlString += '<span>' + tile.ref + '</span><br>';
    }
    //build time left
    if(returnLevel(Game.level)[y][x][1] && returnLevel(Game.level)[y][x][1].kind === 100) {
        htmlString += '<span>' + Lang.buildTime + (returnLevel(Game.level)[y][x][1].buildTime + 1) + Lang.week;

        //This next part is language specific, should have some means of checking...
        if(returnLevel(Game.level)[y][x][1].buildTime >= 1) {
            htmlString += 's';
        }
        htmlString += '</span><br>';
    }
    if(content) {
        htmlString += content;
    }
    //resources?
    for(var i = 0; i < tile.resources.length; i++) {
        if(tile.resources[i] > 0 && !option) {
            if(!resources) {
                htmlString += '<h3>' + Lang.resources + '</h3><ul>';
                resources = true;
            }
            htmlString += '<li>' + resourceArray[i][0] + ': ' + tile.resources[i] + 't';
            htmlString += '<ul><li>' + resourceArray[i][1] + '</ul>';
        }
    }
    htmlString += '</ul>';
    //!resources
    return htmlString;
}

String.prototype.insert = function(index, string) {
    if(index > 0) return this.slice(0, index) + string + this.slice(index);
    else return string + this;
};

function changeName(string, orig) {
    return string + ' #' + orig.split('#')[1];
}

function checkConnection(y, x) {
    var connected = false;
    for(var j = 0; j < 6; j++) {
        if(returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1] && (returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].kind === 211 || returnLevel(Game.level)[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1].kind === 204)) {
            connected = true;
        }
    }
    return connected;
}
/**
 * Performs the appropriate action for the tile that is clicked upon
 */

function clicked(direction) {
    var y = Game.retY - Math.round(Game.yLimit / 2) + getTile('y');
    var x = Game.retX - Math.round(Game.xLimit / 2) + getTile('x');
    //var kind;
    console.log('x: ' + x + '  y: ' + y);
    var hex = returnLevel(Game.level)[y][x];
    var tile = hex[0];
    var lowerTile, upperTile;
    if(Game.level < 5) {
        lowerTile = returnLevel(Game.level + 1)[y][x][0];
    }
    if(Game.level > 0) {
        upperTile = returnLevel(Game.level - 1)[y][x][0];
    }
    switch(Game.clickedOn) {
    case 'lander':
        hex[1] = bobTheBuilder(237, x, y, Game.level);
        for(var j = 0; j < 6; j++) {
            if(j % 2 !== 0) {
                Game.map[adjacent(x, y, j)[0]][adjacent(x, y, j)[1]][1] = bobTheBuilder(211, adjacent(x, y, j)[1], adjacent(x, y, j)[0], Game.level);
            }
        }
        Game.map[adjacent(x, y, 0)[0]][adjacent(x, y, 0)[1]][1] = bobTheBuilder(210, adjacent(x, y, 0)[1], adjacent(x, y, 0)[0], Game.level);
        Game.map[adjacent(x, y, 2)[0]][adjacent(x, y, 2)[1]][1] =  bobTheBuilder(203, adjacent(x, y, 2)[1], adjacent(x, y, 2)[0], Game.level);
        Game.map[adjacent(x, y, 4)[0]][adjacent(x, y, 4)[1]][1] = bobTheBuilder(235, adjacent(x, y, 4)[1], adjacent(x, y, 4)[0], Game.level);
        // ...
        Game.buildings[37][1] = false;
        var buildable = [0, 3, 8, 10, 11, 15, 17, 23, 26, 27, 32, 34, 35, 36];
        for(var ref in buildable) {
            Game.buildings[buildable[ref]][1] = true;
        }
        for(var i = 0; i < Game.robotsList.length; i++) {
            Game.robotsList[i][3] = true;
        }
        //Game.clickedOn = null;
        checkBuildings();
        break;
    case 'dozer':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDoze + "</button><br>", true);
        } else {
            //tile.prepare();
            if(hex[1] && (hex[1].kind <200 || hex[1].kind >= 100)){
                notify(Lang.noDoze);
            } else {
                hex[1] = bobTheBuilder(100, x, y, Game.level);
            }
        }
        break;
    case 'digger':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDig + "</button><br>", true);
        } else {
            //tile.digDown(x, y, lowerTile);
            hex[1] = bobTheBuilder(101, x, y, Game.level);
        }
        break;
    case 'cavernDigger':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmDigCavern + "</button><br>", true);
        } else {
            tile.digCavern(x, y, tile, Game.level, false, tile.kind - 5);
        }
        break;
    case 'miner':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmMine + "</button><br>", true);
        } else {
            tile.mine(x, y, lowerTile);
        }
        break;
    case 'recycler':
        if(!direction) {
            rightClicked("<br><button class='smoky_glass main_pointer' onclick='clicked(true)''>" + Lang.confirmRecycle + "</button><br>", true);
        } else {
            tile.recycle();
        }
        //TODO: add recycle code
        break;
    case 'agri':
        if(checkConnection(y, x) && hex[1] && hex[1].kind === 3) {
            hex[1] = bobTheBuilder(200, x, y, Game.level);
        } else {
            !hex[1] || hex[1].kind === 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'agri2':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(201, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'airport':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(202, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'arp':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(203, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'barracks':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(205, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'civprot':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(206, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'civprot2':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(207, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'command':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(210, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'commarray':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(208, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'commarray2':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(209, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'connector':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(211, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'dronefab':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(212, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'chernobyl':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(213, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'tokamak':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(214, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'genfab':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(215, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'geotherm':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(216, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'hab':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(217, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'hab2':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(218, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'hab3':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(219, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'er':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(220, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'nursery':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(222, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'oreproc':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(223, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'rec':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(224, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'recycler':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(225, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'clichy':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(226, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'research':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(227, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'research2':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(228, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'solar':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(229, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'space':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(230, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'stasis':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(231, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'store':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(232, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'uni':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(233, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'warehouse':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(234, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'windfarm':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(235, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    case 'workshop':
        if(checkConnection(y, x) && tile.kind === 3) {
            hex[1] = bobTheBuilder(236, x, y, Game.level);
        } else {
            tile.kind !== 3 ? notify(Lang.notPrepared) : notify(Lang.noConnection);
        }
        break;
    default:
        console.log("I don't recognise that building code...");
    }
    drawRadar();
}


/**
 *  When I click on a menu item, this remembers what it is _unless_ I click again, in which case, it forgets
 */

function construct() {
    var identity = this.id;
    //console.log(identity);
    if(Game.clickedOn === identity) {
        document.getElementById(Game.clickedOn).style.background = '#000';
        Game.clickedOn = 'none';
        document.body.style.cursor = "url('images/pointers/pointer.png'), default";
    } else {
        if(Game.clickedOn !== 'none') {
            document.getElementById(Game.clickedOn).style.background = '#000';
        }
        document.getElementById(identity).style.background = '#393939';
        Game.clickedOn = identity; /**TODO : Update this to be the primary key listener*/
        switch(identity) {
        case 'lander':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'dozer':
            document.body.style.cursor = "url('images/pointers/dozer.png'), default";
            break;
        case 'miner':
            document.body.style.cursor = "url('images/pointers/miner.png'), default";
            break;
        case 'digger':
            document.body.style.cursor = "url('images/pointers/digger.png'), default";
            break;
        case 'cavernDigger':
            document.body.style.cursor = "url('images/pointers/digger.png'), default";
            break;
        case 'recycler':
            document.body.style.cursor = "url('images/pointers/recycle.png'), default";
            break;
            //TODO: Change the pointers below to appropriate icons for the relevant building...
        case 'agri':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'agri2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'airport':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'arp':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'barracks':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'civprot':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'civprot2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'command':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'commarray':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'commarray2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'connector':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'dronefab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'chernobyl':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'tokamak':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'genfab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'geotherm':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'hab3':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'er':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'nursery':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'oreproc':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'rec':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'recycler':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'clichy':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'research':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'research2':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'solar':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'space':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'stasis':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'store':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'uni':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'warehouse':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'windfarm':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        case 'workshop':
            document.body.style.cursor = "url('images/pointers/build.png'), default";
            break;
        default:
            console.log("There was a problem finding out which building or drone you wanted...");
        }
    }
}