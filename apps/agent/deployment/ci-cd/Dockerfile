FROM node:18.16.0-buster-slim

# Argument handler
ARG API_TOKEN
ARG JOB_ID

# Instal required software
RUN apt update -y && apt install python3 git make build-essential wget unzip -y

# Set the working directory
WORKDIR app

# Set the ENV variables
ENV GITLAB_BASE_URL=https://code.vereign.com/api/v4
ENV GITLAB_PROJECT_ID=662
ENV TOKEN=$API_TOKEN
ENV ID=$JOB_ID

# Download the artifacts from the GitLab API
RUN wget --header "PRIVATE-TOKEN: $TOKEN" -O artifacts.zip "${GITLAB_BASE_URL}/projects/${GITLAB_PROJECT_ID}/jobs/${ID}/artifacts"

# Unzip the artifacts (if needed) - adjust this command based on your artifact type
RUN unzip -q artifacts.zip && rm artifacts.zip

# Fix locations
RUN cp ./dist/apps/agent/main.js .
RUN cp ./dist/apps/agent/main.js.map .
RUN cp -r ./dist/libs/askar .
RUN cp -r ./dist/libs/clients .
RUN cp -r ./dist/libs/config .
RUN cp -r ./dist/libs/dtos .
RUN cp -r ./dist/libs/ledgers .
RUN cp -r ./dist/libs/nats .

RUN yarn install

# Expose required ports
EXPOSE 8080
EXPOSE 8001
EXPOSE 6001

#####hashtag
# Command / Entrypoint
CMD ["node", "main.js"]
