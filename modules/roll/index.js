const utils = require('./../../services/utils');
const { Command } = require('./../../services/commands');

const rollCmd = new Command('roll <number>d<faces>', 'Roll dices.', 'fun');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        rollCmd.match(message.content, ({ number, faces }) => {
            number = number > 10 ? 10 : number;
            for (let i = 0; i < number; i++) {
                message.reply(utils.random(faces));
            }
        });
    });
};
