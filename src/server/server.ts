import path from 'path';
import fs from 'fs';
import serve from 'koa-static';
import {Origins, Server, FlatFile} from 'boardgame.io/dist/cjs/server.js';
import {ExplodingKittens} from '../common';
import { BoardGame } from '../common/board-game/board-race';
import { GameTransport } from './game-transport';

const port = parseInt(process.env.PORT || process.env.SERVER_PORT || '51399', 10);

let origins: string | string[] | boolean | RegExp = Origins.LOCALHOST_IN_DEVELOPMENT;

if (process.env.NODE_ENV === 'production') {
  if (process.env.SERVER_ORIGINS) {
    if (process.env.SERVER_ORIGINS === '*') {
      origins = true;
    } else {
      origins = process.env.SERVER_ORIGINS.split(',');
    }
  } else {
    // Default to true in production if not specified to allow connections from any domain/host
    origins = true;
  }
} else {
  // Always allow all origins in development
  origins = true;
}

// Persistent database storage (FlatFile)
let db: any;
const flatfileDir = process.env.FLATFILE_DIR || (process.env.NODE_ENV === 'production' ? path.resolve('./storage/data') : undefined);
if (flatfileDir) {
  try {
    if (!fs.existsSync(flatfileDir)) {
      fs.mkdirSync(flatfileDir, { recursive: true });
    }
    db = new FlatFile({ dir: flatfileDir });
    console.log(`💾 Using FlatFile database persistence at: ${flatfileDir}`);
  } catch (err) {
    console.error(err);
    throw new Error(`Could not initialize persistent storage at ${flatfileDir}`);
  }
}

const transport = new GameTransport();
const server = Server({
  games: [ExplodingKittens as any, BoardGame as any],
  origins,
  transport,
  ...(db ? { db } : {}),
});

// Health check endpoint for Docker, Cloud Run, Railway, Render, etc.
server.router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    status: 'ok',
    game: 'Exploding-Kittens',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };
});

// Filter out inactive matches from lobby list
server.router.use('/games/:name', async (ctx, next) => {
  await next();

  if (ctx.method === 'GET' && ctx.body && ctx.body.matches) {
    ctx.body.matches = ctx.body.matches.filter((match: any) => {
      return match.players.some((player: any) => player.isConnected === true);
    });
  }
});

// Serve frontend dist files if they exist (for unified production deployment)
const clientDistPath = path.resolve('dist');
if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  console.log(`📦 Serving static client build from: ${clientDistPath}`);
  // The server build lives under dist/server beside the public client build.
  server.app.use(async (ctx, next) => {
    let pathname: string;
    try { pathname = decodeURIComponent(ctx.path).replace(/\\/g, '/'); }
    catch { ctx.status = 400; return; }
    if (pathname.split('/').some(segment => segment.toLowerCase() === 'server')) {
      ctx.status = 404;
      return;
    }
    await next();
  });

  // Cache Egress Optimization Middleware for CDN / Cloudflare R2 / Browser Edge
  server.app.use(async (ctx, next) => {
    await next();
    if (ctx.status === 200 && ['GET', 'HEAD'].includes(ctx.method)) {
      if (ctx.path.startsWith('/assets/')) {
        // Hashed JS/CSS, images, sounds: Cache for 1 year immutable to eliminate repeat egress
        ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (ctx.path === '/' || ctx.path.endsWith('.html')) {
        // HTML entry point: revalidate so new deploys are picked up immediately
        ctx.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  });

  server.app.use(serve(clientDistPath, {
    maxage: 31536000000,
  }));

  // SPA fallback for HTML5 History API (e.g. /matchId routes)
  server.app.use(async (ctx, next) => {
    await next();
    if (ctx.status !== 404 || !['GET', 'HEAD'].includes(ctx.method) ||
        /^\/(games|health|assets|socket\.io)(\/|$)/.test(ctx.path) ||
        path.extname(ctx.path) || !ctx.accepts('html')) return;
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      ctx.type = 'html';
      ctx.body = fs.createReadStream(indexPath);
    }
  });
}

server.run(port, () => {
  console.log(`🎮 Exploding Kittens server running on port ${port}`);
  console.log(`🌐 Lobby API enabled at http://localhost:${port}/games`);
  console.log(`📡 Server environment: ${process.env.NODE_ENV || 'development'}`);
  const tick = async () => {
    try { await transport.tickDeadlines(server.db, server.auth); }
    catch (error) { console.error('Failed to process game deadlines:', error); }
    setTimeout(tick, 250).unref();
  };
  void tick();
}).catch(error => {
  console.error('Unable to start game server:', error);
  process.exitCode = 1;
});
