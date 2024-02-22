import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { err, warn, success } from './logs.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

function setCommands(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const mainPath = path.join(__dirname, '..');
    const foldersPath = path.join(mainPath, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
    
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                warn(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property.`);
            }
        }
    }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
setCommands(client);

client.login(process.env.TOKEN).catch(() => err('Token is invalid. Make sure .env file contains correct token.'));

client.once(Events.ClientReady, readyClient => {
    success(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch {
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
    }
});