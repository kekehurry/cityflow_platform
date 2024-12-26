#!/bin/bash

DATABASE_HOST='127.0.0.1'
EXECUTOR_HOST='127.0.0.1'
PUID=$(id -u)
PGID=$(id -g)

# Initialize conda in the current shell session
echo "Activating conda environment..."
eval "$(conda shell.bash hook)"
conda activate cityflow

echo "Checking dependencies..."

docker image prune -f --filter "dangling=true"

# Check if gboeing/osmnx image exists, if not, pull it
if ! docker images | grep -q "gboeing/osmnx"; then
    docker pull gboeing/osmnx
fi

# Check if python:3-slim image exists, if not, pull it
if ! docker images | grep -q "python.*3-slim"; then
    docker pull python:3-slim
fi

if [ "$(docker ps -aq -f name=neo4j)" ]; then
    docker start neo4j
else
    cd ${PWD}/cityflow_database &&
    docker run \
        -itd \
        --restart always \
        --publish=7474:7474 --publish=7687:7687 \
        --env NEO4J_AUTH=neo4j/neo4jgraph \
        --volume=$PWD/data:/data \
        --user $(id -u):$(id -g) \
        --env NEO4J_dbms_memory_pagecache_size=1G \
        --env NEO4J_PLUGINS='["apoc"]' \
        --name neo4j \
        neo4j:5.20.0
fi

# echo "Creating cityflow network..."

# docker network ls | grep -q cityflow || docker network create cityflow

echo "Environment setup..."

# Detect OS and set sed command accordingly

# dev in linux remove the '' after -i
# modify the .env file
sed -i '' "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i '' "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=${PWD}/cityflow_executor/code|" .env
sed -i '' "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i '' "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=${PWD}/cityflow_database/source|" .env
sed -i '' "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i '' "s|NEXT_PUBLIC_DATASET_SERVER=.*|NEXT_PUBLIC_DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i '' "s|NEXT_PUBLIC_EXECUTOR_SERVER=.*|NEXT_PUBLIC_EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env
sed -i '' "s|user:.*|user: '${PUID}:${PGID}'|g" docker-compose.yml


if [[ ! " $@ " =~ " --beian " ]]; then
  sed -i '' "s|BEIAN=.*|BEIAN=|" .env
fi


# copy the .env file to the cityflow_workstation
echo "copy .env file"
cp .env "${PWD}/cityflow_workstation/.env.local"

# change user to current user
echo "User setup..."

# change the owner of the cityflow_database and cityflow_executor
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/data
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_executor/code
sudo chown -R ${PUID}:${PGID} /var/run/docker.sock

# echo "Lunching cityflow..."

# docker-compose pull

docker-compose down

trap ' \
echo "\nStopping cityflow..." && \
kill $(jobs -p) &&  \
echo "Stopping neo4j..." && \
docker stop neo4j &&  \
echo "Removing cityflow_executor temp containers..." && \
containers=$(docker ps --filter "name=csflow" -q) && \
if [ -n "$containers" ]; then \
  echo "$containers" | xargs docker stop; \
else \
  echo "No temp containers"; \
fi && \
echo "Removing cityflow_executor temp codes..." && \
rm -rf ${PWD}/cityflow_executor/code/* \
' \
SIGINT

cd ${PWD}/cityflow_executor && python server.py | tee executor.log &

cd ${PWD}/cityflow_database && docker start neo4j && python server.py | tee database.log &

cd ${PWD}/cityflow_workstation && npm run dev | tee workstation.log &

wait