import { Events } from 'discord.js';
import { db } from '../utils/database.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages and system messages
        if (message.author.bot || message.system) return;

        // Check if message is in a ticket channel
        const tickets = db.getTickets(message.guild.id);
        const ticket = tickets[message.channel.id];

        if (ticket && ticket.status === 'open') {
            // Only log actual user messages (not empty content)
            if (message.content && message.content.trim().length > 0) {
                db.addMessage(
                    message.guild.id,
                    message.channel.id,
                    message.author.displayName || message.author.username,
                    message.content
                );
            }
        }
    },
};