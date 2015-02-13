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
> var p1 = M.Player.get('player 1');
>
> p1.buy('Oriental Avenue');
> 
```


Todo:
-----

- [ ] Remove Game caching and use a database instead
- [ ] Retrieve games at specific URLs
- [ ] Creating a new game
- [ ] Themes
- [ ] Adding players to a game
- [ ] Players are associated with their URL
- [ ] When not logged in, can only view player overview
- [ ] When logged in, can alter own assets
- [ ] Recieving and Sending actions
- [ ] Confirming actions
- [ ] Front-End
