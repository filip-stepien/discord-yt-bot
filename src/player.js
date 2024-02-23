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
            playAudio(client.lastPlayerInteraction, client, client.queue[0]);
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

export async function playAudio(interaction, client, url) {
    const connection = getVoiceConnection(interaction.member.voice.guildId) ?? connectToUserVoiceChannel(interaction);
    if (!connection) return false;

    connection.subscribe(client.player);

    if (!playerBusy(client)) {
        const song = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(song);
        client.player.play(resource);
        client.lastPlayerInteraction = interaction;

        await interaction.editReply({ 
            content: `**Now playing:**\n[${await getSongTitle(url)}](${url})`,
            ephemeral: true,
            components: []
        });
    } else {
        client.queue.push(url);
        await interaction.editReply({ 
            content: `**Added to queue:**\n${await getSongTitle(url)}`,
            ephemeral: true,
            components: []
        });

        setTimeout(async () => await interaction.deleteReply(), 3000);
    }

    return true;
}