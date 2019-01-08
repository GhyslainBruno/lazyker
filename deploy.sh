#!/usr/bin/env bash

git pull

docker build -t ghyslainbruno/lazyker .

if [ ! "$(docker ps -q -f name=lazyker)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=lazyker)" ]; then
        # cleanup
        echo 'Old lazyker container exited - cleaning up'
        docker rm lazyker
    fi
    # run your container
    #docker run -d --name <name> my-docker-image
    echo 'Running new version of lazyker container'
    docker run -p 80:80 -p 443:443 --name lazyker -d ghyslainbruno/lazyker
    else
     echo 'Lazyker container already running - removing and updating and running new one...'
     docker kill lazyker
     docker rm lazyker
     docker run -p 80:80 -p 443:443 --name lazyker -d ghyslainbruno/lazyker
fi