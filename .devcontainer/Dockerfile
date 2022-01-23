# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.5/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# global username config
ARG USERNAME=node

RUN apt-get update

RUN echo "*** git crypt ***" \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y git-crypt

RUN echo "*** redis ***" \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y redis-server \
    && chown -R $USERNAME /etc/redis

COPY redis.conf /etc/redis/redis.conf

# SQLLITE4 on arm
WORKDIR /workspaces

ARG TARGETPLATFORM

# we need to rebuild sqllite drivers if we are on mac m1 aarch64
ARG TARGETPLATFORM="arm64"
COPY patch.properties /workspaces/sqllite_patch.properties
RUN if [ "$TARGETPLATFORM" = "arm64" ]; then \
    echo "**** build tools ****" \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y gant gcc swig git wget openjdk-11-jdk-headless \
    && echo "**** sqllite ****" \
    && git clone https://bitbucket.org/almworks/sqlite4java.git sqllite \
    && cd sqllite \
    && git checkout 7b55b3eab6901a0e49d6e1129431fa92c4206c0b \
    && patch -p 1 < ../sqllite_patch.properties \
    && cd ant \
    && export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64 \
    && gant -v -Djdk.home=/usr/lib/jvm/java-11-openjdk-arm64 -Djre.linux-arm64=/usr/lib/jvm/java-11-openjdk-arm64 dist \
    && echo "**** copy result to dynamodb ****" \
    && mkdir -p /workspaces/tabler-world-mobile/services/tabler-world-api/.dynamodb/DynamoDBLocal_lib \
    && mkdir -p /workspaces/tabler-world-mobile/services/tabler-world-import/.dynamodb/DynamoDBLocal_lib \
    && cp -p /workspaces/sqllite/build/dist/libsqlite4java-linux-arm64.so /workspaces/tabler-world-mobile/services/tabler-world-api/.dynamodb/DynamoDBLocal_lib/libsqlite4java-linux-aarch64.so \
    && cp -p /workspaces/sqllite/build/dist/libsqlite4java-linux-arm64.so /workspaces/tabler-world-mobile/services/tabler-world-import/.dynamodb/DynamoDBLocal_lib/libsqlite4java-linux-aarch64.so \
    && cp -p /workspaces/sqllite/build/dist/sqlite4java.jar /workspaces/tabler-world-mobile/services/tabler-world-api/.dynamodb/DynamoDBLocal_lib/sqlite4java.jar \
    && cp -p /workspaces/sqllite/build/dist/sqlite4java.jar /workspaces/tabler-world-mobile/services/tabler-world-import/.dynamodb/DynamoDBLocal_lib/sqlite4java.jar \
    ; else echo "not arm64"; fi;

# we use this version due to compatibility with serverless
ARG EXTRA_NODE_VERSION=14.16.1
RUN echo "*** node $EXTRA_NODE_VERSION ***" \
    && su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION} && nvm use ${EXTRA_NODE_VERSION}"

# AWS
RUN echo "*** aws_cli ***" \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y awscli

# bash history
RUN echo "*** bash history ***" \
    && SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R $USERNAME /commandhistory \
    && echo $SNIPPET >> "/home/$USERNAME/.bashrc"

RUN apt-get clean
