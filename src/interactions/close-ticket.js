import { db } from '../utils/database.js';
import { createTicketEmbed, colors } from '../utils/embeds.js';
import { sendTicketLog } from '../utils/logger.js';

export default {
    customId: 'close_ticket',
    type: 'button',

    async execute(interaction) {
        // Check if this is a ticket channel
        const tickets = db.getTickets(interaction.guild.id);
        const ticket = tickets[interaction.channel.id];

        if (!ticket) {
            const embed = createTicketEmbed(
                '❌ Not a Ticket Channel',
                'This command can only be used in ticket channels.',
                colors.danger
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (ticket.status === 'closed') {
            const embed = createTicketEmbed(
                '⚠️ Ticket Already Closed',
                'This ticket is already closed.',
                colors.warning
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const config = db.getConfig(interaction.guild.id);
        
        // Only staff and admins can close tickets (users cannot)
        const isStaff = config.staffRoles.some(roleId => 
            interaction.member.roles.cache.has(roleId)
        );
        const isAdmin = interaction.member.permissions.has('Administrator');

        if (!isStaff && !isAdmin) {
            const embed = createTicketEmbed(
                '❌ No Permission',
                'Only staff members can close tickets.',
                colors.danger
            );
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        try {
            // Close ticket in database first
            const closedTicket = db.closeTicket(interaction.guild.id, interaction.channel.id);

            // Send closing message
            const embed = createTicketEmbed(
                '🔒 Ticket Closing',
                `Ticket closed by ${interaction.user}\nChannel will be deleted in 10 seconds...`,
                colors.info
            );

            await interaction.editReply({ embeds: [embed] });

            // Send logs (using messages from database)
            await sendTicketLog(interaction.guild, closedTicket, config.logChannel);

            // Delete channel after delay
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('Error deleting ticket channel:', error);
                }
            }, 10000);

        } catch (error) {
            console.error('Error closing ticket:', error);
            
            const errorEmbed = createTicketEmbed(
                '❌ Error Closing Ticket',
                'There was an error closing the ticket. Please try again.',
                colors.danger
            );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};