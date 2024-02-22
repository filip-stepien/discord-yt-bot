import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import yts from 'yt-search';

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

    collector.on('collect', async i => 
        await interaction.editReply({ content: i.values[0], components: [] })
    );
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
    async execute(interaction) {
        await interaction.deferReply();

        const prompt = await interaction.options.getString('prompt');
        const row = await getSelectMenuRow(prompt);
        
        await handleSelection(interaction, row);
    }
};