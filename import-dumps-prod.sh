#!/bin/bash

# Script for importing MongoDB dumps into microservices (PRODUCTION)
# Usage: ./import-dumps-prod.sh

MONGO_CONTAINER="ec2-user-mongo-microservices-1"

echo "🚀 Starting import of dumps..."

# main collections
echo "📦 Importing main collections..."
docker exec -i $MONGO_CONTAINER mongoimport --db user_service_db --collection users --file /dump/cinemadb/users.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db user_service_db --collection emailverificationtokens --file /dump/cinemadb/emailverificationtokens.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db user_service_db --collection passwordresettokens --file /dump/cinemadb/passwordresettokens.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db movie_service_db --collection movies --file /dump/cinemadb/movies.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db actor_service_db --collection actors --file /dump/cinemadb/actors.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db review_service_db --collection reviews --file /dump/cinemadb/reviews.json --jsonArray --drop --quiet
docker exec -i $MONGO_CONTAINER mongoimport --db playlist_service_db --collection playlists --file /dump/cinemadb/playlists.json --jsonArray --drop --quiet

echo ""
echo "📋 Separating activitylogs into services..."

docker exec -i $MONGO_CONTAINER mongoimport --db temp_db --collection activitylogs_temp --file /dump/cinemadb/activitylogs.json --jsonArray --quiet

# User service logs
docker exec $MONGO_CONTAINER mongosh --quiet --eval "
  var tempDb = db.getSiblingDB('temp_db');
  var userDb = db.getSiblingDB('user_service_db');
  var userActions = ['login', 'register', 'block_user', 'unblock_user', 'change_role', 'upload_avatar', 'update_profile'];
  var userLogs = tempDb.activitylogs_temp.find({ action: { \$in: userActions } }).toArray();
  if (userLogs.length > 0) {
    userDb.activitylogs.drop();
    userDb.activitylogs.insertMany(userLogs);
    print('✓ User: ' + userLogs.length);
  }
"

# Movie service logs
docker exec $MONGO_CONTAINER mongosh --quiet --eval "
  var tempDb = db.getSiblingDB('temp_db');
  var movieDb = db.getSiblingDB('movie_service_db');
  var movieActions = ['create_movie', 'update_movie', 'delete_movie'];
  var movieLogs = tempDb.activitylogs_temp.find({ action: { \$in: movieActions } }).toArray();
  if (movieLogs.length > 0) {
    movieDb.activitylogs.drop();
    movieDb.activitylogs.insertMany(movieLogs);
    print('✓ Movie: ' + movieLogs.length);
  }
"

# Actor service logs
docker exec $MONGO_CONTAINER mongosh --quiet --eval "
  var tempDb = db.getSiblingDB('temp_db');
  var actorDb = db.getSiblingDB('actor_service_db');
  var actorActions = ['create_actor', 'update_actor', 'delete_actor'];
  var actorLogs = tempDb.activitylogs_temp.find({ action: { \$in: actorActions } }).toArray();
  if (actorLogs.length > 0) {
    actorDb.activitylogs.drop();
    actorDb.activitylogs.insertMany(actorLogs);
    print('✓ Actor: ' + actorLogs.length);
  }
"

# Review service logs
docker exec $MONGO_CONTAINER mongosh --quiet --eval "
  var tempDb = db.getSiblingDB('temp_db');
  var reviewDb = db.getSiblingDB('review_service_db');
  var reviewActions = ['create_review', 'delete_review', 'update_review'];
  var reviewLogs = tempDb.activitylogs_temp.find({ action: { \$in: reviewActions } }).toArray();
  if (reviewLogs.length > 0) {
    reviewDb.activitylogs.drop();
    reviewDb.activitylogs.insertMany(reviewLogs);
    print('✓ Review: ' + reviewLogs.length);
  }
"

# Clean up temporary database
docker exec $MONGO_CONTAINER mongosh --quiet --eval "
  db.getSiblingDB('temp_db').dropDatabase();
  print('✓ Cleaned up temp database');
"

echo ""
echo "✅ Import completed!"