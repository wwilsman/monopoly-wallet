Monopoly Wallet
===============

Easily manage your assets during a game of Monopoly


Play A Game!
------------

It's operational via the Node CLI!

```bash
$ node
```

```javascript
// require monopoly
let Game = require('./lib/monopoly-game');

// setup config
let config = require('./themes/classic/config.json');
config.properties = require('./themes/classic/properties.json');
config.assets = require('./themes/classic/assets.json');

// create a new game
let m = new Game('example', config);

// play a game
let player = m.join({ name: 'Player 1' });
let property = m.properties.find((p) => p.name === 'Oriental Avenue');

player.transfer(m.bank, property.price);
m.bank.transfer(player, property);

```

Themes
------

Themes determine the look and sometimes the rules of a game of Monopoly. They
belong in the `themes` directory under a folder by the name of the theme.

**See `themes/classic` for an example.**


Todo:
-----

- [X] Revisit
- [ ] Setup React
- [ ] Setup Redux
- [ ] Websocket events
- [ ] ...


App Setup
---------

- `npm install`

- Setup database

  - Install Mongodb
  - `mkdir data`
  - `mongod --dbpath=data --port 27017`

- `npm start`
