import ytdl from 'ytdl-core';
import ytid from 'get-youtube-id';
import yts from 'yt-search';
import { 
    createAudioPlayer, 
    joinVoiceChannel, 
    getVoiceConnection, 
    createAudioResource, 
    AudioPlayerStatus, 
    NoSubscriberBehavior 
} from '@discordjs/voice';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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

function playerBusy(client) {
    return client.player._state.status !== 'idle' && client.player._state.status != 'paused';
}

function getButton(id, emoji) {
    return new ButtonBuilder()
    .setCustomId(id)
    .setEmoji(emoji)
    .setStyle(ButtonStyle.Primary);
}

function getPlayerControlsRow() {
    return new ActionRowBuilder().addComponents(
        getButton('loop', '🔁'),
        getButton('stop', '⏹️'),
        getButton('pause', '⏸️'),
        getButton('next', '⏩'),
        getButton('jump', '⤵️')
    );
}

async function getSongTitle(url) {
    const id = ytid(url);
    const song = await yts({ videoId: id });
    return song.title;
}

async function editCurrentSongReply(interaction, url) {
    const title = await getSongTitle(url);
    await interaction.editReply({ 
        content: `**Now playing:**\n[${title}](${url})`,
        components: []
    });
}

async function editQueueAddReply(interaction, url) {
    const title = await getSongTitle(url);
    await interaction.editReply({ 
        content: `**Added to queue:**\n${title}`,
        components: []
    });

    setTimeout(async () => await interaction.deleteReply(), 3000);
}

export async function isUserConnectedToVc(interaction) {
    return interaction.member.voice.channelId;
}

export async function editQueueEndReply(interaction) {
    await interaction.editReply({ 
        content: '**The queue has ended.**',
        components: []
    });
}

export function createPlayer(client) {
    const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
    });

    player.on(AudioPlayerStatus.Idle, () => {
        if (client.queue.length > 0) {
            playAudio(client.lastPlayerInteraction, client, client.queue[0]);
            client.queue.shift();
        }
    });

    return player;
}

export async function playAudio(interaction, client, url) {
    const connection = getVoiceConnection(interaction.member.voice.guildId) ?? connectToUserVoiceChannel(interaction);

    connection.subscribe(client.player);

    if (!playerBusy(client)) {
        const song = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(song);
        //const controls = getPlayerControlsRow();
        
        client.player.unpause();
        client.player.play(resource);
        client.lastPlayerInteraction = interaction;

        editCurrentSongReply(interaction, url);
    } else {
        client.queue.push(url);
        editQueueAddReply(interaction, url);
    }
}