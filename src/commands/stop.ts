import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { stopPlayer } from '../utils/player';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la musique et vide la file d\'attente.'),

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

    stopPlayer(interaction.guildId!);

    await interaction.reply('Lecture arrêtée et file d\'attente vidée.');
  },
};
