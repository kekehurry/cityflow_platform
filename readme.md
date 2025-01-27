# Installation

```
docker run -d \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /home/kai/temp:/cityflow_platform/cityflow_executor/code \
    -e EXECUTOR_BIND_DIR=/home/kai/temp \
    ghcr.io/kekehurry/cityflow_platform:latest
```