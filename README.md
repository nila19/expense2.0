# Available Scripts

In the project directory, you can run:

## Dev process (simplified)

- Run API using `Run` instructions in api/README
- Run UI using `Run` instructions in ui/README

## Dev Script

`docker-compose.yml`

### Run - Dev

- `docker-compose up -d`
- `docker-compose down`
- App runs under [http://localhost:3000](http://localhost:3000)

## Build & Run - Dev

- Comment `ui-prod` service & uncomment `ui-dev` service in `docker-compose.yml`
  - `docker-compose up --build` or
  - `docker-compose up --build --remove-orphans`
- App runs under [http://localhost:3000](http://localhost:3000)

## Prod Script

`docker-compose-prod.yml`

### Run - Prod

- `docker-compose -f docker-compose.prod.yml up`
- `docker-compose -f docker-compose.prod.yml down`
- App runs under [http://localhost:80](http://localhost:80)

## Build & Run - Prod

- `docker-compose -f docker-compose.prod.yml up --build` or
- `docker-compose -f docker-compose.prod.yml up --build --remove-orphans`
<!-- - `docker-compose -f docker-compose.prod.yml up --build --network=host` -->
- App runs under [http://localhost:80](http://localhost:80)

- `docker login --username=balavigneswaran --password=<pwd>`
- `docker push balavigneswaran/exp-api:2.32`
- `docker push balavigneswaran/exp-ui:3.32`

## Database

### Dump data from DB

- Use folder `C:\Java\mongodb\dumps`
- `mongodump --out=2020-05-05 --db=expense --host=localhost --port=27017`

### Restore DB from data snapshot

- Use folder `C:\Java\mongodb\dumps`
- `mongorestore --db=expense 2020-05-05/expense`

### Using local mongodb

- modified to use mongodb running in host since the data volume is getting lost
