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

cp .env.production .env

echo "EXECUTOR_BIND_DIR=" >> .env
echo "NODE_ENV=development" >> .env

# if dev in linux remove the '' after -i
sed -i '' "s|EXECUTOR_USER=.*|EXECUTOR_USER=${PUID}:${PGID}|" .env
sed -i '' "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/temp|" .env
sed -i '' "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=${PWD}/temp|" .env
sed -i '' "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=${PWD}/cityflow_database/source|" .env
sed -i '' "s|LOCAL_MODEL_PATH=.*|LOCAL_MODEL_PATH=${PWD}/cityflow_database/models|" .env
sed -i '' "s|BOLT_URL=.*|BOLT_URL=bolt://${DATABASE_HOST}:7687|" .env
sed -i '' "s|NEXT_PUBLIC_DATASET_SERVER=.*|NEXT_PUBLIC_DATASET_SERVER=http://${DATABASE_HOST}:7575|" .env
sed -i '' "s|NEXT_PUBLIC_EXECUTOR_SERVER=.*|NEXT_PUBLIC_EXECUTOR_SERVER=http://${EXECUTOR_HOST}:8000|" .env

cp .env "${PWD}/cityflow_workstation/.env.local"