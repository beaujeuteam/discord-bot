import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
  StreamType,
} from '@discordjs/voice';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { URL } from 'url';

const execFileAsync = promisify(execFile);

// yt-dlp binary: prefer the up-to-date version in ~/.local/bin
const YT_DLP = process.env.YTDLP_PATH ||
  `${process.env.HOME}/.local/bin/yt-dlp`;

interface QueueEntry {
  url: string;
  title: string;
}

interface GuildQueue {
  player: AudioPlayer;
  queue: QueueEntry[];
  current: QueueEntry | null;
}

const guildQueues = new Map<string, GuildQueue>();

function isSupportedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function getTitle(url: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(YT_DLP, [
      '--no-playlist',
      '--print', 'title',
      url,
    ]);
    return stdout.trim() || url;
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
  guildQueue.current = entry;

  // yt-dlp streams the best audio format to stdout
  const ytdlp = spawn(YT_DLP, [
    '--no-playlist',
    '-f', 'bestaudio',
    '-o', '-',
    '--quiet',
    entry.url,
  ]);

  // ffmpeg transcodes to opus (required by Discord)
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-vn',
    '-ar', '48000',
    '-ac', '2',
    '-f', 'opus',
    '-b:a', '128k',
    'pipe:1',
  ], { stdio: ['pipe', 'pipe', 'ignore'] });

  ytdlp.stdout.pipe(ffmpeg.stdin);

  ytdlp.on('error', (err) => console.error('[yt-dlp]', err.message));
  ffmpeg.on('error', (err) => console.error('[ffmpeg]', err.message));

  const resource = createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.OggOpus,
  });

  guildQueue.player.play(resource);
  connection.subscribe(guildQueue.player);
}

export async function addToQueue(
  guildId: string,
  url: string
): Promise<{ title: string; position: number }> {
  if (!isSupportedUrl(url)) throw new Error(`URL non supportée : ${url}`);

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

    guildQueues.set(guildId, { player, queue: [], current: null });
  }

  const guildQueue = guildQueues.get(guildId)!;
  guildQueue.queue.push(entry);
  const position = guildQueue.queue.length;

  if (guildQueue.player.state.status === AudioPlayerStatus.Idle) {
    await playNext(guildId);
  }

  return { title, position: position };
}

export function getQueue(guildId: string): QueueEntry[] {
  return guildQueues.get(guildId)?.queue ?? [];
}

export function getCurrentTrack(guildId: string): QueueEntry | null {
  return guildQueues.get(guildId)?.current ?? null;
}

export function stopPlayer(guildId: string): void {
  const guildQueue = guildQueues.get(guildId);
  if (guildQueue) {
    guildQueue.queue = [];
    guildQueue.player.stop();
    guildQueues.delete(guildId);
  }
}

export function skipTrack(guildId: string): boolean {
  const guildQueue = guildQueues.get(guildId);
  if (!guildQueue) return false;

  // Stopping the player triggers the AudioPlayerStatus.Idle event,
  // which calls playNext() automatically.
  guildQueue.player.stop();
  return true;
}
