import { EmbedBuilder } from 'discord.js';

export const colors = {
    primary: 0x5865F2,
    success: 0x00D166,
    warning: 0xFEE75C,
    danger: 0xED4245,
    info: 0x00D9FF
};

export function createTicketEmbed(title, description, color = colors.primary) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Ticket System' });
}

export function createSetupEmbed() {
    return new EmbedBuilder()
        .setTitle('🎫 Ticket System Setup')
        .setDescription('Configure your ticket system using the commands below:')
        .addFields(
            { name: '📝 Setup Category', value: '`/ticket-setup category` - Add ticket categories', inline: true },
            { name: '🗑️ Delete Category', value: '`/ticket-setup delete-category` - Remove categories', inline: true },
            { name: '👥 Setup Staff', value: '`/ticket-setup staff` - Configure staff roles', inline: true },
            { name: '📄 Setup Logs', value: '`/ticket-setup logs` - Set log channel', inline: true },
            { name: '🎯 Create Panel', value: '`/ticket-panel` - Create ticket creation panel', inline: true },
            { name: '⚙️ View Settings', value: '`/settings` - View current configuration', inline: true }
        )
        .setColor(colors.info)
        .setTimestamp()
        .setFooter({ text: 'Ticket System Setup' });
}

export function createTicketPanelEmbed(categories) {
    const categoryList = Object.entries(categories)
        .map(([key, value]) => `${value.emoji} **${value.name}** - ${value.description}`)
        .join('\n');

    return new EmbedBuilder()
        .setTitle('🎫 Create a Ticket')
        .setDescription('Select a category below to create a new support ticket.\n\n**Available Categories:**\n' + categoryList)
        .setColor(colors.primary)
        .setTimestamp()
        .setFooter({ text: 'Choose the category that best matches your issue' });
}

export function createTicketCreatedEmbed(ticketId, category, user) {
    return new EmbedBuilder()
        .setTitle(`🎫 Ticket Created - ${ticketId}`)
        .setDescription(`Welcome to your support ticket, ${user}!`)
        .addFields(
            { name: '📂 Category', value: category, inline: true },
            { name: '👤 Created by', value: user.toString(), inline: true },
            { name: '📅 Created at', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setColor(colors.success)
        .setTimestamp()
        .setFooter({ text: 'A staff member will assist you shortly' });
}