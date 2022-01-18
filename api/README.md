# Available Scripts

In the project directory, you can run:

## Run

- Start `mongodb` in local machine
- Uncomment the environment properties in `.env`
- Run `npm run nodemon`
- App runs under [http://localhost:8000](http://localhost:8000)

## Test

- Start `mongodb` in local machine
- Uncomment the environment properties in `.env`
- Run `npm test`

## Debug

- Start `mongodb` in local machine
- Uncomment the environment properties in `.env`
- Run `Reify All` or `Reify One` debug options

## Build Docker image

- Run `docker build -t balavigneswaran/exp-api:2.1 -f app-api.prod.Dockerfile .`
- Run `docker push balavigneswaran/exp-api:2.1`
