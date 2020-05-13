@echo off
echo Starting Expense Tracker 2.0 - using 'docker-compose -f docker-compose.prod.yml up -d --build'
echo Stop the containers with command - 'docker-compose -f docker-compose.prod.yml down'

cd %EXP2_BASE%
docker-compose -f docker-compose.prod.yml up -d --build
