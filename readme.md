docker build -t cityflow-platform:latest .


docker run -it \
-p 3000:3000 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v ./cityflow_executor/code:/cityflow_executor/code \
-v ./cityflow_database/data:/data \
-v ./cityflow_database/source:/cityflow_database/source \
--env-file=./.env \
--name=cityfow_platform \
cityflow-platform:latest
