import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } from '@discordjs/voice';
import { err, warn, success } from './logs.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';
import { createPlayer } from './player.js';

async function getClientCommands() {
    const commands = new Collection();
    const commandsFolder = resolve('./src/commands');
    const files = readdirSync(commandsFolder);

    for (const file of files) {
        const commandModule = await import(`./commands/${file}`);
        const command = commandModule.default;

        if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command);
        } else {
            warn(`The command at ${file} is missing a required 'data' or 'execute' property.`);
        }
    }

    return commands;
}

async function createClient() {
    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildVoiceStates
        ] 
    });

    client.commands = await getClientCommands();
    client.player = createPlayer(client);
    client.lastPlayerInteraction = null;
    client.queue = [];

    return client;
}

const client = await createClient();

client.login(process.env.TOKEN).catch(() => err('Token is invalid. Make sure .env file contains correct token.'));

client.once(Events.ClientReady, readyClient => {
    success(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (e) {
        console.log(e);

        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
    }
});