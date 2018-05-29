FROM node:latest

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 4242

CMD ["yarn", "dev"]
