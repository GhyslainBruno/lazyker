# Lazyker

### With Docker ([ghyslainbruno/lazyker](https://hub.docker.com/r/ghyslainbruno/lazyker/))

* Restart on dedibox : ```docker rm $(docker stop $(docker ps | grep lazyker | awk '{print $1}')) && docker build -t ghyslainbruno/lazyker . && docker run -p 80:80 -p 443:443 -d ghyslainbruno/lazyker```
* Build the image : ```docker build -t ghyslainbruno/lazyker .```
* Push the image on DockerHub : ```docker push ghyslainbruno/lazyker```
* Run the Docker image as a container : ```docker run -p 80:80 -p 443:443 -d ghyslainbruno/lazyker```
* Remove the container : ```docker rm $(docker stop $(docker ps | grep lazyker | awk '{print $1}'))```
* Remove all docker images : ``docker rmi $(docker images -a | awk '{print $3}')``
* Deploy the application to [now](https://zeit.co/) service: `now`
* Deploy with [heroku](https://dashboard.heroku.com/apps/lazyker): 
  * `heroku container:push web -a lazyker`
  * `heroku container:release web -a lazyker`
  * `heroku open -a lazyker`
  
* **Debug in a Docker container**
  * Starting server in production mode (in dockefile, last command) : ```CMD ["node", "--inspect=0.0.0.0:9229", "--debug-brk", "backend/server.js"]```
  * ```docker run -p 80:80 -p 443:443 -p 9229:9229 -d ghyslainbruno/lazyker```
  * Then use chrome://inspect in chrome to debug the whole app from chrome dev tools

*Rem: an image for Raspberry pi 2B is also available, but generally not fully updated* 

### WithOUT Docker - regular install

To use Lazyker, you must have : 
- A Synoloy NAS (with DownloadStation & FileStation installed on it)
- A Premium RealDebrid account
- NodeJS installed (>v8)

This project is composed of : 

- A react web app (in client folder) --> served on port 3000 (in dev mode)
- An express server --> API served on port 8081 (under /api/... endpoints)
- An AutoUpdate module (for now in /scrappers --> TODO change)
- Several modules to be used by AutoUpdate module
- A movies module (in /movies)
- Several providers site crawlers (zone téléchargement, extreme download, rapidmoviez, ygg, torrent9)

Can, for now, be build in dev / prod mode : 
* dev : 
  * ```npm install``` (backend folder)
  * ```npm install``` (client folder)  
  * ```node server.js``` (backend folder)
  * ```npm start``` (client folder)
* prod : 
  * ```npm install``` (backend folder)
  * ```npm install``` (client folder)  
  * ```npm run build``` (client folder)
  * ```NODE_ENV=production node server.js``` (backend folder)
  

**Careful : in Settings component, a callback url for OAuth realdebrid authentication is set to lazyker.herokuapp.com**

## To get SSL certificate
- Connect to ssh server
- run ````docker stop lazyker```` to let the 80 port accessible to certbot program
- sudo /path/to/certbot-auto certonly (for interactive session)
- choose standalone (1) ->  it will generate a webserver in order to make the challenge
- write down the domain names (it all can be in one sentence...)
- the certificates should be placed in /etc/letsencrypt/(domainname)
- copy them into an accessible folder : 
  - run ```sudo cp /etc/letsencrypt/live/dedibox.ghyslain.xyz/privkey.pem certificates/privkey.pem```
  - run ```sudo cp /etc/letsencrypt/live/dedibox.ghyslain.xyz/cert.pem certificates/cert.pem```
- then (for now) take the new certificates and commit it to the project

--> Later : automatize certificates renewals and share the volume with docker lazyker container (in order to not doing anything anymore)
  