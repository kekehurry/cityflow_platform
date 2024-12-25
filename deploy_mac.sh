#!/bin/bash

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

# modify the .env file
sed -i '' "s|EXECUTOR_USER=.*|EXECUTOR_USER=$(id -u):$(id -g)|" .env
sed -i '' "s|EXECUTOR_WORK_DIR=.*|EXECUTOR_WORK_DIR=/workspace/code|" .env
sed -i '' "s|EXECUTOR_BIND_DIR=.*|EXECUTOR_BIND_DIR=${PWD}/cityflow_executor/code|" .env
sed -i '' "s|DATABASE_SOURCE_DIR=.*|DATABASE_SOURCE_DIR=${PWD}/cityflow_database/source|" .env
sed -i '' "s|BOLT_URL=.*|BOLT_URL=bolt://cityflow_database:7687|" .env
sed -i '' "s|NEXT_PUBLIC_DATASET_SERVER=.*|NEXT_PUBLIC_DATASET_SERVER=http://cityflow_database:7575|" .env
sed -i '' "s|NEXT_PUBLIC_EXECUTOR_SERVER=.*|NEXT_PUBLIC_EXECUTOR_SERVER=http://cityflow_executor:8000|" .env
sed -i '' "s|user:.*|user: '$(id -u):$(id -g)'|g" docker-compose.yml

# change user to current user
echo "User setup..."
# sudo usermod -aG docker $USER

# # change the owner of the cityflow_database and cityflow_executor
# sudo chown -R $(id -u):$(id -g) ${PWD}/cityflow_database/data
# sudo chown -R $(id -u):$(id -g) ${PWD}/cityflow_executor/code
# sudo chown -R $(id -u):$(id -g) /var/run/docker.sock

echo "Lunching cityflow..."

docker-compose pull

docker-compose dowm

docker-compose up -d