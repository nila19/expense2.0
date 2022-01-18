# Dump data from MongoDB
- Run `mongodump -d expense -o expense_2022_01_17`

# Restore data to MongoDB
- Login to the pod & create /tmp/data folder in the pod
- Copy the files to the pod `kubectl cp expense mongo-db-0:/tmp/data -c mongo`
- Within the pod, run `mongorestore -u admin -p 'admin' --authenticationDatabase admin -d expense expense`

# Port-forward to connect from local MongoDB Compass
- Run `kubectl port-forward pod/mongo-db-0 27017`
- Otherwise connect using NodePort service
  - `mongodb://admin:admin@localhost:30001/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`

# API -> DB connection
- MONGO_URL should contain the CLuster IP address of the `service/mongo-db`
