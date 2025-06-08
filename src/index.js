import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Collections for commands, events, and buttons
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = pathToFileURL(join(commandsPath, file)).href;
    const command = await import(filePath);
    if ('data' in command.default && 'execute' in command.default) {
        client.commands.set(command.default.data.name, command.default);
        console.log(`✅ Loaded command: ${command.default.data.name}`);
    }
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = pathToFileURL(join(eventsPath, file)).href;
    const event = await import(filePath);
    if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
        client.on(event.default.name, (...args) => event.default.execute(...args));
    }
    console.log(`✅ Loaded event: ${event.default.name}`);
}

// Load interactions (buttons, select menus)
const interactionsPath = join(__dirname, 'interactions');
const interactionFiles = readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
    const filePath = pathToFileURL(join(interactionsPath, file)).href;
    const interaction = await import(filePath);
    
    if (interaction.default.type === 'button') {
        client.buttons.set(interaction.default.customId, interaction.default);
        console.log(`✅ Loaded button: ${interaction.default.customId}`);
    } else if (interaction.default.type === 'selectMenu') {
        client.selectMenus.set(interaction.default.customId, interaction.default);
        console.log(`✅ Loaded select menu: ${interaction.default.customId}`);
    }
}

// Global error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

client.login(process.env.DISCORD_TOKEN);