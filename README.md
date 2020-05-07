# Available Scripts

In the project directory, you can run:

## Run

- `docker-compose up -d`
- `docker-compose down`
- `docker-compose -f docker-compose-prod.yml up`
- `docker-compose -f docker-compose-prod.yml down`

## Build & Run (during development)

- Comment `ui-prod` service & uncomment `ui-dev` service in `docker-compose.yml`
- `docker-compose up --build` or `docker-compose up --build --remove-orphans`

## Dump data from DB

- `mongodump --out=2020-05-05 --db=expense --host=localhost --port=27017`

## Restore the DB from data snapshot

- `mongorestore --db=expense 2020-05-05/expense`
