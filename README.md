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
>
> p1.buy('Oriental Avenue');
> 
```


Todo:
-----

- [X] Remove Game caching
- [X] Retrieve games at specific URLs
- [X] Creating a new game
- [X] Set up database
- [ ] Adding players to a game
- [ ] Players are associated with their URL
- [ ] Authenticating players
- [ ] Recieving and Sending actions
- [ ] Confirming actions
- [ ] Front-End


Setting up the Database
-----------------------

- Install MongoDB
- `mkdir data`
- `mongod --dbpath data`
- `mongo`
  - `use monopoly`
  - `db.games.insert({ /* ... example.json */ })`
