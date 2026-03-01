import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  ThreadChannel,
  ChannelType,
} from 'discord.js';
import { startAdventure, hasActiveAdventure } from '../utils/adventureManager';

/**
 * Découpe un texte en morceaux de 2000 caractères max (limite Discord),
 * en essayant de couper proprement après un saut de ligne.
 */
function splitMessage(text: string, maxLength = 2000): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    // Cherche le dernier saut de ligne avant la limite
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex <= 0) splitIndex = maxLength;

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventure')
    .setDescription('Lance une aventure interactive "Livre dont vous êtes le héros" dans un nouveau thread.')
    .addStringOption(option =>
      option
        .setName('theme')
        .setDescription('Décris brièvement l\'aventure souhaitée (ex: "Piraterie dans les Caraïbes")')
        .setRequired(false)
        .setMaxLength(200)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // La commande ne fonctionne que dans un salon texte de guilde
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Cette commande doit être utilisée dans un salon textuel de serveur.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const textChannel = interaction.channel as TextChannel;
    const userName = interaction.user.username;
    const theme = interaction.options.getString('theme') ?? null;

    // Création du thread dédié à l'aventure
    const threadName = theme
      ? `⚔️ ${theme}`
      : `⚔️ Aventure de ${userName}`;

    let thread: ThreadChannel;
    try {
      thread = await textChannel.threads.create({
        name: threadName,
        autoArchiveDuration: 1440, // archive après 24h d'inactivité
        reason: `Aventure lancée par ${userName} via /adventure`,
      });
    } catch (error) {
      console.error('Erreur lors de la création du thread :', error);
      await interaction.editReply('Impossible de créer le thread. Vérifie que le bot a la permission de gérer les threads.');
      return;
    }

    await interaction.editReply(
      `Votre aventure commence dans le thread **${thread.name}** ! → ${thread.url}`
    );

    // Message de bienvenue dans le thread avant l'intro du MJ
    await thread.send(
      `**Bienvenue dans votre aventure, ${interaction.user} !**\n\n` +
      `Le Maître du Jeu prépare votre histoire... Répondez simplement dans ce thread pour jouer.\n` +
      `_(Tapez \`stop\` pour mettre fin à l'aventure à tout moment.)_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );

    // Appel au LLM pour l'introduction de l'aventure
    try {
      await thread.sendTyping();
      const intro = await startAdventure(thread.id, theme);

      for (const chunk of splitMessage(intro)) {
        await thread.send(chunk);
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'aventure :', error);
      await thread.send('Une erreur est survenue lors du démarrage de l\'aventure. Veuillez réessayer.');
    }
  },
};
