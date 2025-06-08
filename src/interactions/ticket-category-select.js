import { PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../utils/database.js';
import { createTicketCreatedEmbed, createTicketEmbed, colors } from '../utils/embeds.js';

export default {
    customId: 'ticket_category_select',
    type: 'selectMenu',

    async execute(interaction) {
        const selectedCategory = interaction.values[0];
        const config = db.getConfig(interaction.guild.id);
        const category = config.categories[selectedCategory];
        
        if (!category) {
            const embed = createTicketEmbed(
                '❌ Invalid Category',
                'The selected category no longer exists.',
                colors.danger
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Check if user already has an open ticket
        const tickets = db.getTickets(interaction.guild.id);
        const existingTicket = Object.values(tickets).find(
            ticket => ticket.userId === interaction.user.id && ticket.status === 'open'
        );

        if (existingTicket) {
            const embed = createTicketEmbed(
                '⚠️ Ticket Already Exists',
                `You already have an open ticket: <#${Object.keys(tickets).find(channelId => tickets[channelId] === existingTicket)}>`,
                colors.warning
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Get category channel
            const categoryChannel = interaction.guild.channels.cache.get(category.channelId);
            if (!categoryChannel) {
                throw new Error('Category channel not found');
            }

            // Create ticket channel
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryChannel,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],
                    },
                    ...config.staffRoles.map(roleId => ({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages,
                        ],
                    })),
                ],
            });

            // Create ticket in database
            const ticketId = db.createTicket(
                interaction.guild.id,
                interaction.user.id,
                category.name,
                ticketChannel.id
            );

            // Create ticket embed and buttons
            const embed = createTicketCreatedEmbed(ticketId, category.name, interaction.user);
            
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'),
                );

            // Send ticket created message
            const staffMentions = config.staffRoles.map(roleId => `<@&${roleId}>`).join(' ');
            const ticketMessage = await ticketChannel.send({
                content: staffMentions || '',
                embeds: [embed],
                components: [row]
            });

            // Pin the message
            await ticketMessage.pin();

            // Reply to user
            const successEmbed = createTicketEmbed(
                '✅ Ticket Created',
                `Your ticket has been created: ${ticketChannel}`,
                colors.success
            );

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error creating ticket:', error);
            
            const errorEmbed = createTicketEmbed(
                '❌ Error Creating Ticket',
                'There was an error creating your ticket. Please try again or contact an administrator.',
                colors.danger
            );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};