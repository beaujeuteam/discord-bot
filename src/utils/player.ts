import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';
import fetch from 'node-fetch';
import { URL } from 'url';

interface QueueEntry {
  url: string;
  title: string;
}

interface GuildQueue {
  player: AudioPlayer;
  queue: QueueEntry[];
}

const guildQueues = new Map<string, GuildQueue>();

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtu.be')
    );
  } catch {
    return false;
  }
}

function isFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'file:' || /\.(mp3|wav|ogg|flac|aac|m4a|webm)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

async function getTitle(url: string): Promise<string> {
  if (isYouTubeUrl(url)) {
    try {
      const info = await ytdl.getBasicInfo(url);
      return info.videoDetails.title;
    } catch {
      return url;
    }
  }
  // For direct files, extract filename from URL
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1]) || url;
  } catch {
    return url;
  }
}

async function playNext(guildId: string): Promise<void> {
  const guildQueue = guildQueues.get(guildId);
  if (!guildQueue || guildQueue.queue.length === 0) {
    guildQueues.delete(guildId);
    return;
  }

  const connection = getVoiceConnection(guildId);
  if (!connection) {
    guildQueues.delete(guildId);
    return;
  }

  const entry = guildQueue.queue.shift()!;
  let resource;

  if (isYouTubeUrl(entry.url)) {
    const stream = ytdl(entry.url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    });
    resource = createAudioResource(stream);
  } else {
    // Direct file URL or audio file: fetch as stream
    const response = await fetch(entry.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    resource = createAudioResource(response.body as any);
  }

  guildQueue.player.play(resource);
  connection.subscribe(guildQueue.player);
}

export async function addToQueue(
  guildId: string,
  url: string
): Promise<{ title: string; position: number }> {
  const title = await getTitle(url);
  const entry: QueueEntry = { url, title };

  if (!guildQueues.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });

    player.on(AudioPlayerStatus.Idle, () => {
      playNext(guildId);
    });

    player.on('error', (err) => {
      console.error(`[Player] Erreur dans ${guildId}:`, err.message);
      playNext(guildId);
    });

    guildQueues.set(guildId, { player, queue: [] });
  }

  const guildQueue = guildQueues.get(guildId)!;
  guildQueue.queue.push(entry);
  const position = guildQueue.queue.length;

  // Start playing immediately if the player is idle
  if (guildQueue.player.state.status === AudioPlayerStatus.Idle) {
    await playNext(guildId);
  }

  return { title, position: position === 1 ? 0 : position };
}

export function getQueue(guildId: string): QueueEntry[] {
  return guildQueues.get(guildId)?.queue ?? [];
}

export function stopPlayer(guildId: string): void {
  const guildQueue = guildQueues.get(guildId);
  if (guildQueue) {
    guildQueue.queue = [];
    guildQueue.player.stop();
    guildQueues.delete(guildId);
  }
}
