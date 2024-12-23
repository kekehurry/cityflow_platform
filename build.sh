#!/bin/bash

# Pull the required images
docker pull gboeing/osmnx
docker pull python:3-slim

docker network create cityflow

#if no user 1000:1000, create one
sudo useradd -u 1000 -m cityflow
sudo groupadd cityflow -g 1000
sudo usermod -aG docker,cityflow cityflow


sudo chown -R 1000:1000 cityflow_database
sudo chown -R 1000:1000 cityflow_executor
sudo chown -R 1000:1000 /var/run/docker.sock

docker-compose up