# Installation

```
docker run -d \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $PWD/temp:/cityflow_executor/code \
    ghcr.io/kekehurry/cityflow_platform:latest
```