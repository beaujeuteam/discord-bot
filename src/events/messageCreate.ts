import { Client, Message, TextChannel, ThreadChannel, ChannelType } from 'discord.js';
import { askMistral } from '../utils/mistral';
import { hasActiveAdventure, continueAdventure, endAdventure } from '../utils/adventureManager';

/**
 * Découpe un texte en morceaux de 2000 caractères max (limite Discord),
 * en essayant de couper proprement après un saut de ligne.
 */
function splitMessage(text: string, maxLength = 2000): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex <= 0) splitIndex = maxLength;

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message) {
    // Ignorer les messages des bots (évite les boucles infinies)
    if (message.author.bot) return;

    const channel = message.channel;

    // ── Gestion des threads d'aventure ──────────────────────────────────────
    if (
      channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.PrivateThread
    ) {
      const thread = channel as ThreadChannel;

      if (hasActiveAdventure(thread.id)) {
        const playerInput = message.content.trim();

        // Commande pour terminer l'aventure
        if (playerInput.toLowerCase() === 'stop') {
          endAdventure(thread.id);
          await thread.send(
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `**Fin de l'aventure.** Le Maître du Jeu range ses dés. À bientôt, aventurier !`
          );
          await thread.setArchived(true);
          return;
        }

        // Continuer l'aventure avec le message du joueur
        try {
          await thread.sendTyping();
          const response = await continueAdventure(thread.id, playerInput);

          for (const chunk of splitMessage(response)) {
            await thread.send(chunk);
          }
        } catch (error) {
          console.error('Erreur lors de la continuation de l\'aventure :', error);
          await thread.send('Le Maître du Jeu a été interrompu par une force mystérieuse... (erreur interne)');
        }
        return; // Ne pas tomber sur la logique de mention ci-dessous
      }
    }

    // ── Gestion des mentions du bot (comportement pirate existant) ───────────
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

      if (response.length <= 2000) {
        await message.reply(response);
      } else {
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
