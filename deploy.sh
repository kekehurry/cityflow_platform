# Remove containers with ancestor ghcr.io/kekehurry/cityflow_runner:latest
runner_containers=$(docker ps -a --filter "ancestor=ghcr.io/kekehurry/cityflow_runner:full" --format "{{.ID}}")
if [ -n "$runner_containers" ]; then
    echo "$runner_containers" | xargs docker rm -f
fi
# Remove containers with ancestor ghcr.io/kekehurry/cityflow_platform:latest
platform_containers=$(docker ps -a --filter "ancestor=ghcr.io/kekehurry/cityflow_platform:latest" --format "{{.ID}}")
if [ -n "$platform_containers" ]; then
    echo "$platform_containers" | xargs docker rm -f
fi

docker rm cityflow_platform

docker pull --platform=linux/amd64 ghcr.nju.edu.cn/kekehurry/cityflow_runner:full
docker pull --platform=linux/amd64 ghcr.nju.edu.cn/kekehurry/cityflow_platform:latest
docker image tag ghcr.nju.edu.cn/kekehurry/cityflow_runner:dev ghcr.io/kekehurry/cityflow_runner:full
docker image tag ghcr.nju.edu.cn/kekehurry/cityflow_platform:latest ghcr.io/kekehurry/cityflow_platform:latest

# create cityflow_platform directory

cd ~

mkdir -p cityflow_platform

cd cityflow_platform

# Run the cityflow_platform container
docker run -d --privileged \
    --name cityflow_platform \
    --restart=always \
    --platform=linux/amd64 \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $PWD/temp:/cityflow_platform/cityflow_executor/code \
    -v $PWD/data:/cityflow_platform/cityflow_database/data \
    -v $PWD/source:/cityflow_platform/cityflow_database/source \
    ghcr.io/kekehurry/cityflow_platform:latest