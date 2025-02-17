# Remove containers with ancestor ghcr.io/kekehurry/cityflow_runner:latest
runner_containers=$(docker ps -a --filter "ancestor=ghcr.io/kekehurry/cityflow_runner:full" --format "{{.ID}}")
if [ -n "$runner_containers" ]; then
    echo "$runner_containers" | xargs docker rm -f
fi
# Remove containers with ancestor ghcr.io/kekehurry/cityflow_platform:latest
platform_containers=$(docker ps -a --filter "ancestor=ghcr.io/kekehurry/cityflow_platform:dev" --format "{{.ID}}")
if [ -n "$platform_containers" ]; then
    echo "$platform_containers" | xargs docker rm -f
fi

docker system prune --all --force

docker pull ghcr.io/kekehurry/cityflow_runner:dev
docker pull ghcr.io/kekehurry/cityflow_platform:dev

docker image tag ghcr.io/kekehurry/cityflow_runner:dev ghcr.io/kekehurry/cityflow_runner:full

# create cityflow_platform directory

cd ~

mkdir -p cityflow_platform

cd cityflow_platform

# Run the cityflow_platform container
docker run -d \
    --name cityflow_platform \
    -p 3001:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $PWD/temp:/cityflow_platform/cityflow_executor/code \
    ghcr.io/kekehurry/cityflow_platform:dev