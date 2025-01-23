#!/bin/bash
DATABASE_HOST='127.0.0.1'
EXECUTOR_HOST='127.0.0.1'
PUID=$(id -u)
PGID=$(id -g)



# Check if cityflow_runner:latest exists, if not, pull it

# echo "Checking dependencies..."

# if ! docker images | grep -q "cityflow_runner:latest"; then
#     docker pull cityflow_runner:latest
# fi

echo "Creating cityflow network..."

docker network ls | grep -q cityflow || docker network create cityflow


echo "Environment setup..."

# modify the .env file
sed -i "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=/cityflow_executor/code|" .env
sed -i "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=/cityflow_database/source|" .env
sed -i "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i "s|DATASET_SERVER=.*|DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i "s|EXECUTOR_SERVER=.*|EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env

# sed -i "s|user:.*|user: '${PUID}:${PGID}'|g" docker-compose.yml


if [[ ! " $@ " =~ " --beian " ]]; then
  sed -i "s|BEIAN=.*|BEIAN=|" .env
fi

# change user to current user
echo "User setup..."
# sudo usermod -aG docker $USER

# change the owner of the cityflow_database and cityflow_executor
chown -R ${PUID}:${PGID} ${PWD}/cityflow_executor/code
chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/source
chown -R neo4j:neo4j ${PWD}/cityflow_database/data
chown -R ${PUID}:${PGID} ${PWD}/start-services.sh
chown -R ${PUID}:${PGID} /var/run/docker.sock


# Fix typo in chmod and ensure script is executable
chmod +x ./start-services.sh
# Change file permissions to be readable and executable by all users
chmod 755 ./start-services.sh

echo "Removing dangling images..."

# Get IDs of dangling images
dangling_images=$(docker images --filter "dangling=true" -q)

# Check if there are any dangling images
if [ -n "$dangling_images" ]; then
  # Remove dangling images
  docker rmi $dangling_images
  echo "Dangling images removed."
else
  echo "No dangling images to remove."
fi


echo "Lunching cityflow..."

docker run -it --rm\
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ./cityflow_executor/code:/cityflow_executor/code \
  -v ./cityflow_database/data:/data \
  -v ./cityflow_database/source:/cityflow_database/source \
  -e PUID=${PUID} \
  -e PGID=${PGID} \
  --user ${PUID}:${PGID} \
  --env-file ./.env \
  --name=cityfow_platform \
  cityflow-platform:latest