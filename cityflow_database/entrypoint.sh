# Start cityflow database
/startup/docker-entrypoint.sh neo4j &

# Wait for Neo4j to be ready
until curl -s http://localhost:7474 > /dev/null; do
    echo "Waiting for Neo4j to start..."
    sleep 2
done

# Run the Python script

if [ "$INIT_DATABASE" ]; then
  python3 init_db.py
fi

python3 /workspace/server.py