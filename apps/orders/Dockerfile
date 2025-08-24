# ---- Estágio de Dependências ----
# ATUALIZADO: Usando Node.js 20 para compatibilidade com as dependências
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

# CORREÇÃO: Copia todos os package.json do monorepo para que o npm ci funcione corretamente
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

# Constrói apenas o projeto 'orders'
RUN npm run build orders

# ---- Estágio de Produção ----
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copia os artefatos de build do estágio anterior
COPY --from=builder /usr/src/app/dist/apps/orders ./dist

# Copia as dependências de produção do estágio de dependências
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# CORREÇÃO: Copia também o package.json do serviço para a imagem final, o que é uma boa prática
COPY --from=dependencies /usr/src/app/apps/orders/package.json ./package.json


# Expõe a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]