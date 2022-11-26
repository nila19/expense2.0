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

- Run `docker build -t balavigneswaran/exp-api:2.2 -f app-api.prod.Dockerfile .`
- Run `docker push balavigneswaran/exp-api:2.2`

## Load Docker image in Minikube (does not work; getting error for web-sockets)

- Run `minikube image load balavigneswaran/exp-api:2.2`
- OR Run `minikube image pull balavigneswaran/exp-api:2.2` to pull image from docker hub

- Run `minikube image load balavigneswaran/exp-ui:2.1`
- OR Run `minikube image pull balavigneswaran/exp-ui:2.1` to pull image from docker hub

- Run `minikube image ls` to list images in minikube cache

- Run `kubectl apply -f ui-deployment.yaml`
- Run `kubectl apply -f api-deployment.yaml`
- Run `kubectl port-forward service/exp-api 8000:8000`
- Run `kubectl port-forward service/exp-api 80:80`
