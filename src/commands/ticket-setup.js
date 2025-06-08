import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { db } from '../utils/database.js';
import { createTicketEmbed, colors } from '../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configure the ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('category')
                .setDescription('Add or modify a ticket category')
                .addStringOption(option =>
                    option.setName('key')
                        .setDescription('Category key (internal identifier)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Category display name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Category description')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel where tickets will be created')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Category emoji')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete-category')
                .setDescription('Delete a ticket category')
                .addStringOption(option =>
                    option.setName('key')
                        .setDescription('Category key to delete')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('staff')
                .setDescription('Configure staff roles')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role that can manage tickets')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Add or remove the role')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add', value: 'add' },
                            { name: 'Remove', value: 'remove' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('Set the ticket logs channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel where ticket logs will be sent')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = db.getConfig(interaction.guild.id);

        switch (subcommand) {
            case 'category': {
                const key = interaction.options.getString('key');
                const name = interaction.options.getString('name');
                const description = interaction.options.getString('description');
                const channel = interaction.options.getChannel('channel');
                const emoji = interaction.options.getString('emoji') || '🎫';

                config.categories[key] = {
                    name,
                    description,
                    channelId: channel.id,
                    emoji
                };

                db.setConfig(interaction.guild.id, config);

                const embed = createTicketEmbed(
                    '✅ Category Configured',
                    `Category **${name}** has been set up successfully!\n\n**Key:** ${key}\n**Description:** ${description}\n**Channel:** ${channel}\n**Emoji:** ${emoji}`,
                    colors.success
                );

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'delete-category': {
                const key = interaction.options.getString('key');

                if (!config.categories[key]) {
                    const embed = createTicketEmbed(
                        '❌ Category Not Found',
                        `Category with key **${key}** does not exist.`,
                        colors.danger
                    );

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const categoryName = config.categories[key].name;
                delete config.categories[key];
                db.setConfig(interaction.guild.id, config);

                const embed = createTicketEmbed(
                    '✅ Category Deleted',
                    `Category **${categoryName}** (${key}) has been deleted successfully.`,
                    colors.success
                );

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'staff': {
                const role = interaction.options.getRole('role');
                const action = interaction.options.getString('action');

                if (action === 'add') {
                    if (!config.staffRoles.includes(role.id)) {
                        config.staffRoles.push(role.id);
                        db.setConfig(interaction.guild.id, config);

                        const embed = createTicketEmbed(
                            '✅ Staff Role Added',
                            `${role} has been added as a staff role. Members with this role can manage tickets.`,
                            colors.success
                        );

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        const embed = createTicketEmbed(
                            '⚠️ Role Already Added',
                            `${role} is already a staff role.`,
                            colors.warning
                        );

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                } else {
                    const index = config.staffRoles.indexOf(role.id);
                    if (index > -1) {
                        config.staffRoles.splice(index, 1);
                        db.setConfig(interaction.guild.id, config);

                        const embed = createTicketEmbed(
                            '✅ Staff Role Removed',
                            `${role} has been removed from staff roles.`,
                            colors.success
                        );

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        const embed = createTicketEmbed(
                            '⚠️ Role Not Found',
                            `${role} is not a staff role.`,
                            colors.warning
                        );

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }
                break;
            }

            case 'logs': {
                const channel = interaction.options.getChannel('channel');
                
                config.logChannel = channel.id;
                db.setConfig(interaction.guild.id, config);

                const embed = createTicketEmbed(
                    '✅ Log Channel Set',
                    `Ticket logs will now be sent to ${channel}.`,
                    colors.success
                );

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    },
};