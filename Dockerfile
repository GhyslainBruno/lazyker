FROM node:14-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /lazyker/app/client && mkdir -p /lazyker/app/backend
WORKDIR /lazyker/app

COPY backend/package*.json /lazyker/app/backend/
COPY client/package*.json /lazyker/app/client/

WORKDIR /lazyker/app/backend

### Trying to fix puppeteer issues : https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
# Installs latest Chromium (72) package.
#RUN apk update && apk upgrade && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
#    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
#    apk add --no-cache \
#      chromium@edge \
#      nss@edge \
#      freetype@edge \
#      harfbuzz@edge \
#      ttf-freefont@edge \
#      python \
#      make \
#      g++

# ---

# Installs latest Chromium (77) package.
#RUN apk add --no-cache \
#      chromium \
#      nss \
#      freetype \
#      freetype-dev \
#      harfbuzz \
#      ca-certificates \
#      ttf-freefont \
#      nodejs \
#      npm

# ---

#ENV CHROME_BIN=/usr/bin/chromium-browser
#RUN echo @v3.8 http://nl.alpinelinux.org/alpine/v3.8/community >> /etc/apk/repositories && \
#    echo @v3.8 http://nl.alpinelinux.org/alpine/v3.8/main >> /etc/apk/repositories && \
#    apk add --no-cache \
#      chromium@v3.8 \
#      nss@v3.8 \
#      python

# ---
# Using this https://hub.docker.com/r/rastasheep/alpine-node-chromium/dockerfile
RUN \
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && apk --no-cache  update \
  && apk --no-cache  upgrade \
  && apk add --no-cache --virtual .build-deps \
    bash git openssh \
    gifsicle pngquant optipng libjpeg-turbo-utils \
    udev ttf-opensans chromium \
  && rm -rf /var/cache/apk/* /tmp/*

ENV CHROME_BIN /usr/bin/chromium-browser

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN npm install

WORKDIR /lazyker/app/client
RUN npm install

WORKDIR /lazyker/app

# Copy all the code into container
COPY . /lazyker/app/

#WORKDIR /lazyker/app/backend

# Running tests & coverage
#RUN npm test Cloudscrapper

# Changing absolute paths in coverage/lcov.info file to be matched with the ones in the sonar-scanner docker container used to run the sonar scanner
#RUN pwd=`pwd` && sed -i -e "s|\(${pwd}\)|\/root\/src|g" coverage/lcov.info

WORKDIR /lazyker/app/client

# Building the UI code
RUN npm run build

WORKDIR /lazyker/app/

# Is this part so useful ?
RUN rm -rf client

# Install lighthouse globally to be able to run a full lighthouse analysis in the CI pipeline
RUN npm install -g lighthouse
RUN mkdir /lighthouse

ENV NODE_ENV=production
EXPOSE 80

# Starting server in production mode
CMD ["npx", "ts-node", "backend/src/server.ts"]
