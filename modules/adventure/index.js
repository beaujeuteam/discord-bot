const utils = require('./../../services/utils');
const request = require('request');

let dungeons = [];
let characters = [];
const apiUrl = 'http://37.187.105.94:9005';
//const apiUrl = 'http://localhost:8080';

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

const refresh = () => {
    refreshDungeons();
    refreshCharacters();
};

const sendCharacterStatus = (dungeon, character, message) => {
    request(`${apiUrl}/rooms/${character.room}`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            const room = JSON.parse(body).data;
            const northDoor = room.doors.find(el => el.direction === 'north');
            const eastDoor = room.doors.find(el => el.direction === 'east');
            const southDoor = room.doors.find(el => el.direction === 'south');
            const westDoor = room.doors.find(el => el.direction === 'west');

            let text = `L'aventurier ${character.name} est dans la salle [${room.posX}, ${room.posY}] du donjon ${dungeon.name}${northDoor ? '\nIl y a une porte au nord.' : ''}${eastDoor ? '\nIl y a une porte à l\'est.' : ''}${southDoor ? '\nIl y a une porte au sud.' : ''}${westDoor ? '\nIl y a une porte à l\'ouest.' : ''}\nQue fait-il ?`;
            message.channel.sendMessage(text);
        }
    });
};

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        const listCommand = utils.command('/adventure list dungeons', message.content);
        const createDungeonCommand = utils.command('/adventure create dungeon ([a-zA-Z0-9_]+)', message.content);
        const createCharacterCommand = utils.command('/adventure create character ([a-zA-Z0-9_]+)', message.content);
        const listCharactersCommand = utils.command('/adventure list characters', message.content);
        const addCharacterToDungeonCommand = utils.command('/adventure add ([a-zA-Z0-9_]+) into ([a-zA-Z0-9_]+)', message.content);
        const getCharacterStatusCommand = utils.command('/adventure status ([a-zA-Z0-9_]+)', message.content);
        const moveCharacterCommand = utils.command('/adventure move ([a-zA-Z0-9_]+) at (north|east|south|west)', message.content);

        if (!!listCommand) {
            let dungeonNames = '';
            dungeons.forEach(dungeon => {
                dungeonNames += `- ${dungeon.name}\n`;
            });

            message.channel.sendMessage(`Liste des donjons : \n${dungeonNames != '' ? dungeonNames : 'Aucun'}`);
        }

        if (!!createDungeonCommand) {
            request.post(`${apiUrl}/dungeons?name=${createDungeonCommand[0]}`, (err, res, body) => {
                if (!err && res.statusCode == 201) {
                    let data = JSON.parse(body).data;

                    message.channel.sendMessage(`Nouveau donjon créé : ${data.name}`);
                    refresh();
                }
            });
        }

        if (!!createCharacterCommand) {
            let owner = message.author.username;
            request.post(`${apiUrl}/characters?name=${createCharacterCommand[0]}&race=human&className=warrior&owner=${owner}`, (err, res, body) => {
                if (!err && res.statusCode == 201) {
                    let data = JSON.parse(body).data;

                    message.channel.sendMessage(`Nouveau personnage créé pour ${owner} :\n${data.name}\n${data.race}\n${data.class}`);
                    refresh();
                }
            });
        }

        if (!!listCharactersCommand) {
            const owner = message.author.username;

            request(`${apiUrl}/characters?owner=${owner}`, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let characterNames = '';
                    characters.forEach(character => {
                        characterNames += `- ${character.name} (${character.race} ${character.class})\n`;
                    });

                    message.channel.sendMessage(`Liste des personnages de ${owner} : \n${characterNames != '' ? characterNames : 'Aucun'}`);
                }
            });
        }

        if (!!addCharacterToDungeonCommand) {
            const owner = message.author.username;
            const character = characters.find(el => el.name == addCharacterToDungeonCommand[0]);
            const dungeon = dungeons.find(el => el.name == addCharacterToDungeonCommand[1]);

            if (!character || character.owner != owner) {
                return message.channel.sendMessage('Personnage incorrect.');
            }

            if (!dungeon) {
                return message.channel.sendMessage('Donjon incorrect.');
            }

            request.put(`${apiUrl}/dungeons/${dungeon.id}/character/${character.id}`, (err, res, body) => {
                if (!err && res.statusCode == 204) {

                    message.channel.sendMessage(`${character.name} ajouté au donjon ${dungeon.name}.`);
                    refresh();
                }
            });
        }

        if (!!getCharacterStatusCommand) {
            const owner = message.author.username;
            const character = characters.find(el => el.name == getCharacterStatusCommand[0]);

            if (!character || character.owner != owner) {
                return message.channel.sendMessage('Personnage incorrect.');
            }

            const dungeon = dungeons.find(el => el.id == character.dungeon);

            if (!dungeon) {
                return message.channel.sendMessage(`L'aventurier ${character.name} n'est pas encore dans un donjon.`);
            }

            sendCharacterStatus(dungeon, character, message);
        }

        if (!!moveCharacterCommand) {
            const owner = message.author.username;
            let character = characters.find(el => el.name == moveCharacterCommand[0]);

            if (!character || character.owner != owner) {
                return message.channel.sendMessage('Personnage incorrect.');
            }

            const dungeon = dungeons.find(el => el.id == character.dungeon);

            if (!dungeon) {
                return message.channel.sendMessage(`L'aventurier ${character.name} n'est pas encore dans un donjon.`);
            }

            request.put(`${apiUrl}/dungeons/${dungeon.id}/character/${character.id}/move/${moveCharacterCommand[1]}`, (err, res, body) => {
                if (!err && res.statusCode == 204) {
                    message.channel.sendMessage(`${character.name} ce déplace...`);

                    refreshCharacters(() => {
                        character = characters.find(el => el.name == moveCharacterCommand[0]);
                        sendCharacterStatus(dungeon, character, message);
                    });
                } else if (res.statusCode == 422) {
                    message.channel.sendMessage(`${character.name} ne peut pas faire cette action.`);
                }
            });
        }
    });

    refresh();
};
