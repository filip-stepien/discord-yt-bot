import { playAudio } from '../player.js';
import yts from 'yt-search';
import { 
    ActionRowBuilder, 
    SlashCommandBuilder, 
    StringSelectMenuOptionBuilder, 
    StringSelectMenuBuilder, 
    ComponentType
} from 'discord.js';

async function getSelectMenuRow(prompt) {
    const songs = await yts(prompt);
    const selectOptions = songs.videos.map(song => 
        new StringSelectMenuOptionBuilder()
        .setLabel(song.title)
        .setDescription(song.author.name)
        .setValue(song.url)
    );

    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Select song')
        .addOptions(selectOptions)
    );
}

async function handleSelection(interaction, selectMenuRow) {
    const response = await interaction.editReply({
        components: [selectMenuRow]
    });

    const collector = response.createMessageComponentCollector({ 
        componentType: ComponentType.StringSelect 
    });

    return new Promise(resolve => {
        collector.on('collect', i => resolve(i.values[0]));
    });
}

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays song')
        .addStringOption(option => 
            option.setName('prompt')
                .setDescription('Search by URL or term')
                .setRequired(true)
        ),
    async execute(client, interaction) {
        const prompt = interaction.options.getString('prompt');
        const row = await getSelectMenuRow(prompt);
        const url = await handleSelection(interaction, row);
        
        await playAudio(interaction, client, url);
    }
};