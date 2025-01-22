# Stage 1: Build
FROM node:18.20-alpine AS build

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./cityflow_workstation .

RUN npm install && npm run build

# Stage 2: Production
FROM neo4j:5.20.0

# cityflow_workstation
WORKDIR /cityflow_workstation

ENV HOSTNAME='0.0.0.0'
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs=18.20.0-1nodesource1

COPY --from=build /app/.next/standalone /cityflow_workstation
COPY --from=build /app/.next/static /cityflow_workstation/.next/static
COPY --from=build /app/public /cityflow_workstation/public

# cityflow_database
WORKDIR /cityflow_database
COPY ./cityflow_database /cityflow_database

RUN apt-get update && apt-get install -y curl python3 python3-pip && \
    pip3 install -r requirements.txt && \
    chmod +x /cityflow_database/entrypoint.sh && \
    chown -R neo4j:neo4j /data

# cityflow_exexutor
WORKDIR /cityflow_executor

COPY ./cityflow_executor /cityflow_executor
COPY ./start-services.sh /usr/local/bin/

RUN apt-get update && \
    apt-get install -y ca-certificates curl && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    pip3 install -r requirements.txt

EXPOSE 3000 

# Replace multiple CMDs with single ENTRYPOINT
CMD ["/usr/local/bin/start-services.sh"]