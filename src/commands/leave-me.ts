import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-me')
    .setDescription('Le bot quitte le salon vocal.'),

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guildId;

    if (!guildId) {
      await interaction.reply({
        content: 'Cette commande ne peut être utilisée que dans un serveur.',
        ephemeral: true,
      });
      return;
    }

    const connection = getVoiceConnection(guildId);

    if (!connection) {
      await interaction.reply({
        content: "Je ne suis dans aucun salon vocal.",
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    const channelName = member.guild.channels.cache.get(connection.joinConfig.channelId ?? '')?.name ?? 'inconnu';

    connection.destroy();

    await interaction.reply(`J'ai quitté le salon **${channelName}** !`);
  },
};
