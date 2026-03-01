import express from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { playSound, SOUNDS_DIR } from './soundboard';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.aac', '.opus', '.m4a', '.webm']);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SOUNDS_DIR),
  filename: (_req, file, cb) => {
    // Sanitize filename
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Extension non supportée : ${ext}`));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

export function createWebServer(client: Client) {
  const app = express();
  app.use(express.json());

  // Serve static frontend
  app.use(express.static(PUBLIC_DIR));

  // ── API ──────────────────────────────────────────────────────────────────────

  /** List all sound files */
  app.get('/api/sounds', (_req, res) => {
    try {
      if (!fs.existsSync(SOUNDS_DIR)) fs.mkdirSync(SOUNDS_DIR, { recursive: true });
      const files = fs.readdirSync(SOUNDS_DIR).filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return ALLOWED_EXTENSIONS.has(ext);
      });
      res.json(files);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /** Upload a new sound */
  app.post('/api/sounds', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier fourni.' });
      return;
    }
    res.json({ name: req.file.filename });
  });

  /** Delete a sound */
  app.delete('/api/sounds/:name', (req, res) => {
    const name = path.basename(req.params.name);
    const filePath = path.join(SOUNDS_DIR, name);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Fichier introuvable.' });
      return;
    }
    try {
      fs.unlinkSync(filePath);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Play a sound in a given guild's current voice channel.
   * Body: { guildId: string, filename: string, channelId?: string }
   * If the bot is not already in a voice channel and channelId is provided, it joins.
   */
  app.post('/api/play', async (req, res) => {
    const { guildId, filename, channelId } = req.body as {
      guildId?: string;
      filename?: string;
      channelId?: string;
    };

    if (!guildId || !filename) {
      res.status(400).json({ error: 'guildId et filename sont requis.' });
      return;
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      res.status(400).json({ error: 'Extension non supportée.' });
      return;
    }

    const filePath = path.join(SOUNDS_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Son introuvable.' });
      return;
    }

    // Join voice channel if not already connected
    let connection = getVoiceConnection(guildId);
    if (
        channelId &&
        (!connection || (connection && connection.joinConfig.channelId !== channelId))
    ) {
      try {
        const guild = await client.guilds.fetch(guildId);
        const channel = guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId)

        if (!channel || !channel.isVoiceBased()) {
          res.status(400).json({ error: 'Canal vocal introuvable.' });
          return;
        }

        joinVoiceChannel({
          channelId: channel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        });
      } catch (err: any) {
        res.status(500).json({ error: `Impossible de rejoindre le canal : ${err.message}` });
        return;
      }
    }

    const played = playSound(guildId, filename);
    if (!played) {
      res.status(409).json({
        error: 'Le bot n\'est pas connecté à un canal vocal. Fournissez un channelId pour qu\'il rejoigne.',
      });
      return;
    }

    res.json({ ok: true });
  });

  /** List guilds the bot is in, with their voice channels */
  app.get('/api/guilds', async (_req, res) => {
    try {
      const guilds = client.guilds.cache.map((g) => ({ id: g.id, name: g.name }));
      res.json(guilds);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /** Get voice channels for a given guild */
  app.get('/api/guilds/:guildId/channels', async (req, res) => {
    try {
      const guild = client.guilds.cache.get(req.params.guildId) ??
        await client.guilds.fetch(req.params.guildId);
      const voiceChannels = guild.channels.cache
        .filter((c) => c.isVoiceBased())
        .map((c) => ({ id: c.id, name: c.name }));
      res.json(voiceChannels);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return app;
}
