import yts from 'yt-search';
import { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource } from '@discordjs/voice';
import { 
    ActionRowBuilder, 
    SlashCommandBuilder, 
    StringSelectMenuOptionBuilder, 
    StringSelectMenuBuilder, 
    ComponentType
} from 'discord.js';
import ytdl from 'ytdl-core';

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
        collector.on('collect', async i => {
            await interaction.editReply({ content: i.values[0], components: [] });
            resolve(i.values[0]);
        });
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
    async execute(interaction) {
        await interaction.deferReply();

        const prompt = interaction.options.getString('prompt');
        const row = await getSelectMenuRow(prompt);

        const vc = interaction.member.voice.channel;
        const connection = joinVoiceChannel({ 
            channelId: vc.id,
            guildId: vc.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
        });

        connection.subscribe(player);
        
        const url = await handleSelection(interaction, row);
        const song = ytdl(url, { filter: 'audioonly' });

        const resource = createAudioResource(song);
        player.play(resource);

        player.on('error', e => console.log(e));
    }
};