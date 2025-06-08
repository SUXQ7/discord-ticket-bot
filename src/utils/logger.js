import { AttachmentBuilder } from 'discord.js';
import { createTicketEmbed, colors } from './embeds.js';

export async function createTicketLog(ticket, guild, messages = []) {
    const logContent = [
        `TICKET LOG - ${ticket.id.toUpperCase()}`,
        `=====================================`,
        `Category: ${ticket.category}`,
        `Created by: ${ticket.userId}`,
        `Created at: ${new Date(ticket.createdAt).toLocaleString()}`,
        `Closed at: ${new Date(ticket.closedAt).toLocaleString()}`,
        `Status: ${ticket.status}`,
        `=====================================`,
        ``,
        `MESSAGES:`,
        `--------`
    ];

    // Add stored messages from database
    if (ticket.messages && ticket.messages.length > 0) {
        for (const msg of ticket.messages) {
            logContent.push(`[${new Date(msg.timestamp).toLocaleString()}] ${msg.author}: ${msg.content}`);
        }
    }

    // Add any additional messages passed to the function
    if (messages && messages.length > 0) {
        for (const msg of messages) {
            const timestamp = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : new Date().toLocaleString();
            logContent.push(`[${timestamp}] ${msg.author.displayName || msg.author.username}: ${msg.content}`);
        }
    }

    logContent.push(``, `=====================================`, `End of ticket log`);

    const logText = logContent.join('\n');
    const attachment = new AttachmentBuilder(Buffer.from(logText, 'utf8'), { 
        name: `${ticket.id}-log.txt` 
    });

    const logEmbed = createTicketEmbed(
        `🗂️ Ticket Closed - ${ticket.id}`,
        `**Category:** ${ticket.category}\n**User:** <@${ticket.userId}>\n**Duration:** ${calculateDuration(ticket.createdAt, ticket.closedAt)}`,
        colors.info
    );

    return { embed: logEmbed, attachment };
}

export async function sendTicketLog(guild, ticket, logChannelId, messages = []) {
    try {
        const { embed, attachment } = await createTicketLog(ticket, guild, messages);
        
        if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [embed], files: [attachment] });
            }
        }

        // Send to user's DM
        try {
            const user = await guild.client.users.fetch(ticket.userId);
            const dmEmbed = createTicketEmbed(
                `📋 Your Ticket Log - ${ticket.id}`,
                `Your support ticket has been closed. Here's a copy of the conversation for your records.`,
                colors.info
            );
            await user.send({ embeds: [dmEmbed], files: [attachment] });
        } catch (error) {
            console.log(`Could not send DM to user ${ticket.userId}:`, error.message);
        }

        return { embed, attachment };
    } catch (error) {
        console.error('Error creating ticket log:', error);
        return null;
    }
}

function calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end - start;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}