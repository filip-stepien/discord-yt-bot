import { SlashCommandBuilder } from 'discord.js';
import { editQueueEndReply } from '../player.js';

async function editSkipReply(interaction) {
    await interaction.editReply({
        content: '**Skipped!**',
        components: []
    });

    setTimeout(async () => await interaction.deleteReply(), 1000);
}

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips current song'),
    async execute(client, interaction) {
        client.player.stop();
        
        if (client.queue.length > 0) {
            await editSkipReply(interaction);
        } else {
            await editQueueEndReply(interaction);
        }
    }
};