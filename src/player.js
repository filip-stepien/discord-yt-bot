import { createAudioPlayer, createAudioResource, NoSubscriberBehavior } from 'discord.js';

const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
});