FROM node:8.11.3-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /lazyker/app/client && mkdir -p /lazyker/app/backend
WORKDIR /lazyker/app

COPY backend/package*.json /lazyker/app/backend/
COPY client/package*.json /lazyker/app/client/

WORKDIR /lazyker/app/backend

RUN npm install --silent

WORKDIR /lazyker/app/client
RUN npm install --silent

WORKDIR /lazyker/app

# Copy all the code into container
COPY . /lazyker/app/

WORKDIR /lazyker/app/client

# Building the UI code
RUN npm run build

WORKDIR /lazyker/app/
RUN rm -rf client

WORKDIR /lazyker/app/backend
ENV NODE_ENV=production
EXPOSE 8081

# Starting server in production mode
CMD ["node","server.js"]