Monopoly Manger
===============

Easily manage your assets during a game of Monopoly


Play A Game!
------------

It's operational via the Node CLI!

```bash
user:Monopoly$ node
> 
> // require monopoly
> var Game = require('./lib/main');
> 
> // create a new game using the example.json config
> var config = JSON.parse(require('fs').readFileSync('example.json'));
> var M = new Game(config);
> 
> // play a game
> var p1 = M.Player.get('Player 1');
> var p2 = M.Player.get('Player 2');
>
> p1.transfer(p2, M.Property.get('Oriental Avenue'));
> 
```


Todo:
-----

- [X] Create a game
- [X] Retrieve a game
- [ ] Authenticate player
- [ ] Invite player
- [ ] Create player
- [ ] Events
- [ ] Design


Database Setup
--------------

- Install Mongodb
- `mkdir data`
- `mongod --dbpath=data --port 27017`
