# ============================================================
# Moda Store — Backend (Express + Stripe + BullMQ)
# Multi-stage build para imagem mínima
# ============================================================

# ─── Stage 1: Dependencies ─────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Usuário não-root para segurança
RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

# Copiar apenas prod dependencies + build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Remover devDependencies
RUN npm prune --production 2>/dev/null || true

USER appuser

EXPOSE 3001

CMD ["node", "dist/index.js"]
