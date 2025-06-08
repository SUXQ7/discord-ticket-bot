import { SlashCommandBuilder } from 'discord.js';
import { createSetupEmbed } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information for the ticket system'),

    async execute(interaction) {
        const embed = createSetupEmbed();
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};