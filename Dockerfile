# Stage 1: Build
FROM node:18.20-alpine AS build

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./cityflow_workstation .
COPY ./.env.production .

RUN npm install && npm run build

# Stage 2: Production
FROM neo4j:latest

USER root

WORKDIR /cityflow_platform

COPY --from=build /app/.next/standalone ./cityflow_workstation
COPY --from=build /app/.next/static ./cityflow_workstation/.next/static
COPY --from=build /app/public ./cityflow_workstation/public
COPY ./cityflow_database ./cityflow_database
COPY ./cityflow_executor ./cityflow_executor
COPY ./start-services.sh ./start-services.sh
COPY ./requirements.txt ./requirements.txt
COPY ./.env.production ./.env

# Load environment variables from file
ENV HOSTNAME='0.0.0.0'
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y apt-utils ca-certificates curl python3 python3-pip && \
    # install nodejs
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \  
    apt-get install -y nodejs=18.20.0-1nodesource1 && \
    # install docker
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    # download minilm.onnx
    curl -L "https://drive.google.com/uc?export=download&id=1ahQMzx1kfzKVYXeNmmXqbe5ojzmHPwMz" -o "./cityflow_database/models/minilm.onnx" && \
    # prepare for init
    chmod +x ./start-services.sh && \
    pip3 install -r ./requirements.txt && \
    ln -s /data ./cityflow_database/data

EXPOSE 3000 

VOLUME /cityflow_platform/cityflow_executor/code

ENTRYPOINT ["sh", "-c", "./start-services.sh"]