Monopoly Manger
===============

Easily manage your assets during a game of Monopoly


Play A Game!
------------

It's operational via the Node CLI!

```bash
user:Monopoly$ node
> 
> // require the monopoly test file
> var M = require('./test/monopoly');
> 
> // load the example.json config
> M.configure(JSON.parse(require('fs').readFileSync('example.json')));
> 
> // play a game
> var p1 = M.Player.get('player 1');
>
> p1.buy('Oriental Avenue');
> 
```


Todo:
-----

- [ ] Development (removed as they're completed)

  - [ ] Write tests for **Monopoly#configure()** and **Monopoly#Error** 
        because I do TDD backwards
  - [ ] Create Monopoly Class instead of one Monopoly object.

- [ ] Server:

  - [ ] Different games are hosted under short codes
  - [ ] Each player has a unique url and password
  - [ ] Websockets send live updates to other players
  - [ ] Ask players for confirmation on some actions
  - [ ] Accepts a configuration object to start a game
  - [ ] Themes

- [ ] Display:

  How the final app will look

  - [ ] Properties
  - [ ] Assets
  - [ ] Bank
  - [ ] Overview
