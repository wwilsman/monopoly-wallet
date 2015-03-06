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
var Game = require('./lib/monopoly-game');

// gather game data
var data = require('./app/themes/classic/config.json');
data.properties = require('./app/themes/classic/properties.json');

// create a new game
var M = new Game(data);

// play a game
var player = new M.Player({ name: 'Player 1' });
var property = M.Property.get('Oriental Avenue');

M.Bank.transfer(player, property);
player.transfer(M.Bank, property.costs.price);

```

Themes
------

Themes determine the look and sometimes the rules of a game of Monopoly. They 
belong in the `app/themes` directory under a folder by the name of the theme.

Theme directories should consist of the following:

- `properties.json` **required** The properties in a game.  
  Each property must follow the format:

  - `name` *string* The name of the property
  - `group` *string* The name of the group this property belongs to
  - `costs` *object* Costs associated with the property
    - `price` *integer* The amount needed to buy the property
    - `build` *integer* The amount needed to improve on a property
    - `rent` *array[integer]* Rent values in order of: lot rent, rent with one 
      house, rent with two houses, rent with three houses, rent with four houses, 
      rent with hotel

  With the exception of railroads and utilities. In these cases, `costs.build` 
  should be `0` and `costs.rent` should be as follows:

  - Railroads: rent when one is owned, rent when two are owned, rent when three 
    are owned, rent when four are owned
  - Utilities: rent multiplier when one is owned, rent multiplier when two 
    are owned

- `property.css` **required** CSS for the property cards.

- `config.json` Game configuration file. Can include any of the options below:
  
  - `startBalance` *integer* The amount each player starts with,
  - `availableHouses` *integer* Total number of available houses,
  - `availableHotels` *integer* Total number of available hotels,
  - `rates` *object* Rates used to calculate some property costs and values
    - `mortgage` *float* Percentage of the property price
    - `interest` *float* Percentage of the calculated mortgage value
    - `building` *float* Percentage of the building costs you recieve from 
      selling a building back to the bank.

**See `app/themes/classic` for an example.**


Todo:
-----

- [X] Create a game
- [X] Retrieve a game
- [X] Authenticate player
- [X] Create player
- [X] Invite player
- [X] Themes
- [ ] Events
- [ ] Design


### Developement:

- [ ] Refactor CSS
- [ ] Document CSS
- [ ] Tablet & Desktop CSS
- [ ] HTML
- [ ] Render templates


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
