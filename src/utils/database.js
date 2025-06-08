import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '..', 'data');

class Database {
    constructor() {
        this.configPath = join(dataPath, 'config.json');
        this.ticketsPath = join(dataPath, 'tickets.json');
        this.ensureDataFiles();
    }

    ensureDataFiles() {
        // Create data directory if it doesn't exist
        import('fs').then(fs => {
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath, { recursive: true });
            }
        });

        // Initialize config file
        if (!existsSync(this.configPath)) {
            writeFileSync(this.configPath, JSON.stringify({}, null, 2));
        }

        // Initialize tickets file
        if (!existsSync(this.ticketsPath)) {
            writeFileSync(this.ticketsPath, JSON.stringify({}, null, 2));
        }
    }

    getConfig(guildId) {
        try {
            const data = JSON.parse(readFileSync(this.configPath, 'utf8'));
            return data[guildId] || {
                categories: {},
                staffRoles: [],
                logChannel: null,
                ticketCounter: 0
            };
        } catch (error) {
            console.error('Error reading config:', error);
            return {
                categories: {},
                staffRoles: [],
                logChannel: null,
                ticketCounter: 0
            };
        }
    }

    setConfig(guildId, config) {
        try {
            const data = JSON.parse(readFileSync(this.configPath, 'utf8'));
            data[guildId] = config;
            writeFileSync(this.configPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing config:', error);
        }
    }

    getTickets(guildId) {
        try {
            const data = JSON.parse(readFileSync(this.ticketsPath, 'utf8'));
            return data[guildId] || {};
        } catch (error) {
            console.error('Error reading tickets:', error);
            return {};
        }
    }

    setTickets(guildId, tickets) {
        try {
            const data = JSON.parse(readFileSync(this.ticketsPath, 'utf8'));
            data[guildId] = tickets;
            writeFileSync(this.ticketsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing tickets:', error);
        }
    }

    createTicket(guildId, userId, category, channelId) {
        const config = this.getConfig(guildId);
        const tickets = this.getTickets(guildId);
        
        config.ticketCounter++;
        const ticketId = `ticket-${config.ticketCounter.toString().padStart(4, '0')}`;
        
        tickets[channelId] = {
            id: ticketId,
            userId,
            category,
            createdAt: new Date().toISOString(),
            status: 'open',
            messages: []
        };

        this.setConfig(guildId, config);
        this.setTickets(guildId, tickets);
        
        return ticketId;
    }

    closeTicket(guildId, channelId) {
        const tickets = this.getTickets(guildId);
        if (tickets[channelId]) {
            tickets[channelId].status = 'closed';
            tickets[channelId].closedAt = new Date().toISOString();
            this.setTickets(guildId, tickets);
            return tickets[channelId];
        }
        return null;
    }

    addMessage(guildId, channelId, author, content) {
        const tickets = this.getTickets(guildId);
        if (tickets[channelId]) {
            tickets[channelId].messages.push({
                author,
                content,
                timestamp: new Date().toISOString()
            });
            this.setTickets(guildId, tickets);
        }
    }
}

export const db = new Database();