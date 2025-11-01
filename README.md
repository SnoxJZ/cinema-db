# Movie Website - Monolith & Microservices

## Monolith

### Run

```bash
docker-compose up --build
# Press Ctrl+C to stop

# Or run in background
docker-compose up -d
```

### Stop

```bash
docker-compose down
```

---

## Microservices

### Run

```bash
# Build and start all services
docker-compose -f docker-compose.microservices.yml up -d --build

# Or start without rebuild
docker-compose -f docker-compose.microservices.yml up -d

# Rebuild only specific service (faster)
docker-compose -f docker-compose.microservices.yml up -d --build api-gateway
```

### Services

- **API Gateway** - Port 8000
- **User Service** - Port 8001
- **Movie Service** - Port 8002
- **Review Service** - Port 8003
- **Playlist Service** - Port 8004
- **Admin Service** - Port 8005
- **Actor Service** - Port 8006
- **Frontend** - Port 3000
- **MongoDB** - Port 27018

### Stop

```bash
docker-compose -f docker-compose.microservices.yml down
```

---

## Database Import

### Microservices (Recommended)

Import all collections and automatically separate activitylogs by service:

```bash
# Make script executable (first time only)
chmod +x import-dumps.sh

# Run import script
./import-dumps.sh
```

This script:

- Imports all main collections to their respective service databases
- Separates activitylogs by action type into appropriate services:
  - User service: `login`, `register`, `block_user`, `unblock_user`, `change_role`, `upload_avatar`, `update_profile`
  - Movie service: `create_movie`, `update_movie`, `delete_movie`
  - Actor service: `create_actor`, `update_actor`, `delete_actor`
  - Review service: `create_review`, `delete_review`, `update_review`

#### Verify Import

Check imported data:

```bash
# Run mongo-express
docker-compose -f docker-compose.microservices.yml up -d mongo-express

# Or
# Connect to MongoDB interactively
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo

# Then in mongo shell:
use review_service_db
db.reviews.countDocuments()
db.reviews.findOne()

use user_service_db
db.users.countDocuments()

use movie_service_db
db.movies.countDocuments()
```

Or use quick commands without entering mongo shell:

```bash
# Count reviews
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo review_service_db --quiet --eval "print('Reviews: ' + db.reviews.countDocuments())"

# Count users
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo user_service_db --quiet --eval "print('Users: ' + db.users.countDocuments())"

# Count movies
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo movie_service_db --quiet --eval "print('Movies: ' + db.movies.countDocuments())"

# Check a review sample
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo review_service_db --quiet --eval "printjson(db.reviews.findOne({}, {parentMovie: 1, owner: 1, rating: 1}))"

# Check activitylogs distribution
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo --quiet --eval "
  print('User logs: ' + db.getSiblingDB('user_service_db').activitylogs.countDocuments());
  print('Movie logs: ' + db.getSiblingDB('movie_service_db').activitylogs.countDocuments());
  print('Review logs: ' + db.getSiblingDB('review_service_db').activitylogs.countDocuments());
  print('Actor logs: ' + db.getSiblingDB('actor_service_db').activitylogs.countDocuments());
"
```

### Monolith

Import to single database:

```bash
docker-compose exec mongo mongoimport --db cinemadb --collection activitylogs --file /dump/cinemadb/activitylogs.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection actors --file /dump/cinemadb/actors.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection emailverificationtokens --file /dump/cinemadb/emailverificationtokens.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection movies --file /dump/cinemadb/movies.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection passwordresettokens --file /dump/cinemadb/passwordresettokens.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection playlists --file /dump/cinemadb/playlists.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection reviews --file /dump/cinemadb/reviews.json --jsonArray
docker-compose exec mongo mongoimport --db cinemadb --collection users --file /dump/cinemadb/users.json --jsonArray
```

---

## Cleanup

### Delete containers (keeps volumes)

```bash
# Monolith
docker-compose down

# Microservices
docker-compose -f docker-compose.microservices.yml down
```

### Delete all cached images and layers

```bash
docker builder prune -af
```
