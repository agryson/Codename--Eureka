"use strict";
/**
  I've [Sean McCullough] wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.
  
  If you want to use this as a substitute for Math.random(), use the random()
  method like so:
  <pre>
  var m = new MersenneTwister();
  var randomNumber = m.random();
  </pre>
  You can also call the other genrand_{foo}() methods on the instance.

  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:
  <pre>
  var m = new MersenneTwister(123);
  </pre>
  and that will always produce the same random sequence.

  
  ###Original License
  <pre>
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   {@link http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html}
   {@link m-mat@math.sci.hiroshima-u.ac.jp}
  </pre>


  @author Sean McCullough <banksean@gmail.com>
  @author Takuji Nishimura 
  @author Makoto Matsumoto <m-mat@math.sci.hiroshima-u.ac.jp>
  @constructor
*/
var MersenneTwister = function(seed) { /* Period parameters */
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df; /* constant vector a */
    this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
    this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

    this.mt = new Array(this.N); /* the array for the state vector */
    this.mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */

    this.init_genrand(seed);
  };

/** initializes mt[N] with a seed */
MersenneTwister.prototype.init_genrand = function(s) {
  this.mt[0] = s >>> 0;
  for(this.mti = 1; this.mti < this.N; this.mti++) {
    var s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
    this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti; /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
    /* In the previous versions, MSBs of the seed affect   */
    /* only MSBs of the array mt[].                        */
    /* 2002/01/09 modified by Makoto Matsumoto             */
    this.mt[this.mti] >>>= 0; /* for >32 bit machines */
  }
};

/** initialize by an array with array-length
* @param {array} init_key Array for initializing keys
* @param {int} key_length Length of init_key
* slight change for C++, 2004/2/26
*/
MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
  var i, j, k;
  this.init_genrand(19650218);
  i = 1;
  j = 0;
  k = (this.N > key_length ? this.N : key_length);
  for(; k; k--) {
    var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++;
    j++;
    if(i >= this.N) {
      this.mt[0] = this.mt[this.N - 1];
      i = 1;
    }
    if(j >= key_length) j = 0;
  }
  for(k = this.N - 1; k; k--) {
    var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++;
    if(i >= this.N) {
      this.mt[0] = this.mt[this.N - 1];
      i = 1;
    }
  }

  this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
};

/** generates a random number on [0,0xffffffff]-interval */
MersenneTwister.prototype.genrand_int32 = function() {
  var y;
  var mag01 = new Array(0x0, this.MATRIX_A); /* mag01[x] = x * MATRIX_A  for x=0,1 */

  if(this.mti >= this.N) { /* generate N words at one time */
    var kk;

    if(this.mti == this.N + 1) /* if init_genrand() has not been called, */
    this.init_genrand(5489); /* a default initial seed is used */

    for(kk = 0; kk < this.N - this.M; kk++) {
      y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
      this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    for(; kk < this.N - 1; kk++) {
      y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
      this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
    this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

    this.mti = 0;
  }

  y = this.mt[this.mti++];

  /* Tempering */
  y ^= (y >>> 11);
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  y ^= (y >>> 18);

  return y >>> 0;
};

/** generates a random number on [0,0x7fffffff]-interval */
MersenneTwister.prototype.genrand_int31 = function() {
  return(this.genrand_int32() >>> 1);
};

/** generates a random number on [0,1]-real-interval */
MersenneTwister.prototype.genrand_real1 = function() {
  return this.genrand_int32() * (1.0 / 4294967295.0); /* divided by 2^32-1 */
};

/** generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
  return this.genrand_int32() * (1.0 / 4294967296.0); /* divided by 2^32 */
};

/** generates a random number on (0,1)-real-interval */
MersenneTwister.prototype.genrand_real3 = function() {
  return(this.genrand_int32() + 0.5) * (1.0 / 4294967296.0); /* divided by 2^32 */
};

/** generates a random number on [0,1) with 53-bit resolution*/
MersenneTwister.prototype.genrand_res53 = function() {
  var a = this.genrand_int32() >>> 5,
    b = this.genrand_int32() >>> 6;
  return(a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
};

/**
 * ###{@link MersenneTwister|See here for original documentation}
 * These real versions are due to Isaku Wada, 2002/01/09 added
 * FOLLOWING INDENTED CODE WAS 'BORROWED' FROM STACK OVERFLOW
 * Ported from Stefan Gustavson's java implementation
 * {@link http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf}
 * Read Stefan's excellent paper for details on how this code works.
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 * @author Sean McCullough <banksean@gmail.com>
 * @constructor
 * @param {Object} [r] Random number generator object, assumed to have a <tt>random()</tt> method
 */
var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison
    if(r === undefined) r = Math;
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1]
    ];
    this.p = [];
    for(var i = 0; i < 256; i++) {
      this.p[i] = Math.floor(r.random() * 256);
    }
    // To remove the need for index wrapping, double the permutation table length
    this.perm = [];
    for(var j = 0; j < 512; j++) {
      this.perm[j] = this.p[j & 255];
    }
  };
/** @todo document this */
ClassicalNoise.prototype.dot = function(g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
};
/** Interplates between the provided values */
ClassicalNoise.prototype.mix = function(a, b, t) {
  return(1.0 - t) * a + t * b;
};
/** Compute the fade curve value */
ClassicalNoise.prototype.fade = function(t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
};

/** Classic Perlin noise, 3D version 
* @param {float} x X coordinate
* @param {float} y Y coordinate
* @param {float} z Z coordinate
* @returns {int}
* @todo Confirm return value
*/
ClassicalNoise.prototype.noise = function(x, y, z) {
  // Find unit grid cell containing point
  var X = Math.floor(x);
  var Y = Math.floor(y);
  var Z = Math.floor(z);

  // Get relative xyz coordinates of point within that cell
  x = x - X;
  y = y - Y;
  z = z - Z;

  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
  X = X & 255;
  Y = Y & 255;
  Z = Z & 255;
  // Calculate a set of eight hashed gradient indices
  var gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
  var gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
  var gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
  var gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
  var gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
  var gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
  var gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
  var gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

  // The gradients of each corner are now:
  // g000 = grad3[gi000];
  // g001 = grad3[gi001];
  // g010 = grad3[gi010];
  // g011 = grad3[gi011];
  // g100 = grad3[gi100];
  // g101 = grad3[gi101];
  // g110 = grad3[gi110];
  // g111 = grad3[gi111];
  // Calculate noise contributions from each of the eight corners
  var n000 = this.dot(this.grad3[gi000], x, y, z);
  var n100 = this.dot(this.grad3[gi100], x - 1, y, z);
  var n010 = this.dot(this.grad3[gi010], x, y - 1, z);
  var n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
  var n001 = this.dot(this.grad3[gi001], x, y, z - 1);
  var n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
  var n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
  var n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
  // Compute the fade curve value for each of x, y, z
  var u = this.fade(x);
  var v = this.fade(y);
  var w = this.fade(z);
  // Interpolate along x the contributions from each of the corners
  var nx00 = this.mix(n000, n100, u);
  var nx01 = this.mix(n001, n101, u);
  var nx10 = this.mix(n010, n110, u);
  var nx11 = this.mix(n011, n111, u);
  // Interpolate the four results along y
  var nxy0 = this.mix(nx00, nx10, v);
  var nxy1 = this.mix(nx01, nx11, v);
  // Interpolate the two last results along z
  var nxyz = this.mix(nxy0, nxy1, w);

  return nxyz;
};
