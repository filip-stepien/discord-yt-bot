import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    NoSubscriberBehavior, 
    createAudioResource, 
    getVoiceConnection
} from '@discordjs/voice';
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

function connectToUserVoiceChannel(interaction) {
    const vc = interaction.member.voice.channel;

    if (vc) {
        return joinVoiceChannel({ 
            channelId: vc.id,
            guildId: vc.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator
        });
    } else {
        return null;
    }
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
        const url = await handleSelection(interaction, row);
        const song = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(song);
        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
        });

        const connection = getVoiceConnection(interaction.member.voice.guildId) ?? connectToUserVoiceChannel(interaction);

        if (connection) {
            connection.subscribe(player);
            player.play(resource);

            await interaction.editReply({ 
                content: `**Now playing:**`,
                components: []
            });
        } else {
            await interaction.editReply({ 
                content: 'You have to be on the voice channel to play music.',
                ephemeral: true,
                components: []
            });
        }
    }
};