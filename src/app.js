import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { err, warn, success } from './logs.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

async function setClientCommands(client) {
    const commandsFolder = resolve('./src/commands');
    const files = readdirSync(commandsFolder);

    for (const file of files) {
        const commandModule = await import(`./commands/${file}`);
        const command = commandModule.default;

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            warn(`The command at ${file} is missing a required 'data' or 'execute' property.`);
        }
    }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
setClientCommands(client);

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
    } catch (e) {
        console.log(e);

        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
    }
});