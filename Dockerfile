# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine

# System dependencies: ffmpeg + python3/pip for yt-dlp
RUN apk add --no-cache \
      ffmpeg \
      python3 \
      py3-pip \
      curl \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && ln -sf /usr/bin/yt-dlp /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY src/public ./dist/public

ENV NODE_ENV=production
# Point the player utility to the system yt-dlp binary
ENV YTDLP_PATH=/usr/bin/yt-dlp
# Web interface port
ENV WEB_PORT=3000

# Persistent volume for sound files
VOLUME ["/app/sounds"]

EXPOSE 3000

# The bot is a long-running process
CMD ["node", "dist/index.js"]
