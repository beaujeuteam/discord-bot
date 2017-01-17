# Beaujeuteam discord bot

Discord bot for beaujeuteam

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

## Documentation

* [Discord.js API](https://discord.js.org/#/docs/main/stable/general/welcome)
* [Add bot into discord](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
