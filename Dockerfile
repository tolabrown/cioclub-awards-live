# ---- Stage 1: Build the SvelteKit application ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build (adapter-node -> ./build).
# Real secrets are read via $env/dynamic/* at RUNTIME (set in docker-compose).
# These placeholders only exist so the build's prerender pass can construct the
# betterAuth() instance without throwing. They are confined to this builder
# stage and never reach the final runtime image below.
COPY . .
ENV BETTER_AUTH_SECRET=build-time-placeholder-secret-minimum-32-characters-long
ENV BETTER_AUTH_URL=http://localhost:3000
RUN bun run build

# Prune dev dependencies so we only ship production deps
RUN bun install --frozen-lockfile --production

# ---- Stage 2: Minimal production image ----
FROM oven/bun:1-slim

WORKDIR /app

# Only what the server needs at runtime
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Health check against the adapter-node server
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "./build/index.js"]
