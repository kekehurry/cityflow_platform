docker build -t cityflow-platform:latest .

# Installation

```
docker pull ghcr.io/kekehurry/cityflow_runner:latest
```

```
docker run -d \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart always \
    -v $PWD/temp:/cityflow_executor/code \
    -e EXECUTOR_BIND_DIR=$PWD/temp \
    -e LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4 \
    -e LLM_API_KEY=${{secrets.LLM_API_KEY}} \
    -e LLM_MODEL=glm-4-flash \
    -e MAPBOX_TOKEN=${{secrets.MAPBOX_TOKEN}} \
    ghcr.io/kekehurry/cityflow_platform:latest
```