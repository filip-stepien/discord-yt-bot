import { REST, Routes } from 'discord.js';
import { err, success, warn } from './logs.js';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import 'dotenv/config';

async function getSerializedCommands() {
	const commands = [];
    const commandsFolder = resolve('./src/commands');
    const files = readdirSync(commandsFolder);

    for (const file of files) {
        const commandModule = await import(`./commands/${file}`);
		const command = commandModule.default;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            warn(`The command at ${file} is missing a required 'data' or 'execute' property.`);
        }
    }

	return commands;
}

async function deployCommands() {
	success('Started refreshing application commands...');

	try {
		const rest = new REST().setToken(process.env.TOKEN);
		const serializedCommands = await getSerializedCommands();

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: serializedCommands }
		);

		success(`Sucessfully deployed ${data.length} commands.`);
	} catch (e) {
		err('An error occured while deploying application commands.\n' + e);
	}
}

deployCommands();