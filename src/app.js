import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { err, warn, success } from './logs.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { createPlayer, isUserConnectedToVc } from './player.js';
import 'dotenv/config';

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

    if (!isUserConnectedToVc(interaction)) {
        await interaction.followUp({ 
            content: '**You have to be connected to voice channel to use this command!**', 
            ephemeral: true 
        });

        return;
    }

    try {
        await interaction.deferReply();
        await command.execute(client, interaction);
    } catch (e) {
        err(e);

        const interactionOptions = {
            content: 'There was an error while executing this command!', 
            ephemeral: true 
        };

        if (interaction.replied || interaction.deferred) {
			await interaction.followUp(interactionOptions);
		} else {
			await interaction.reply(interactionOptions);
		}
    }
});