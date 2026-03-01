import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Répond avec Pong !'),

  async execute(interaction: CommandInteraction) {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`Pong ! Latence : **${latency}ms**`);
  },
};
