# syntax=docker/dockerfile:1

# ==========================================
# 1. Base Image - Setup Node
# ==========================================
FROM node:18-alpine AS base
# Install libc6-compat for Prisma and Alpine compatibility
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ==========================================
# 2. Dependencies Stage
# ==========================================
FROM base AS deps
COPY package.json package-lock.json* ./
# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# ==========================================
# 3. Builder Stage
# ==========================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Important before build)
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# ==========================================
# 4. Production Runner Stage
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js telemetry disable (optional but recommended)
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
# Ensure Next.js binds to all interfaces in Docker
ENV HOSTNAME="0.0.0.0"

# Healthcheck to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the standalone server
CMD ["node", "server.js"]
