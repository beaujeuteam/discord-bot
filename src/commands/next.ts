import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { skipTrack, getQueue } from '../utils/player';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Passe à la piste suivante dans la file d\'attente.'),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.voice.channel) {
      await interaction.reply({
        content: 'Vous devez être dans un salon vocal pour utiliser cette commande.',
        ephemeral: true,
      });
      return;
    }

    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection) {
      await interaction.reply({
        content: 'Je ne suis pas connecté à un salon vocal.',
        ephemeral: true,
      });
      return;
    }

    const queue = getQueue(interaction.guildId!);
    if (queue.length === 0) {
      await interaction.reply({
        content: 'Il n\'y a pas de piste suivante dans la file d\'attente.',
        ephemeral: true,
      });
      return;
    }

    const nextTitle = queue[0].title;
    skipTrack(interaction.guildId!);

    await interaction.reply(`Piste actuelle ignorée. Lecture en cours : **${nextTitle}**`);
  },
};
