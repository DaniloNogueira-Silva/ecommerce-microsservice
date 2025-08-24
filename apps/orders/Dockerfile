# apps/orders/Dockerfile
FROM node:20-slim

WORKDIR /usr/src/app

# Copia os package.json da raiz e do app específico
COPY package*.json ./
COPY apps/orders/package.json ./apps/orders/

# Instala todas as dependências do monorepo
RUN npm install

# Copia todo o código-fonte
COPY . .

# Constrói apenas a aplicação 'orders'
RUN npm run build -- orders

# Move o resultado do build e as dependências de produção para uma pasta final
RUN mkdir -p /usr/src/prod \
    && mv dist /usr/src/prod/dist \
    && mv node_modules /usr/src/prod/node_modules

# Define a pasta de produção como o diretório de trabalho
WORKDIR /usr/src/prod

# Comando para iniciar a aplicação
CMD ["node", "dist/apps/orders/main.js"]