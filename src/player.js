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
    return client.player._state.status !== 'idle';
}

export function createPlayer(client) {
    const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
    });

    player.on(AudioPlayerStatus.Idle, () => {
        if (client.queue.length > 0) {
            playAudio(client.playerInteraction, client, client.queue[0]);
            client.queue.shift();
        }
    });

    return player;
}

export async function getSongTitle(url) {
    const id = ytid(url);
    const song = await yts({ videoId: id });
    return song.title;
}

export function playAudio(interaction, client, url) {
    const connection = getVoiceConnection(interaction.member.voice.guildId) ?? connectToUserVoiceChannel(interaction);
    if (!connection) return false;

    connection.subscribe(client.player);

    if (!playerBusy(client)) {
        const song = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(song);
        client.player.play(resource);
        client.playerInteraction = interaction;
    } else {
        client.queue.push(url);
    }

    return true;
}