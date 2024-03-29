# Lazyker

## Project description
This project is a [PWA](https://developers.google.com/web/progressive-web-apps/) (Progressive Web App) with which a user can :
* Download Movies & Tv Shows episodes to his personnal storage (NAS Synology or Google Drive folder)
* Stay upToDate with the tv shows he wants by downloading new episodes
* It scrapes several provider websites (only **torrent** for now, DDL has already been developed but is not fully stable for now, so I decided not to use it), here is the list : 
  * Torrents : 
    * [Ygg](https://www.torrent9.tw/)
    * <s>[Torrent9](https://www.yggtorrent.gg/)</s>
  * <s>DDL</s> : 
    * <s>[Extreme download](https://www1.extreme-download.me/)</s>
    * <s>[Annuaire telechargement](https://vwvvv.annuaire-telechargement.com/)</s>
    * <s>[Zone telechargement](https://ww12.zone-telechargement.lol/)</s>
* It uses a debrider service (only **Realdebrid** for now, but some others later)
* Manage downloads from a dedicated UI
* Check whether there was an error or not in a dedicated console output* Some other features

## State of features

| Feature |      State    |
| -------- | :------: |
| Add a torrent into debrider's seedbox service |  :white_check_mark: |
| Download torrent file into Google Drive user's storage | :white_check_mark: |
| Download torrent file into Synology NAS user's storage | :x: |
| Add torrent file from movies | :white_check_mark: |
| Add torrent file from Tv Shows | :white_check_mark: |
| Search movies from title / genres | :white_check_mark: |
| Manage downloads into Google Drive user's storage | :white_check_mark: |
| Manage downloads into Synology NAS user's storage | :x: |
| Display a console output to user | :white_check_mark: |
| Auto update Tv Shows new episodes aired  | :x: |

#### Some other features should be developed soon. To know what's coming, you can report to the [issues dashboard of this project](https://gitlab.com/ghyslainbruno/lazyker/boards/781495)

## When Lazyker came in my developer journey - Aug 2018  
I started working on this project right after Cryptopus. 

I'm currently still working on this project, when I find some time to do so. 

## What I learned with Lazyker
As previously said, I started working on Lazyker right after Cryptopus, so I knew that i had to use a real stack.
Lazyker is a project with which I learned a lot. 

Indeed, this project allowed me to practice : 
* Async / Await
* SSL
* QA
* Nginx reverse proxy
* Google Drive API
* Docker 
* Continuous integration
* React JS framework (that's whith this project that I knew I wanted to use React to build things)

And probably many more I'm forgetting.  

### :white_check_mark: <u>Lazyker</u> : https://lazyker.ghyslain.xyz (<u>the project</u>)
#### :vertical_traffic_light: SonarQube : https://sonarcloud.io/organizations/ghyslainbruno/projects (code analysis and quality report)
#### :rocket: LightHouse : https://lighthouse.lazyker.ghyslain.xyz/ (lighthouse audit generated at each push)
#### Issues / Features board : https://gitlab.com/ghyslainbruno/lazyker/boards/781495
 
# Cheat sheet :warning: For personnal use :warning: 

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
  * Starting server in production mode (in dockefile, last command) : ```CMD ["node", "--inspect=0.0.0.0:9229", "--debug-brk", "backend/server.ts"]```
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
  * ```node server.ts``` (backend folder)
  * ```npm start``` (client folder)
* prod : 
  * ```npm install``` (backend folder)
  * ```npm install``` (client folder)  
  * ```npm run build``` (client folder)
  * ```NODE_ENV=production node server.ts``` (backend folder)
  

**Careful : in Settings component, a callback url for OAuth realdebrid authentication is set to lazyker.herokuapp.com**

## To get SSL certificate

:warning: DEPRECATED :warning: --> Now implemented using [Caddy](https://hub.docker.com/r/abiosoft/caddy/)

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

## To serve lighthouse CI html report : 

I simply serve html files with another web server ([article example](https://www.dailysmarty.com/posts/steps-for-deploying-a-static-html-site-with-docker-and-nginx)).

So here is the Docker command I use in the /lighthouse directory in my main container :  

```docker run -d -p 8082:80 --restart unless-stopped --name lighthouse -v /home/ghyslain/lighthouse/:/usr/share/nginx/html nginx:alpine```

<i>Doing that, every commit will change index.html file in this directory</i>

TODO : Use docker_compose to do the whole thing. 

## Caddy : 

Here is the Caddy file I use (in ~/) : 

```
nas.ghyslain.xyz {
  proxy / 192.168.1.20:5000
}

lazyker.ghyslain.xyz {
  proxy / 192.168.1.12:8080
}

lighthouse.lazyker.ghyslain.xyz {
  proxy / 192.168.1.12:8082
}

dedibox.ghyslain.xyz {
  proxy / 192.168.1.12:8080
}

plex.ghyslain.xyz {
  proxy / 192.168.1.12:32400
}

livebox.ghyslain.xyz {
  proxy / 192.168.1.1
}

domotique.ghyslain.xyz {
  proxy / 192.168.1.12:8081
}

nuc.ghyslain.xyz {
  proxy / 192.168.1.12:19999
}
``` 

