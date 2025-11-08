# Etap 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Zainstaluj pnpm
RUN npm install -g pnpm

# Kopiuj pliki konfiguracyjne
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Zainstaluj zależności
RUN pnpm install --frozen-lockfile

# Kopiuj kod źródłowy
COPY src ./src
COPY public ./public

# Zbuduj aplikację
RUN pnpm run build

# Etap 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Zainstaluj pnpm
RUN npm install -g pnpm

# Zainstaluj serwer HTTP dla statycznych plików
RUN pnpm add -g serve

# Kopiuj zbudowaną aplikację z etapu builder
COPY --from=builder /app/dist ./dist

# Eksponuj port
EXPOSE 3000

# Uruchom aplikację
CMD ["serve", "-s", "dist", "-l", "3000"]
