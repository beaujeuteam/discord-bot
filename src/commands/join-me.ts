import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-me')
    .setDescription('Le bot rejoint votre salon vocal.'),

  async execute(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.voice.channel) {
      await interaction.reply({
        content: 'Vous devez être dans un salon vocal pour utiliser cette commande.',
        ephemeral: true,
      });
      return;
    }

    const voiceChannel = member.voice.channel;

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    await interaction.reply(`J'ai rejoint le salon **${voiceChannel.name}** !`);
  },
};
