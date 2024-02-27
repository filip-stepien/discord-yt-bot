import { SlashCommandBuilder } from 'discord.js';

async function editQueueStopReply(interaction) {
    await interaction.editReply({
        content: '**Player stopped - the queue has been cleared.**',
        components: []
    });
}

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops current song and clears the queue'),
    async execute(client, interaction) {
        client.player.stop();
        client.queue = [];

        await editQueueStopReply(interaction);
    }
};