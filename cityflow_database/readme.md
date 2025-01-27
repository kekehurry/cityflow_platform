### Install Neo4j

To run the model, you'll need `neo4j` installed in your machine first.You can create a neo4j docker container with the following command, you can set your own `data`,`logs` and `conf` folder. If you're using Windows, ensure that the correct path is set.

```
docker build --platform linux/amd64,linux/arm64 -t kekehurry/cityflow_database:latest .
```

```
docker run \
    -itd \
    -p 7474:7474 \
    -p 7687:7687 \
    -p 7575:7575 \
    -v $PWD/data:/data \
    --restart always \
    --env-file .env \
    --name cityflow_database \
    --network cityflow \
    kekehurry/cityflow_database:latest
```
