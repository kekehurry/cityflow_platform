#!/bin/bash

/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until curl -s http://localhost:7474 > /dev/null; do
    echo "Waiting for Neo4j to start..."
    sleep 2
done

# Initialize database
if [ "$INIT_DATABASE" ]; then
  cd / && python3 /cityflow_database/init_db.py
fi

# Start services
cd /cityflow_database &&  python3 server.py &
cd /cityflow_executor && python3 server.py &
cd /cityflow_workstation/ && node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?