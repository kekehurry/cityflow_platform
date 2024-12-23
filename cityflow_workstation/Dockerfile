# Stage 1: Build
FROM node:18.20-alpine AS build

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Production
FROM docker:27.2.1-dind AS production

RUN apk add --no-cache nodejs npm libc6-compat

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

ENV HOSTNAME='0.0.0.0'

# Run the server
CMD ["/bin/sh", "-c", "node server.js"]
