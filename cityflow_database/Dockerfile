# Use the official Neo4j image as the base image
FROM neo4j:5.20.0

WORKDIR /workspace
COPY . .

RUN apt-get update && apt-get install -y curl python3 python3-pip && \
    pip3 install -r requirements.txt

RUN chmod +x /workspace/entrypoint.sh && \
    chown -R neo4j:neo4j /data

# Expose the necessary ports
EXPOSE 7474 7687 7575

CMD ["/workspace/entrypoint.sh"]