docker build -t ghcr.io/kekehurry/cityflow_platform:latest .

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


docker run -it \
    --name cityflow_platform \
    -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart always \
    -v $PWD/temp:/cityflow_executor/code \
    -e EXECUTOR_BIND_DIR=$PWD/temp \
    -e LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4 \
    -e LLM_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsInNpZ25fdHlwZSI6IlNJR04ifQ.eyJhcGlfa2V5IjoiODdiNTg2MzkzZjA2NWRiZmEzOGMyOTE1NjEwODE1OTciLCJleHAiOjE3Njg0MTA2MzczNDMsInRpbWVzdGFtcCI6MTczNjg3NDYzNzM0M30.9WSnmOXf-QyIcgWV5GM5Srvn-W9CaxhNT4Zv0d4ouko \
    -e LLM_MODEL=glm-4-flash \
    -e MAPBOX_TOKEN=pk.eyJ1Ijoia2VrZWh1cnJ5IiwiYSI6ImNsbzdncTlqaDA0aDEya3BiaWZuc3Q2dnAifQ.ln2R45SGy6_MTakR8XWnsw \
    ghcr.io/kekehurry/cityflow_platform:latest