import { SlashCommandBuilder } from 'discord.js';
import { isPlaying } from '../player.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses current song'),
    async execute(client, interaction) {
        if (isPlaying(client)) {
            client.player.pause();

            await interaction.editReply({
                content: '**The song has been paused.**',
                compontents: []
            });
        } else {
            await interaction.editReply({
                content: '**Currently there is no song to pause.**',
                compontents: [],
                ephemeral: true
            });
        }
    }
};