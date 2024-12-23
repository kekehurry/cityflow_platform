#!/bin/bash

# Pull the required images
# docker pull gboeing/osmnx
# docker pull python:3-slim

docker network ls | grep -q cityflow || docker network create cityflow

sed -i '' "s/EXECUTOR_USER=.*/EXECUTOR_USER=$(id -u):$(id -g)/" .env

sudo usermod -aG docker $USER

sudo chown $(id -u):$(id -g) cityflow_database
sudo chown $(id -u):$(id -g) cityflow_executor
sudo chown $(id -u):$(id -g) /var/run/docker.sock

# reload docker daemon and restart docker
sudo systemctl daemon-reload
sudo systemctl restart docker

docker-compose up