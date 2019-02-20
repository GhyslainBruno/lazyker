FROM node:8.11.3-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /lazyker/app/client && mkdir -p /lazyker/app/backend
WORKDIR /lazyker/app

COPY backend/package*.json /lazyker/app/backend/
COPY client/package*.json /lazyker/app/client/

WORKDIR /lazyker/app/backend

### Trying to fix puppeteer issues : https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
# Installs latest Chromium (68) package.
RUN apk update && \
  apk upgrade && \
  echo @3.8 https://ftp.acc.umu.se/mirror/alpinelinux.org/v3.8/community >> /etc/apk/repositories && \
  echo @3.8 https://ftp.acc.umu.se/mirror/alpinelinux.org/v3.8/main >> /etc/apk/repositories && \
  apk add --no-cache \
    freetype@3.8 \
    harfbuzz@3.8 \
    chromium@3.8 \
    nss@3.8

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Puppeteer v1.4.0 works with Chromium 68.
#RUN npm i puppeteer@1.4.0

# Add user so we don't need --no-sandbox.
#RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
#    && mkdir -p /home/pptruser/Downloads \
#    && chown -R pptruser:pptruser /home/pptruser \
#    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
#USER pptruser
### End of trying

RUN npm install --silent && npm test

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

ENV NODE_ENV=production
EXPOSE 80 443

# Starting server in production mode
CMD ["node","backend/server.js"]