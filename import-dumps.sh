#!/bin/bash

# Script for importing MongoDB dumps into microservices
# Usage: ./import-dumps.sh

echo "🚀 Starting import of dumps..."

# main collections
echo "📦 Importing main collections..."
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db user_service_db --collection users --file /dump/cinemadb/users.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db user_service_db --collection emailverificationtokens --file /dump/cinemadb/emailverificationtokens.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db user_service_db --collection passwordresettokens --file /dump/cinemadb/passwordresettokens.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db movie_service_db --collection movies --file /dump/cinemadb/movies.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db actor_service_db --collection actors --file /dump/cinemadb/actors.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db review_service_db --collection reviews --file /dump/cinemadb/reviews.json --jsonArray --drop --quiet
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db playlist_service_db --collection playlists --file /dump/cinemadb/playlists.json --jsonArray --drop --quiet

echo ""
echo "📋 Separating activitylogs into services..."

# User service logs
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db user_service_db --collection activitylogs_temp --file /dump/cinemadb/activitylogs.json --jsonArray --quiet
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo --quiet --eval "
  db = db.getSiblingDB('user_service_db');
  var userActions = ['login', 'register', 'block_user', 'unblock_user', 'change_role', 'upload_avatar', 'update_profile'];
  var userLogs = db.activitylogs_temp.find({ action: { \$in: userActions } }).toArray();
  if (userLogs.length > 0) {
    db.activitylogs.drop();
    db.activitylogs.insertMany(userLogs);
    print('✓ User: ' + userLogs.length);
  }
  db.activitylogs_temp.drop();
"

# Movie service logs
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db movie_service_db --collection activitylogs_temp --file /dump/cinemadb/activitylogs.json --jsonArray --quiet
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo --quiet --eval "
  db = db.getSiblingDB('movie_service_db');
  var movieActions = ['create_movie', 'update_movie', 'delete_movie'];
  var movieLogs = db.activitylogs_temp.find({ action: { \$in: movieActions } }).toArray();
  if (movieLogs.length > 0) {
    db.activitylogs.drop();
    db.activitylogs.insertMany(movieLogs);
    print('✓ Movie: ' + movieLogs.length);
  }
  db.activitylogs_temp.drop();
"

# Actor service logs
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db actor_service_db --collection activitylogs_temp --file /dump/cinemadb/activitylogs.json --jsonArray --quiet
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo --quiet --eval "
  db = db.getSiblingDB('actor_service_db');
  var actorActions = ['create_actor', 'update_actor', 'delete_actor'];
  var actorLogs = db.activitylogs_temp.find({ action: { \$in: actorActions } }).toArray();
  if (actorLogs.length > 0) {
    db.activitylogs.drop();
    db.activitylogs.insertMany(actorLogs);
    print('✓ Actor: ' + actorLogs.length);
  }
  db.activitylogs_temp.drop();
"

# Review service logs
docker-compose -f docker-compose.microservices.yml exec -T mongo-microservices mongoimport --db review_service_db --collection activitylogs_temp --file /dump/cinemadb/activitylogs.json --jsonArray --quiet
docker-compose -f docker-compose.microservices.yml exec mongo-microservices mongo --quiet --eval "
  db = db.getSiblingDB('review_service_db');
  var reviewActions = ['create_review', 'delete_review', 'update_review'];
  var reviewLogs = db.activitylogs_temp.find({ action: { \$in: reviewActions } }).toArray();
  if (reviewLogs.length > 0) {
    db.activitylogs.drop();
    db.activitylogs.insertMany(reviewLogs);
    print('✓ Review: ' + reviewLogs.length);
  }
  db.activitylogs_temp.drop();
"

echo ""
echo "✅ Import completed!"
