import { Events } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);
                
                const errorMessage = { 
                    content: '❌ There was an error while executing this command!', 
                    ephemeral: true 
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        // Handle button interactions
        else if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId);

            if (!button) return;

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(`Error executing button ${interaction.customId}:`, error);
                
                const errorMessage = { 
                    content: '❌ There was an error while processing this interaction!', 
                    ephemeral: true 
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        // Handle select menu interactions
        else if (interaction.isStringSelectMenu()) {
            const selectMenu = interaction.client.selectMenus.get(interaction.customId);

            if (!selectMenu) return;

            try {
                await selectMenu.execute(interaction);
            } catch (error) {
                console.error(`Error executing select menu ${interaction.customId}:`, error);
                
                const errorMessage = { 
                    content: '❌ There was an error while processing this interaction!', 
                    ephemeral: true 
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};