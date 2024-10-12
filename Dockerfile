FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Rebuild bcrypt and other binary modules
RUN npm rebuild bcrypt --build-from-source && npm rebuild

COPY . .

RUN npm run build

EXPOSE 3000

# Use an environment variable to determine the startup command
CMD if [ "$NODE_ENV" = "production" ]; \
    then node dist/server.js; \
    else npm run local; \
    fi