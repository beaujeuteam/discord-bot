# Beaujeuteam discord bot

Discord bot for beaujeuteam

## Installation

Create a config.json like `config.json.dist`. And type your access tokens like :
```json
{
    "tokens": {
        "token": "your-discord-token",
        "tts_token": "tts-token"
    }
}
```

For `tts_token` keep empty if your doesn't want to use it, or go to [http://www.voicerss.org](http://www.voicerss.org)

And install and start the bot

```
$ npm install
$ node index.js
```

## Production with Docker

If you want launch discord bot into production server, you can use docker like :

```
docker run -dt --rm -v $(pwd):/source -w /source letsxo/node-ffmpeg npm start
```

## Database

Some modules needs a mongoDB database to work fine. Add database configuration into `config.json` like :

```json
{
    "db": {
        "host": "hostname",
        "dbname": "dbname",
        "user": "root",
        "password": "root",
        "port": "27017"
    }
}
```

Modules `playlist` and `monitoring` uses database.

## Monitoring and Logs

You can enable monitoring (save all user messages into database) and display logs into channel into `config.json` like

```json
{
    "debug": true,
    "channel_debug": "channel_name",
    "monitoring": true,
}
```

For all config, please see [config.json.dist]('./config.json.dist')

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
