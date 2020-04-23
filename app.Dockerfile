FROM node:lts
WORKDIR /app
COPY api/package.json /app
RUN npm install
COPY api /app
# the following env variables need to be set if running directly as docker, instead of docker-compose
# ENV MONGO_URL=host.docker.internal:27017/expense
# ENV LOG_PATH=/logs
# ENV PORT=8000
ENV TIME_ZONE=EST
RUN echo ${TIME_ZONE} >/etc/timezone && \
    ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata
RUN echo "Timezone: $TIME_ZONE  => Current Time: `date`"
CMD npm run prod

###--------------------------------------------------------------------------------------------------###
###------------------------------------- DOCKER-COMPOSE ---------------------------------------------###

# C:\Java\GitHub\expense docker-compose up -d --build
# C:\Java\GitHub\expense docker-compose down

###--------------------------------------------------------------------------------------------------###
###----------------------------------------- APP ----------------------------------------------------###

# docker build . -t expense-image
#
# docker run --rm --name expense --network="host" -p 8000:8000 -p 27017:27017 -v C:/Java/logs:/logs expense-image
#
# docker run -it --rm --name expense -p 8000:8000 -p 27017:27017 -v C:/Java/logs:/logs expense-image
#
# docker container ls
# docker container rm -f expense

###--------------------------------------------------------------------------------------------------###
###------------------------------------------- DB ---------------------------------------------------###

# docker exec -it mongodb bash
# >> mongo
# >> use expense
# >> db.createUser({user:"bala", pwd:"m0ng0pwd", roles:[{role:"readWrite", db: "expense"}]});

# run as background task
# docker run -d --name mongodb -v /mnt/c/Java/mongodb/data:/data/db -p 27017:27017 mongo

# run in interactive mode; remove the container upon exit
# docker run -it --rm --name mongodb -v /mnt/c/Java/mongodb/data:/data/db -p 27017:27017 mongo

# C:\Java\mongodb> mongodump --out=dump-20.03.15 --db=expense
# C:\Java\mongodb> mongorestore
# C:\Java\mongodb> mongorestore -d expense-test dump/expense

# create volume to persist the data.
# docker volume create --name=mongodata

###--------------------------------------------------------------------------------------------------###
###------------------------------------------ TIME --------------------------------------------------###

# Time synchronization - Run this in Administrator Powershell
# Get-VMIntegrationService -VMName DockerDesktopVM
#
# Get-VMIntegrationService -VMName DockerDesktopVM -Name "Time Synchronization" | Disable-VMIntegrationService
# Get-VMIntegrationService -VMName DockerDesktopVM -Name "Time Synchronization" | Enable-VMIntegrationService

###--------------------------------------------------------------------------------------------------###
###--------------------------------------------------------------------------------------------------###
