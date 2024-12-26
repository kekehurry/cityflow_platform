#!/bin/bash

DATABASE_HOST='cityflow_database'
EXECUTOR_HOST='cityflow_executor'
PUID=$(id -u)
PGID=$(id -g)


echo "Checking dependencies..."
# Check if gboeing/osmnx image exists, if not, pull it
if ! docker images | grep -q "gboeing/osmnx"; then
    docker pull gboeing/osmnx
fi

# Check if python:3-slim image exists, if not, pull it
if ! docker images | grep -q "python.*3-slim"; then
    docker pull python:3-slim
fi

echo "Creating cityflow network..."

docker network ls | grep -q cityflow || docker network create cityflow

echo "Environment setup..."

# Detect OS and set sed command accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_COMMAND=""
else
    SED_COMMAND=
fi

# modify the .env file
sed -i "${SED_COMMAND}" "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i "${SED_COMMAND}" "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=/workspace/code|" .env
sed -i "${SED_COMMAND}" "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i "${SED_COMMAND}" "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=/workspace/source|" .env
sed -i "${SED_COMMAND}" "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i "${SED_COMMAND}" "s|NEXT_PUBLIC_DATASET_SERVER=.*|NEXT_PUBLIC_DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i "${SED_COMMAND}" "s|NEXT_PUBLIC_EXECUTOR_SERVER=.*|NEXT_PUBLIC_EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env
sed -i "${SED_COMMAND}" "s|user:.*|user: '${PUID}:${PGID}'|g" docker-compose.yml


if [[ ! " $@ " =~ " --beian " ]]; then
  sed -i "${SED_COMMAND}" "s|BEIAN=.*|BEIAN=|" .env
fi

# change user to current user
echo "User setup..."
sudo usermod -aG docker $USER

# change the owner of the cityflow_database and cityflow_executor
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/data
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/source
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_executor/code
sudo chown -R ${PUID}:${PGID} /var/run/docker.sock

echo "Lunching cityflow..."

docker-compose pull

docker-compose down

docker-compose up -d