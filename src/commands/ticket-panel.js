import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { db } from '../utils/database.js';
import { createTicketPanelEmbed, createTicketEmbed, colors } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Create a ticket creation panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = db.getConfig(interaction.guild.id);

        if (!config.categories || Object.keys(config.categories).length === 0) {
            const embed = createTicketEmbed(
                '❌ No Categories',
                'You need to set up ticket categories first using `/ticket-setup category`.',
                colors.danger
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const embed = createTicketPanelEmbed(config.categories);
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category_select')
            .setPlaceholder('Choose a category for your ticket')
            .addOptions(
                Object.entries(config.categories).map(([key, category]) => ({
                    label: category.name,
                    description: category.description,
                    value: key,
                    emoji: category.emoji
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};