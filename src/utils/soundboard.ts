import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
  StreamType,
} from '@discordjs/voice';
import { spawn } from 'child_process';
import * as path from 'path';

export const SOUNDS_DIR = path.resolve(
  process.env.SOUNDS_DIR || path.join(process.cwd(), 'sounds')
);

// One dedicated player per guild for soundboard (interrupts music)
const soundPlayers = new Map<string, AudioPlayer>();

function getSoundPlayer(guildId: string): AudioPlayer {
  if (!soundPlayers.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Stop },
    });
    player.on('error', (err) =>
      console.error(`[Soundboard] Erreur dans ${guildId}:`, err.message)
    );
    soundPlayers.set(guildId, player);
  }
  return soundPlayers.get(guildId)!;
}

/**
 * Plays a sound file (by filename) in the current voice connection of a guild.
 * Returns false if the bot is not connected to a voice channel in that guild.
 */
export function playSound(guildId: string, filename: string): boolean {
  const connection = getVoiceConnection(guildId);
  if (!connection) return false;

  const filePath = path.join(SOUNDS_DIR, path.basename(filename));

  // Transcode via ffmpeg to opus
  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-i', filePath,
      '-vn',
      '-ar', '48000',
      '-ac', '2',
      '-f', 'opus',
      '-b:a', '128k',
      'pipe:1',
    ],
    { stdio: ['ignore', 'pipe', 'ignore'] }
  );

  ffmpeg.on('error', (err) => console.error('[Soundboard ffmpeg]', err.message));

  const resource = createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.OggOpus,
  });

  const player = getSoundPlayer(guildId);
  player.play(resource);
  connection.subscribe(player);

  return true;
}
