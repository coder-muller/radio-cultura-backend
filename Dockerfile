# Usa uma imagem oficial do Node.js
FROM node:22-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas arquivos essenciais
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia todo o código
COPY . .

# Gera os arquivos do Prisma (se necessário)
RUN npx prisma generate

# Expõe a porta do servidor
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
