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
> var M = new Game(require('./example.json'));
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
- [X] Authenticate player
- [X] Create player
- [X] Invite player
- [ ] Events
- [ ] Design


App Setup
---------

- `npm install`

- Setup database

  - Install Mongodb
  - `mkdir data`
  - `mongod --dbpath=data --port 27017`

- Set environment variables (make it easy by defining exports in an `.env` file 
  and sourcing it before you run the app)

  - `SENDGRID_USERNAME`
  - `SENDGRID_PASSWORD`

- `npm start`
