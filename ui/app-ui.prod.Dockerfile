FROM node:lts as build
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_OPTIONS=--max_old_space_size=2048

COPY package*.json .
# COPY package-lock.json /app
# COPY ./node_modules /app

RUN npm config set maxsockets=5
RUN npm config delete proxy
RUN npm config delete http-proxy
RUN npm config delete https-proxy
# RUN npm ci --force --noproxy registry.npmjs.org
RUN npm ci --force

COPY . /app
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /etc/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
