import { SlashCommandBuilder, CommandInteraction, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Lance un ou plusieurs dés')
    .addIntegerOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de dés à lancer')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addIntegerOption(option =>
      option
        .setName('faces')
        .setDescription('Nombre de faces par dé')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(1000)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const nombre = interaction.options.getInteger('nombre', true);
    const faces = interaction.options.getInteger('faces', true);

    const resultats: number[] = [];
    for (let i = 0; i < nombre; i++) {
      resultats.push(Math.floor(Math.random() * faces) + 1);
    }

    const total = resultats.reduce((sum, val) => sum + val, 0);
    const détail = nombre > 1 ? ` (${resultats.join(' + ')})` : '';

    await interaction.reply(
      `🎲 **${nombre}d${faces}** → **${total}**${détail}`
    );
  },
};
