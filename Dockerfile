FROM node:14.21.3-alpine
# FROM node
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
## EXPOSE [Port you mentioned in the vite.config file]
EXPOSE 3000

CMD ["yarn", "serve"]