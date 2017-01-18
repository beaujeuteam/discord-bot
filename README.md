# Beaujeuteam discord bot

Discord bot for beaujeuteam

## Installation

Create a config.json like `config.json.dist`. And type your access token like :
```json
{
    "token": "your-token"
}
```

And install and start the bot

```
$ npm install
$ node index.js
```

## Contributing

To create a new module, create folder into `modules` folder and create a `index.js` file into your folder.

`index.js` example :

```javascript
// modules/my-module/index.js
module.exports = client => {

    /**
     * Response pong when someone says ping
     */
    client.on('message', message => {
        if (message.content.match(/ping/ig)) {
            message.reply('pong');
        }
    });
};
```

And add your module into main `index.js`, like this :

```javascript
// index.js
const Discord = require('discord.js');
const client = new Discord.Client();

// Add modules here
require('./modules/ping')(client);

client.login('token');
```

## API

### Utils

Utils is a service with many function to match text and other stuff.

* matchEvery(pattern, string): check if `string` match some `pattern`
    * Example : ```utils.matchEvery('apple', 'I want to eat an Apple and a Pineapple') //return true```

* matchOne(pattern, string): check if `string` match one `pattern`
    * Example : ```utils.matchOne('apple', 'I want to eat an apple and a pineapple') //return false```

* matchExactlyEvery(pattern, string): check if `string` match exactly some `pattern`
    * Example : ```utils.matchExactlyEvery('apple', 'I want to eat an Apple') //return false```

* matchExactlyOne(pattern, string): check if `string` match exactly one `pattern`
    * Example : ```utils.matchExactlyOne('Apple', 'Apple') //return true```

* matchOneOf(patterns[], string): check if `string` match one of list of `patterns`
    * Example : ```utils.matchOneOf(['apple', 'pineapple'], 'Apple patatos') //return true```

* matchExactlyOneOf(patterns[], string): check if `string` match exactly one of list of `patterns`
    * Example : ```utils.matchExactlyOneOf(['apple', 'pineapple'], 'Apple') //return false```

* getRandomlyOneOf(list[]): get one element of `list` ramdomly

Another Example

```javascript
const utils = require('./../../services/utils');
const words = ['love', 'amour', 'kiss', 'xxx'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchOneOf(words, message.content)) {
            message.react('❤');
        }
    });
}
```

## Documentation

* [Discord.js API](https://discord.js.org/#/docs/main/stable/general/welcome)
* [Add bot into discord](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
