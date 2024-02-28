import { SlashCommandBuilder } from 'discord.js';
import { isPaused } from '../player.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes paused song'),
    async execute(client, interaction) {
        if (isPaused(client)) {
            client.player.unpause();

            await interaction.editReply({
                content: '**The song has been resumed.**',
                compontents: []
            });
        } else {
            await interaction.editReply({
                content: '**Currently there is no song to resume.**',
                compontents: [],
                ephemeral: true
            });
        }
    }
};