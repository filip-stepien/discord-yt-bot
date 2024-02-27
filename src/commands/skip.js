import { SlashCommandBuilder } from 'discord.js';
import { playAudio, editQueueEndReply } from '../player.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current song'),
    async execute(client, interaction) {
        await interaction.deferReply();
        client.player.pause();
        
        const url = client.queue.length > 0 ? client.queue[0] : null;
        if (url) {
            await playAudio(interaction, client, url);
        } else {
            await editQueueEndReply(interaction);
        }
    }
};