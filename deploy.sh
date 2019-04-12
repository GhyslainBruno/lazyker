#!/usr/bin/env bash

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
    docker run -p 8080:80 -p 443:443 --restart unless-stopped -v /home/ghys/lazyker/backend/coverage:/lazyker/app/backend/coverage --name lazyker -d ghyslainbruno/lazyker
    else
     echo 'Lazyker container already running - removing and updating and running new one...'
     docker kill lazyker
     docker rm lazyker
     docker run -p 8080:80 -p 443:443 --restart unless-stopped -v /home/ghys/lazyker/backend/coverage:/lazyker/app/backend/coverage --name lazyker -d ghyslainbruno/lazyker
fi

## Running backend tests - editing report file -> in the running container
#docker exec -it lazyker /bin/sh -c "cd backend;npm test Cloudscrapper;pwd=`pwd` && sed -i -e \"s|\/lazyker\/app\/backend|\/root\/src|g\" coverage/lcov.info"
#
## Run sonarqube analysis on backend part
#cd backend && \
#docker run -v $(pwd):/root/src --link sonarqube newtmitch/sonar-scanner sonar-scanner \
#  -Dsonar.projectKey=lazyker-back \
#  -Dsonar.projectName='Lazyker Back' \
#  -Dsonar.sources=. \
#  -Dsonar.tests=. \
#  -Dsonar.test.inclusions='**/*.test.js' \
#  -Dsonar.exclusions='**/node_modules/**,**/coverage/**,**/*.json/**,**/*.pem/**,**/*.xml/**' \
#  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
#  -Dsonar.testExecutionReportPaths=coverage/test-report.xml \
#  -Dsonar.host.url='http://sonarqube.ghyslain.xyz:9000' \
#  -Dsonar.login=c37d841c739531680ebf8c1f874012806bd01da7 && \
#
## Run sonarqube analysis on frontend part
#cd .. && \
#cd client && \
#docker run -v $(pwd):/root/src --link sonarqube newtmitch/sonar-scanner sonar-scanner \
#  -Dsonar.projectKey=lazyker-front \
#  -Dsonar.projectName='Lazyker Front' \
#  -Dsonar.sources=. \
#  -Dsonar.host.url=http://sonarqube.ghyslain.xyz:9000 \
#  -Dsonar.login=c37d841c739531680ebf8c1f874012806bd01da7 && \

cd /home/ghys/lazyker