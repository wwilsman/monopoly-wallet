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
> // play a game (the bank owns all of the properties to start)
> var bank = M.Player.get('bank');
> var p1 = M.Player.get('player 1');
> var oriental = M.Property.get('Oriental Avenue');
>
> p1.transfer(bank, oriental.costs.price);
> bank.transfer(p1, oriental);
> 
```


Todo:
-----

- [ ] Development (removed as they're completed)

  - [ ] Write tests for *Config* because I do TDD backwards
  - [ ] Create "bank" player by default and prevent players from being named "bank"
  - [ ] *Player#buy(**propName**[, **amount**])*

- [ ] Display:

  How the final app will look

  - [ ] Properties
  - [ ] Assets
  - [ ] Bank
  - [ ] Overview
