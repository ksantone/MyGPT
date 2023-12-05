FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 3080
CMD ["sh", "-c", "npm start & node src/db.js && node src/server.js"]