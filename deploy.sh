#!/bin/bash

DATABASE_HOST='localhost'
EXECUTOR_HOST='localhost'
PUID=$(id -u)
PGID=$(id -g)

echo "Checking dependencies..."

# Check if ghcr.io/kekehurry/cityflow_runner:latest image exists, if not, pull it
if ! docker images | grep -q "ghcr.io/kekehurry/cityflow_runner:latest"; then
    docker pull ghcr.io/kekehurry/cityflow_runner:latest
fi

echo "Environment setup..."

# modify the .env file
sed -i "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=${PWD}/cityflow_executor/code|" .env
sed -i "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=${PWD}/cityflow_database/source|" .env
sed -i "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i "s|DATASET_SERVER=.*|DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i "s|EXECUTOR_SERVER=.*|EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env

# sed -i '' "s|user:.*|user: '${PUID}:${PGID}'|" docker-compose.yml


if [[ ! " $@ " =~ " --beian " ]]; then
  sed -i '' "s|BEIAN=.*|BEIAN=|" .env
fi

echo "Lunching cityflow..."

docker-compose down

docker-compose pull

docker-compose up -d

# docker run -it --rm \
#   -p 3000:3000 \
#   -v /var/run/docker.sock:/var/run/docker.sock \
#   -v ./cityflow_executor/code:/cityflow_executor/code \
#   -v ./cityflow_database/data:/data \
#   -v ./cityflow_database/source:/cityflow_database/source \
#   --env-file=./.env \
#   --name=cityfow_platform \
#   --add-host=host.docker.internal:host-gateway \
#   cityflow-platform:latest