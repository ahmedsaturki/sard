# Sard Dockerfile - Multi-stage build
# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/
COPY apps/*/package.json apps/
COPY packages/db/package.json packages/db/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Stage 2: Runtime
FROM node:24-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/
COPY apps/*/package.json apps/

# Install only production dependencies (skip prepare script)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps
RUN mkdir -p /app/packages/db && cp -r /app/packages/db/dist/* /app/packages/db/ 2>/dev/null || true

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000 4321

ENV NODE_ENV=production

CMD ["pnpm", "lite:start"]