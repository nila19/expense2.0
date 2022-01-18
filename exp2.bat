@echo off
echo Starting Expense Tracker 2.0 - using 'docker-compose -f docker-compose.prod.yml up -d'
echo Stop the containers with command - 'docker-compose -f docker-compose.prod.yml down'

cd %EXP2_BASE%
@REM docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml up -d
