# Discord Ticket Bot System

A comprehensive Discord bot for managing support tickets with advanced features like category-based organization, role-based permissions, and automatic logging.

## Features

- 🎫 **Category-based Ticket System** - Organize tickets by different support categories
- 👥 **Role-based Staff Management** - Configure which roles can respond to tickets
- 🔄 **Command-less Operations** - Use buttons and select menus for seamless user experience
- 📄 **Automatic Logging** - Generate text file logs of all ticket conversations
- 📬 **Multi-channel Logging** - Send logs to admin channels and user DMs
- 🛡️ **Permission System** - Secure ticket access with proper role management
- 📊 **Persistent Data** - Store configurations and ticket data in JSON files

## Setup Instructions

### 1. Bot Creation
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and bot
3. Copy the bot token and client ID

### 2. Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your bot credentials:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Deploy Commands
```bash
npm run deploy
```

### 5. Start the Bot
```bash
npm run dev
```

## Bot Setup Commands

### 1. Configure Categories
```
/ticket-setup category key:support name:"General Support" description:"General help and questions" channel:#support-category emoji:🛠️
```

### 2. Configure Staff Roles
```
/ticket-setup staff role:@Support Team action:add
```

### 3. Configure Log Channel
```
/ticket-setup logs channel:#ticket-logs
```

### 4. Create Ticket Panel
```
/ticket-panel
```

## How It Works

### For Users:
1. User clicks on the ticket panel
2. Selects appropriate category from dropdown
3. Bot creates private ticket channel
4. User can discuss their issue with staff
5. Ticket can be closed by user or staff
6. User receives conversation log in DM

### For Staff:
1. Get mentioned when new tickets are created
2. Can view and respond to tickets in designated categories
3. Can close tickets using the close button
4. Ticket logs are automatically sent to configured log channel

### For Administrators:
1. Set up categories with specific channels and descriptions
2. Configure which roles can respond to tickets
3. Set up log channels for ticket archives
4. Full control over ticket system configuration

## File Structure

```
src/
├── commands/           # Slash commands
│   ├── ticket-setup.js
│   ├── ticket-panel.js
│   └── help.js
├── events/            # Discord.js events
│   ├── ready.js
│   ├── interactionCreate.js
│   └── messageCreate.js
├── interactions/      # Button and select menu handlers
│   ├── ticket-category-select.js
│   └── close-ticket.js
├── utils/            # Utility functions
│   ├── database.js
│   ├── embeds.js
│   └── logger.js
├── data/             # Persistent data storage
│   ├── config.json
│   └── tickets.json
└── index.js          # Main bot file
```

## Commands Reference

- `/help` - Show setup instructions
- `/ticket-setup category` - Add/modify ticket categories
- `/ticket-setup staff` - Configure staff roles
- `/ticket-setup logs` - Set log channel
- `/ticket-panel` - Create ticket creation panel

## Permissions Required

The bot needs the following permissions:
- Read Messages
- Send Messages
- Manage Channels
- Manage Roles
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands

## Support

For issues or questions about the bot, please check the code comments or modify the configuration as needed.