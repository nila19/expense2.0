@echo off
echo Building Expense Tracker 2.0 images - using 'docker build & docker push'
@REM echo Stop the containers with command - 'docker-compose -f docker-compose.prod.yml down'

set VERSION=2.1

cd %EXP2_BASE%

cd api
docker build -t balavigneswaran/exp-api:%VERSION% -f app-api.prod.Dockerfile .
docker push balavigneswaran/exp-api:%VERSION%

cd ../ui
docker build -t balavigneswaran/exp-ui:%VERSION% -f app-ui.prod.Dockerfile .
docker push balavigneswaran/exp-ui:%VERSION%
