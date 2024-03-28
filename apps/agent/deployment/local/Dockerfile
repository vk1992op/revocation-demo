FROM node:18.16.0-buster-slim

RUN apt update -y && apt install python3 git make build-essential -y

WORKDIR app

COPY ./dist/apps/agent .
COPY package.json yarn.lock ./

RUN yarn install

EXPOSE 8080
EXPOSE 8001
EXPOSE 6001

CMD ["node", "main.js"]
