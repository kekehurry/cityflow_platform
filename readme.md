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
    -e LLM_BASE_URL={{secrets.LLM_BASE_URL}} \
    -e LLM_API_KEY={{secrets.LLM_API_KEY}} \
    -e LLM_MODEL={{secrets.LLM_MODEL}} \
    -e MAPBOX_TOKEN={{secrets.MAPBOX_TOKEN}} \
    ghcr.io/kekehurry/cityflow_platform:latest
```