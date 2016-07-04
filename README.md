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
let Game = require('./app/game');

// setup config
let config = require('./app/themes/classic/config.json');
config.properties = require('./app/themes/classic/properties.json');
config.assets = require('./app/themes/classic/assets.json');

// create a new game
let m = new Game(config);

// play a game
let player = m.join({ name: 'Player 1' });
let property = m.properties.find((p) => p.name === 'Oriental Avenue');

player.transfer(m.bank, property.price);
m.bank.transfer(player, property);

```

Themes
------

Themes determine the look and sometimes the rules of a game of Monopoly. They
belong in the `app/themes` directory under a folder by the name of the theme.

**See `app/themes/classic` for an example.**


Todo:
-----

- [X] Revisit
- [X] Setup React
- [X] Setup Redux
- [X] Setup sockets
- [ ] Use sockets to play a game
- [ ] Flesh out React app
- [ ] ...


App Setup
---------

- `npm install`

- Setup database

  - Install Mongodb
  - `mkdir data`
  - `mongod --dbpath=data --port 27017`

- `npm start`
