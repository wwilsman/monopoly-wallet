# Monopoly Wallet

Easily manage your assets during a game of Monopoly


## Themes

Themes determine the look and sometimes the rules of a game of Monopoly. They
belong in the `public/themes` directory under a folder by the name of the theme.

**See `public/themes/classic` for an example.**

### Config

The config file contains rules for a game

``` javascript
// config.json
{
  "themeName": "Classic",              // display name for this theme
  "themeDescr": "..."                  // description of this theme
  "bankStart": -1,                     // initial bank balance (-1 = Infinite)
  "playerStart": 1500,                 // starting balance of new players
  "passGoAmount": 200,                 // amount collected for passing go
  "payJailAmount": 50,                 // amount needed to get out of jail
  "houseCount": 32,                    // starting number of houses
  "hotelCount": 12,                    // starting number of hotels
  "mortgageRate": 0.5,                 // rate that mortgage value is calculated
  "interestRate": 0.1,                 // rate that mortgage interest is calculated
  "buildingRate": 0.5,                 // rate that buildings sell for
  "playerTokens": [],                  // array of token names
  "groupColors": {},                   // group colors keyed by group name (see below)
  "pollTimeout": 30000,                // time before poll expires
}
```

### Properties

A file containing an array of property details

``` javascript
// properties.json
[{
  "name": "Mediterranean Avenue",      // property name
  "group": "brown",                    // group name (lowercase)
  "price": 60,                         // property price
  "build": 50,                         // building cost
  "rent": [2, 10, 30, 90, 160, 250]    // rent indexed by building count
}]
```


## Game State

The state of the game at any given time

``` javascript
{
  "room": "T3STT",                     // room code for this game
  "entry": "bJGWrFEg4a",               // history entry id
  "bank": Infinity,                    // current bank balance
  "houses": 29,                        // current house count
  "hotels": 12,                        // current hotel count
  "players": [{                        // array of players
    "name": "player 1",                  // player name (lowercase)
    "token": "automobile",               // player token (unique)
    "balance": 1500,                     // current balance
    "isBankrupt": false                  // bankruptcy status
  }],
  "properties": [{                     // array of properties
    ...config,                           // property config defined above
    "buildings": 3,                      // current building count (5 = hotel)
    "mortgage": 30,                      // mortgage value (price * mortgageRate)
    "interest": 3,                       // mortgage interest (mortgage * interestRate)
    "isMortgaged": false,                // mortgage status
    "owner": "automobile"                // property owner's token
  }],
  "auction": false||{                  // current auction info
    "property": "Park Place"             // property being auctioned
    "bids": [{                           // array of bids
      "player": "automobile",              // player token
      "amount": 100                        // bid amount
    }]
  },
  "trades": [{                         // array of trading info
    "players": ["thimble", "top-hat"]    // array of involved player tokens
    "[token]": {                         // trade data (keyed by player token)
      "properties": ["Boardwalk"],         // array of property names to trade
      "amount": 100                        // amount to trade
    }
  }],
  "notice": false||{                   // notice about the last state change (if any)
    "message": "...",                    // notice message
    "meta": {                            // optinal meta info about the state change
      "players": ["automobile"],           // array of players that caused the change
      "properties": ["Park Place"],        // array of properties affected
      "action": "auction:new",             // action that caused the change
      "save": false                        // whether this change caused a save
    }
  }
}
```


## App Setup

- Install MongoDB
- `yarn`
- `yarn start`
