docker build -t cityflow-platform:latest .

# Installation

```
docker pull ghcr.io/kekehurry/cityflow_runner:latest
```

```
export BIND_DIR=~/temp/code && \
docker run -d \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart always \
    -v ${BIND_DIR}:/cityflow_executor/code \
    -e EXECUTOR_BIND_DIR=${BIND_DIR} \
    -e LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4 \
    -e LLM_MODEL=glm-4-flash \
    -e LLM_API_KEY=${LLM_API_KEY} \
    -e MAPBOX_TOKEN=${MAPBOX_TOKEN} \
    ghcr.io/kekehurry/cityflow_platform:latest
```