# FROM define a imagem como base para executar a aplicação.
FROM node:20-alpine

# WORKDIR define o diretório para rodar a aplicação dentro da imagem. O ideal é criar uma pasta dentro
# da imagem para colocar o projeto, e não dentro da raiz da imagem.
WORKDIR /app

# Primeiro ponto indica todos os arquivos do projeto e Segundo indica o diretório de trabalho acima.
COPY . .

# Instala as dependências do projeto lendo o arquivo package.json
RUN npm install

RUN npm run build

# Precisamos expor a porta do nosso projeto para se comunicar com o container.
EXPOSE 3333

CMD ["npm", "start"]
