import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import * as playdl from 'play-dl';
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

function normalizeYouTubeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const videoId =
      parsed.searchParams.get('v') ||
      (parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : null);
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {}
  return url;
}

async function getTitle(url: string): Promise<string> {
  if (isYouTubeUrl(url)) {
    try {
      const info = await playdl.video_info(normalizeYouTubeUrl(url));
      return info.video_details.title ?? url;
    } catch {
      return url;
    }
  }
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
    const stream = await playdl.stream(normalizeYouTubeUrl(entry.url), { quality: 2 });
    resource = createAudioResource(stream.stream, { inputType: stream.type });
  } else {
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
