#Codename Eureka - Documentation
##Introduction
Welcome to the Codename Eureka Documentation. Codename Eureka is a turn based, single player space-colony sim. These pages provide all the functional documentation. If instead you're looking for general information on development, story, UI design etc., you should instead [check out the wiki](http://gryson.duckdns.org:4269/mediawiki).

Developed mainly for pleasure and education, we use git for source code management, mediawiki for documentation, mantis for bug tracking, all hosted on a Raspberry Pi hooked up to a 200Mbps connection in Paris (with daily backups).

##Getting Started
You can clone the git repo like so:
<pre>git clone ssh://git@gryson.duckdns.org:4242/Codename--Eureka</pre>
_(You need to have previously provided your ssh pubkey)_

You can build Codename Eureka [using this guide](http://gryson.duckdns.org:4269/mediawiki/index.php/Building_Codename_Eureka)


##Useful Links
###General Interest
- [Story](http://gryson.duckdns.org:4269/mediawiki/index.php/Story)
- [Design Guidelines](http://gryson.duckdns.org:4269/mediawiki/index.php/Design_Guidelines)
- [Dev Guidelines](http://gryson.duckdns.org:4269/mediawiki/index.php/Dev_Guidelines)

###Development
If you're looking to develop for *Codename Eureka*, you'll need to have a look at the following resources:
- [The wiki](http://gryson.duckdns.org:4269/mediawiki)
- [The repo tracker](http://gryson.duckdns.org:4269/gitweb)
- [The bugtracker](http://gryson.duckdns.org:4269/mantis)

##Sources:
- Terrain textures are heavily modified from textures I found on [Mayang.com](http://www.mayang.com/textures/)
- Music is used by permission from [Clearside](http://www.clearsidemusic.com/)
- Mersenne Twister code for terrain generation is taken from [Sean McCullough's](https://gist.github.com/banksean/300494) JavaScript port of [Takuji Nishimura's and Makoto Matsumoto's C program for Perlin Noise](http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html)