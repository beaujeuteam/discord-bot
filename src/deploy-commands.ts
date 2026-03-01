import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('DISCORD_TOKEN ou CLIENT_ID manquant dans le fichier .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Déploiement de ${commands.length} commande(s) slash...`);

    if (guildId) {
      // Déploiement par serveur : instantané
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Commandes slash déployées sur le serveur ${guildId}.`);
    } else {
      // Déploiement global : peut prendre jusqu'à 1h
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('Commandes slash déployées globalement.');
    }
  } catch (error) {
    console.error(error);
  }
})();
