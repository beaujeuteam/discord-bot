const utils = require('./../../services/utils');
const request = require('request');
const { Command } = require('./../../services/commands');

let dungeons = [];
let characters = [];
let monsters = [];
//const apiUrl = 'http://37.187.105.94:9005';
const apiUrl = 'http://localhost:8080';

const refreshDungeons = (callback = () => {}) => {
    request(`${apiUrl}/dungeons`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            dungeons = JSON.parse(body).data;
            callback();
        }
    });
};

const refreshCharacters = (callback = () => {}) => {
    request(`${apiUrl}/characters`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            characters = JSON.parse(body).data;
            callback();
        }
    });
};

const refreshMonsters = (callback = () => {}) => {
    request(`${apiUrl}/monsters`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            monsters = JSON.parse(body).data;
            callback();
        }
    });
};

const refresh = () => {
    refreshDungeons();
    refreshCharacters();
    refreshMonsters();
};

const sendCharacterStatus = (dungeon, character, message) => {
    request(`${apiUrl}/rooms/${character.room}`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            const room = JSON.parse(body).data;
            const northDoor = room.doors.find(el => el.direction === 'north');
            const eastDoor = room.doors.find(el => el.direction === 'east');
            const southDoor = room.doors.find(el => el.direction === 'south');
            const westDoor = room.doors.find(el => el.direction === 'west');

            let text = `L'aventurier ${character.name} est dans la salle [${room.posX}, ${room.posY}] du donjon ${dungeon.name}${northDoor ? '\nIl y a une porte au nord.' : ''}${eastDoor ? '\nIl y a une porte à l\'est.' : ''}${southDoor ? '\nIl y a une porte au sud.' : ''}${westDoor ? '\nIl y a une porte à l\'ouest.' : ''}`;

            if (room.characters.length > 0) {
                const characters = room.characters.map(character => character.name).filter(name => name !== character.name).join(', ');

                if (!!characters) {
                    text += `\n D'autres aventuriers semblent ce trouve dans cette pièce : ${characters}`;
                }
            }

            if (room.monsters.length > 0) {
                text += `\n Des monstres sont tapis dans l'obscurité de la pièce : ${room.monsters.map(monster => monster.name).join(', ')}`;
            }

            text += '\n\nQue fait-il ?';

            message.channel.send(text);
        }
    });
};

const listCommand = new Command('adventure dungeons', 'List dungeons.');
const createDungeonCommand = new Command('adventure create dungeon [name]', 'Create a new dungeon.');
const createCharacterCommand = new Command('adventure create character [name]', 'Create a new character.');
const listCharactersCommand = new Command('adventure characters', 'List characters.');
const addCharacterToDungeonCommand = new Command('adventure add [character] into [dungeon]', 'Add character to dungeon.');
const getCharacterStatusCommand = new Command('adventure [character]', 'Show character status.');
const moveCharacterCommand = new Command('adventure [name] move at [direction]', 'Move character at next room.');
const attackMonsterCommand = new Command('adventure [name] attack monster [name2]', 'Character attack monster');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        listCommand.match(message.content, () => {
            let dungeonNames = '';
            dungeons.forEach(dungeon => {
                dungeonNames += `- ${dungeon.name}\n`;
            });

            message.channel.send(`Liste des donjons : \n${dungeonNames != '' ? dungeonNames : 'Aucun'}`);
        });

        createDungeonCommand.match(message.content, ({ name }) => {
            request.post(`${apiUrl}/dungeons?name=${name}`, (err, res, body) => {
                if (!err && res.statusCode == 201) {
                    let data = JSON.parse(body).data;

                    message.channel.send(`Nouveau donjon créé : ${data.name}`);
                    refresh();
                }
            });
        });

        createCharacterCommand.match(message.content, ({ name }) => {
            let owner = message.author.username;
            request.post(`${apiUrl}/characters?name=${name}&race=human&className=warrior&owner=${owner}`, (err, res, body) => {
                if (!err && res.statusCode == 201) {
                    let data = JSON.parse(body).data;

                    message.channel.send(`Nouveau personnage créé pour ${owner} :\n${data.name}\n${data.race}\n${data.class}`);
                    refresh();
                }
            });
        });

        listCharactersCommand.match(message.content, () => {
            const owner = message.author.username;

            request(`${apiUrl}/characters?owner=${owner}`, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let characterNames = '';
                    characters.forEach(character => {
                        characterNames += `- ${character.name} (${character.race} ${character.class})\n`;
                    });

                    message.channel.send(`Liste des personnages de ${owner} : \n${characterNames != '' ? characterNames : 'Aucun'}`);
                }
            });
        });

        addCharacterToDungeonCommand.match(message.content, ({ character, dungeon }) => {
            const owner = message.author.username;

            character = characters.find(el => el.name == character);
            dungeon = dungeons.find(el => el.name == dungeon);

            if (!character || character.owner != owner) {
                return message.channel.send('Personnage incorrect.');
            }

            if (!dungeon) {
                return message.channel.send('Donjon incorrect.');
            }

            request.put(`${apiUrl}/dungeons/${dungeon.id}/character/${character.id}`, (err, res, body) => {
                if (!err && res.statusCode == 204) {

                    message.channel.send(`${character.name} ajouté au donjon ${dungeon.name}.`);
                    refresh();
                }
            });
        });

        getCharacterStatusCommand.match(message.content, ({ character }) => {
            const owner = message.author.username;

            character = characters.find(el => el.name == character);

            if (!character || character.owner != owner) {
                return message.channel.send('Personnage incorrect.');
            }

            const dungeon = dungeons.find(el => el.id == character.dungeon);

            if (!dungeon) {
                return message.channel.send(`L'aventurier ${character.name} n'est pas encore dans un donjon.`);
            }

            sendCharacterStatus(dungeon, character, message);
        });

        moveCharacterCommand.match(message.content, ({ name, direction }) => {
            const owner = message.author.username;

            let character = characters.find(el => el.name == name);
            if (!character || character.owner != owner) {
                return message.channel.send('Personnage incorrect.');
            }

            const dungeon = dungeons.find(el => el.id == character.dungeon);

            if (!dungeon) {
                return message.channel.send(`L'aventurier ${character.name} n'est pas encore dans un donjon.`);
            }

            request.put(`${apiUrl}/dungeons/${dungeon.id}/character/${character.id}/move/${direction}`, (err, res, body) => {
                if (!err && res.statusCode == 204) {
                    message.channel.send(`${character.name} ce déplace...`);

                    refreshCharacters(() => {
                        character = characters.find(el => el.name == name);
                        sendCharacterStatus(dungeon, character, message);
                    });
                } else if (res.statusCode == 422) {
                    message.channel.send(`${character.name} ne peut pas faire cette action. \nLes monstres peuvent bloquer le passage, ou la porte est fermée.`);
                }
            });
        });

        attackMonsterCommand.match(message.content, ({ name, name2 }) => {
            const owner = message.author.username;

            let character = characters.find(el => el.name == name);
            if (!character || character.owner != owner) {
                return message.channel.send('Personnage incorrect.');
            }

            let monster = monsters.find(el => el.name == name2 && el.room == character.room);
            if (!monster) {
                return message.channel.send('Monstre incorrect.');
            }

            const dungeon = dungeons.find(el => el.id == character.dungeon);

            if (!dungeon) {
                return message.channel.send(`L'aventurier ${character.name} n'est pas encore dans un donjon.`);
            }

            request.put(`${apiUrl}/dungeons/${dungeon.id}/character/${character.id}/attack/monsters/${monster.id}`, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body).data;

                    let text = `${character.name} attaque ${monster.name}`;

                    data.logs.forEach(log => {
                        text += log.critic ? '\nCritique !' : '';
                        text += `\n${log.from} inflige ${log.hit} à ${log.target}`;
                    });

                    if (data.character.life <= 0) {
                        text += `\n${data.character.name} est mort.`
                    }

                    if (data.monster.life <= 0) {
                        text += `\n${data.monster.name} est mort.`
                    }

                    message.channel.send(text);

                    refresh();
                } else if (res.statusCode == 422) {
                    message.channel.send(`${character.name} ne peut pas faire cette action.`);
                }
            });
        });
    });

    refresh();
};
