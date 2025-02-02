#!/bin/bash
#pull latest cityflow_runner

docker pull ghcr.io/kekehurry/cityflow_runner:latest

#setup env before start neo4j
echo "Loading environment variables from /cityflow_platform/.env..."
set -a
source /cityflow_platform/.env
set +a

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