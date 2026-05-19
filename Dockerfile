FROM node:20-alpine3.18

ENV NODE_ENV=production
RUN mkdir /app
COPY yarn.lock /app
COPY package.json /app
WORKDIR /app

RUN apk add --no-cache postgresql-client
RUN NODE_ENV=development yarn install
COPY . /app
RUN yarn run build
RUN mkdir -p /app/dist
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
CMD ["/docker-entrypoint.sh"]
