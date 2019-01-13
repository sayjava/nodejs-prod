FROM node:10.15.0-alpine

RUN apk add bash

RUN mkdir nodeapp

WORKDIR nodeapp

COPY package.json .

RUN npm install

COPY . .

ENTRYPOINT ["./go", "start"]