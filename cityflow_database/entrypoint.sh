# Start cityflow database
/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until curl -s http://localhost:7474 > /dev/null; do
    echo "Waiting for Neo4j to start..."
    sleep 2
done

# Run the Python script

python3 /workspace/init_db.py

python3 /workspace/server.py