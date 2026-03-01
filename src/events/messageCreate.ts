import { Client, Message, TextChannel } from 'discord.js';
import { askMistral } from '../utils/mistral';

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message) {
    // Ignorer les messages des bots (évite les boucles infinies)
    if (message.author.bot) return;

    // Vérifier si le bot est mentionné dans le message
    const client = message.client as Client;
    if (!client.user || !message.mentions.has(client.user)) return;

    // Nettoyer le message en retirant la mention du bot
    const userContent = message.content
      .replace(`<@${client.user.id}>`, '')
      .replace(`<@!${client.user.id}>`, '')
      .trim();

    if (!userContent) {
      await message.reply('Oui ? Tu voulais me dire quelque chose ?');
      return;
    }

    // Indiquer que le bot est en train d'écrire
    const textChannel = message.channel as TextChannel;
    await textChannel.sendTyping();

    try {
      const response = await askMistral(userContent);

      // Discord limite les messages à 2000 caractères
      if (response.length <= 2000) {
        await message.reply(response);
      } else {
        // Découper en plusieurs messages si la réponse est trop longue
        const chunks = response.match(/.{1,2000}/gs) ?? [];
        for (const chunk of chunks) {
          await textChannel.send(chunk);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel à Mistral :', error);
      await message.reply(`ERROR GRrrrrrRRrrr... ${String(error)}`);
    }
  },
};
