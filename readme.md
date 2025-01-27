# Installation

```
docker pull ghcr.io/kekehurry/cityflow_runner:latest && \
docker run -d \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ${PWD}/temp:/cityflow_platform/cityflow_executor/code \
    -e EXECUTOR_BIND_DIR=${PWD}/temp \
    ghcr.io/kekehurry/cityflow_platform:latest
```