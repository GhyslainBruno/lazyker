FROM node:8.11.3-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /lazyker/app/client
WORKDIR /lazyker/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json /lazyker/app/
COPY client/package*.json /lazyker/app/client/

RUN npm install --silent

WORKDIR /lazyker/app/client
RUN npm install --silent

WORKDIR /lazyker/app
COPY . /lazyker/app/

WORKDIR /lazyker/app/client
RUN npm run build

RUN rm -rf node_modules && rm -rf public && rm -rf src

WORKDIR /lazyker/app
ENV NODE_ENV=production
EXPOSE 8081

CMD ["node","serveur.js"]