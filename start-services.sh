#!/bin/bash

#setup env
echo "Loading environment variables from /cityflow_platform/.env..."
set -a
source /cityflow_platform/.env
set +a

# if no cityflow runner image, pull latest cityflow_runner
if ! docker images --format '{{.Repository}}:{{.Tag}}' | grep -q '^ghcr.io/kekehurry/cityflow_runner:'; then
    echo "Image cityflow_runner not found, pulling latest..."
    docker pull ghcr.io/kekehurry/cityflow_runner:latest
else
    echo "Image cityflow_runner found, skipping pull."
fi

# if no $LOCAL_MODEL_PATH/minilm.onnx, download it from Google Drive
if [ ! -f "${LOCAL_MODEL_PATH}/minilm.onnx" ]; then
    echo "minilm.onnx not found. Downloading from Google Drive..."
    destination="${LOCAL_MODEL_PATH}/minilm.onnx"
    mkdir -p "${LOCAL_MODEL_PATH}"
    curl -L "https://drive.google.com/uc?export=download&id=1ahQMzx1kfzKVYXeNmmXqbe5ojzmHPwMz" -o "${destination}"
else
    echo "minilm.onnx already exists, skipping download."
fi

/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until curl -s http://localhost:7474 > /dev/null; do
    echo "Waiting for Neo4j to start..."
    sleep 2
done

# cd workdir
cd /cityflow_platform 

# Initialize database
if [ "$INIT_DATABASE" ]; then
  python3 ./cityflow_database/init_db.py
fi

# Start services
cd /cityflow_platform/cityflow_database && python3 server.py &
cd /cityflow_platform/cityflow_executor && python3 server.py &
cd /cityflow_platform/cityflow_workstation && node server.js &

cd /cityflow_platform/
# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?