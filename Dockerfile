# -------------------------------------------------------------
# Multi-stage Dockerfile for Exploding Kittens Online
# -------------------------------------------------------------

# Stage 1: Build the client and server
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build frontend and backend
RUN npm run build && npm run build:server

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=51399

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose default port
EXPOSE 51399

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-51399}/health || exit 1

# Start the unified game & web server
CMD ["node", "dist/server/server/server.js"]
