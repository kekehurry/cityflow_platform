#!/bin/bash

chown -R neo4j:neo4j /data
chown -R $(id -u):$(id -g) /cityflow_database/source
chown -R $(id -u):$(id -g) /cityflow_executor/code

/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until curl -s http://localhost:7474 > /dev/null; do
    echo "Waiting for Neo4j to start..."
    sleep 2
done

# Install Python dependencies
pip3 install -r /requirements.txt

# Initialize database
if [ "$INIT_DATABASE" ]; then
  python3 /cityflow_database/init_db.py
fi

# Start services
cd /cityflow_database &&  python3 server.py &
cd /cityflow_executor && python3 server.py &
cd /cityflow_workstation/ && node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?