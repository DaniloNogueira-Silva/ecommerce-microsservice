# ---- Estágio de Dependências ----
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

# Copia todos os package.json do monorepo
COPY package.json package-lock.json ./
COPY apps/orders/package.json ./apps/orders/
COPY apps/payments/package.json ./apps/payments/
COPY apps/inventory/package.json ./apps/inventory/
COPY apps/notifications/package.json ./apps/notifications/

# Instala todas as dependências do monorepo de forma determinística
RUN npm ci

# Copia o restante do código fonte
COPY . .

# ---- Estágio de Build ----
FROM dependencies AS builder

RUN npm run build orders

# ---- Estágio de Produção ----
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/orders ./dist

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/apps/orders/package.json ./package.json

COPY --from=builder /usr/src/app/apps/orders/src/instrument.ts ./instrument.ts

# Expõe a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "--require", "./instrument.ts", "dist/main.js"]