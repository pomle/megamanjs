FROM node:8

MAINTAINER "Pontus Alexander <pontus.alexander@gmail.com>"

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json yarn.lock ./
RUN yarn

COPY public/ ./public
COPY src/ ./src
RUN yarn build

CMD ["yarn", "run", "start:prod"]
