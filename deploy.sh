#!/usr/bin/env bash

# Cleaning device before building the whole thing - needed only on tiny devices...
#docker system prune --all --force

if [[ $1 == docker ]]; then

    echo Installing using docker...
    sudo docker build -t ghyslainbruno/lazyker .
    if [ ! "$(sudo docker ps -q -f name=lazyker)" ]; then
        if [ "$(sudo docker ps -aq -f status=exited -f name=lazyker)" ]; then
            # cleanup
            echo 'Old lazyker container exited - cleaning up'
            docker rm lazyker
        fi
        # run your container
        #docker run -d --name <name> my-docker-image
        echo 'Running new version of lazyker container'
        sudo docker run -p 8080:80 --restart unless-stopped -v /home/ghyslain/lazyker/backend/coverage:/lazyker/app/backend/coverage --name lazyker -d ghyslainbruno/lazyker
        else
         echo 'Lazyker container already running - removing and updating and running new one...'
         sudo docker kill lazyker
         sudo docker rm lazyker
         sudo docker run -p 8080:80 --restart unless-stopped -v /home/ghyslain/lazyker/backend/coverage:/lazyker/app/backend/coverage --name lazyker -d ghyslainbruno/lazyker
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

    cd /home/ghyslain/lazyker

    elif [[ $1 == test_backend ]]; then
        echo Running backend tests...
        cd backend
        # Only Running these tests for now --> TODO write (a lot) more tests !
        sudo docker exec -it lazyker /bin/sh -c "cd backend;npm test Cloudscrapper;pwd=`pwd` && sed -i -e \"s|\/lazyker\/app\/backend|\/root\/src|g\" coverage/lcov.info"

    elif [[ $1 == test_frontent ]]; then
        echo Running frontend tests...
        cd client
        # No frontend tests written for now --> TODO write a lot of tests !

    elif [[ $1 == backend_analysis ]]; then
        echo Running backend analisys...
        cd backend
        sudo docker run -ti -v $(pwd):/usr/src newtmitch/sonar-scanner \
              -Dsonar.projectKey=lazyker-back \
              -Dsonar.projectName='Lazyker Back' \
              -Dsonar.organization=ghyslainbruno \
              -Dsonar.sources=. \
              -Dsonar.tests=. \
              -Dsonar.test.inclusions='**/*.test.js' \
              -Dsonar.exclusions='**/node_modules/**,**/coverage/**,**/*.json/**,**/*.pem/**,**/*.xml/**' \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
              -Dsonar.testExecutionReportPaths=coverage/test-report.xml \
              -Dsonar.host.url=https://sonarcloud.io \
              -Dsonar.login=28a4ef2881be958ff37da6deee7b915816c32a04


    elif [[ $1 == frontend_analysis ]]; then
        echo Running frontend analisis...
        cd client
        sudo docker run -ti -v $(pwd):/usr/src newtmitch/sonar-scanner \
          -Dsonar.projectKey=lazyker-front \
          -Dsonar.projectName='Lazyker Front' \
          -Dsonar.organization=ghyslainbruno \
          -Dsonar.sources=. \
          -Dsonar.host.url=https://sonarcloud.io \
          -Dsonar.login=28a4ef2881be958ff37da6deee7b915816c32a04

else

    # pm2 should already be running (in sudo mode) with watch set to true -> to properly update the whole application
    # chromium should be placed in here -> /usr/bin/chromium-browser (a simlink can do the trick if it is not)
    echo Installing without docker...
    echo Installing backend dependencies...
    cd backend && yarn install --ignore-engines && cd ..
    echo Installing frontend dependencies...
    cd client && yarn install
    echo Building frontend build...
    cd .. && cd backend && rm -rf client_build && cd .. && cd client
    yarn run build && cd ..

fi

