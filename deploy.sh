#!/bin/bash

# Pull the required images
docker pull gboeing/osmnx
docker pull python:3-slim

docker network ls | grep -q cityflow || docker network create cityflow

# change user to current user
sed -i "s/EXECUTOR_USER=.*/EXECUTOR_USER=$(id -u):$(id -g)/" .env
sed -i "s/user:.*/user: '$(id -u):$(id -g)'/g" docker-compose.yml

sudo usermod -aG docker $USER

# change the owner of the cityflow_database and cityflow_executor
sudo chown -R $(id -u):$(id -g) cityflow_database
sudo chown -R $(id -u):$(id -g) cityflow_executor
sudo chown -R $(id -u):$(id -g) /var/run/docker.sock

# reload docker daemon and restart docker
sudo systemctl daemon-reload
sudo systemctl restart docker

docker-compose up