FROM node:lts as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_OPTIONS=--max_old_space_size=2048
COPY package.json /app
COPY package-lock.json /app
RUN npm install
COPY . /app
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /etc/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
