# Build with Docker

- build the docker image

```
docker build --platform linux/amd64,linux/arm64 -t kekehurry/cityflow_executor:latest .
```

- create a docker container and run

```
sudo docker run --privileged  -it --rm \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $PWD/code:/workspace/code \
-p 8000:8000 \
--env-file .env \
--name cityflow_executor \
--network cityflow \
crpi-3e6elxy9dscu6371.cn-guangzhou.personal.cr.aliyuncs.com/kekehurry/cityflow_executor
```
