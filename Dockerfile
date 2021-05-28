FROM node:alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn

COPY src src

CMD ["yarn", "start"]