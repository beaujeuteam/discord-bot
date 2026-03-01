import { SlashCommandBuilder, CommandInteraction, GuildMember, ChatInputCommandInteraction } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { addToQueue } from '../utils/player';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue de la musique depuis une URL (YouTube ou fichier audio).')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('URL YouTube ou lien direct vers un fichier audio')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    if (!member.voice.channel) {
      await interaction.reply({
        content: 'Vous devez être dans un salon vocal pour utiliser cette commande.',
        ephemeral: true,
      });
      return;
    }

    const url = interaction.options.getString('url', true);

    // Validate URL
    try {
      new URL(url);
    } catch {
      await interaction.reply({
        content: "L'URL fournie est invalide.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    // Join the voice channel if not already connected
    const voiceChannel = member.voice.channel;
    const existingConnection = getVoiceConnection(interaction.guildId!);

    if (!existingConnection) {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
    }

    try {
      const { title, position } = await addToQueue(interaction.guildId!, url);

      if (position === 0) {
        await interaction.editReply(`Lecture en cours : **${title}**`);
      } else {
        await interaction.editReply(`Ajouté à la file d'attente (#${position}) : **${title}**`);
      }
    } catch (err: any) {
      console.error('[/play]', err);
      await interaction.editReply("Impossible de lire cette URL. Vérifiez qu'elle est valide et accessible.");
    }
  },
};
