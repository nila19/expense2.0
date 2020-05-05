# Available Scripts

In the project directory, you can run:

## Run

- `docker-compose up -d`
- `docker-compose down`

## Build & Run (during development)

- Comment `ui-prod` service & uncomment `ui-dev` service in `docker-compose.yml`
- `docker-compose up --build --remove-orphans`

## Restore the DB

- `mongorestore -d expense-test dump-20.03.15/expense`
