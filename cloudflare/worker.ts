import { Container } from "@cloudflare/containers";

export interface Env {
  GAME_CONTAINER: DurableObjectNamespace<GameContainer>;
  GAME_STORAGE?: R2Bucket;
}

export class GameContainer extends Container {
  // Default port the game server listens on inside the container
  defaultPort = 51399;

  // Keep the container alive for 15 minutes of inactivity before sleeping
  sleepAfter = "15m";

  envVars = {
    NODE_ENV: "production",
    PORT: "51399",
    SERVER_ORIGINS: "*",
    FLATFILE_DIR: "/app/storage/data"
  };

  override onStart() {
    console.log("🎮 Exploding Kittens server container started on Cloudflare.");
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const isStaticAsset = url.pathname.startsWith("/assets/") ||
      /\.(png|jpg|jpeg|webp|svg|ico|css|js|woff2?)$/i.test(url.pathname);

    // 1. Zero-Egress Cloudflare Edge Cache Check
    if (isStaticAsset && request.method === "GET") {
      const cache = caches.default;
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      // 2. Direct R2 Bucket Fetch (Zero container compute, cached at Edge)
      if (env.GAME_STORAGE) {
        const objectKey = url.pathname.replace(/^\//, "");
        const object = await env.GAME_STORAGE.get(objectKey);
        if (object) {
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("ETag", object.httpEtag);
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          headers.set("Access-Control-Allow-Origin", "*");

          const response = new Response(object.body, { headers });
          ctx.waitUntil(cache.put(request, response.clone()));
          return response;
        }
      }
    }

    // 3. Route to persistent GameContainer
    const id = env.GAME_CONTAINER.idFromName("exploding-kittens-backend");
    const stub = env.GAME_CONTAINER.get(id);
    const response = await stub.fetch(request);

    // 4. Cache static responses from container at Edge with immutable headers
    if (isStaticAsset && response.status === 200 && request.method === "GET") {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      const cacheableResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
      ctx.waitUntil(caches.default.put(request, cacheableResponse.clone()));
      return cacheableResponse;
    }

    return response;
  },
};
