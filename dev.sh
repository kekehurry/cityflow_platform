#!/bin/bash

DATABASE_HOST='127.0.0.1'
EXECUTOR_HOST='127.0.0.1'
PUID=$(id -u)
PGID=$(id -g)

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

echo "Environment setup..."

# Detect OS and set sed command accordingly
cd ${PWD}

# if dev in linux remove the '' after -i
sed -i '' "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i '' "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i '' "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=${PWD}/cityflow_executor/code|" .env
sed -i '' "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=${PWD}/cityflow_database/source|" .env
sed -i '' "s|LOCAL_MODEL_PATH=.*|LOCAL_MODEL_PATH=${PWD}/cityflow_database/models|" .env
sed -i '' "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i '' "s|DATASET_SERVER=.*|DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i '' "s|EXECUTOR_SERVER=.*|EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env

cp .env "${PWD}/cityflow_workstation/.env.local"


# change user to current user
echo "User setup..."

# change the owner of the cityflow_database and cityflow_executor
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/data
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_database/source
sudo chown -R ${PUID}:${PGID} ${PWD}/cityflow_executor/code
sudo chown -R ${PUID}:${PGID} /var/run/docker.sock


echo "Lunching cityflow..."

set -a
source .env
set +a

cd ${PWD}/cityflow_executor && python server.py | tee executor.log &

cd ${PWD}/cityflow_database && docker start neo4j && python server.py | tee database.log &

cd ${PWD}/cityflow_workstation && npm run dev | tee workstation.log &

wait