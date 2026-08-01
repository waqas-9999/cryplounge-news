# Multi-stage build: compile with the full toolchain, ship only the result.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production dependencies only, in their own layer so the final image never
# carries devDependencies (typescript, jest, ts-node, ...).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

USER nestjs
EXPOSE 4000

# Applies pending migrations, then starts the API. `migrate deploy` is safe
# to run on every boot — it is a no-op when the schema is already current.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
