import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getQueue, getCurrentTrack } from '../utils/player';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Affiche la file d\'attente musicale.'),

  async execute(interaction: ChatInputCommandInteraction) {
    const current = getCurrentTrack(interaction.guildId!);
    const queue = getQueue(interaction.guildId!);

    if (!current && queue.length === 0) {
      await interaction.reply({
        content: 'La file d\'attente est vide.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('File d\'attente musicale')
      .setColor(0x5865f2);

    if (current) {
      embed.addFields({ name: '▶ En cours', value: current.title });
    }

    if (queue.length > 0) {
      const lines = queue
        .slice(0, 20)
        .map((entry, i) => `\`${i + 1}.\` ${entry.title}`)
        .join('\n');

      const suffix = queue.length > 20
        ? `\n*… et ${queue.length - 20} autre(s) piste(s)*`
        : '';

      embed.addFields({ name: '⏭ En attente', value: lines + suffix });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
