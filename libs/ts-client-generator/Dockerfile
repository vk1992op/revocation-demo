# Use the official image as a parent image
FROM mcr.microsoft.com/dotnet/sdk:7.0

# Set the working directory
WORKDIR /app

# Copy the C# project and other necessary files into the container
COPY ./libs/ts-client-generator /app

COPY ./agent-swagger.json /app/agent-swagger.json

RUN dotnet restore

RUN mkdir /app/generated

# Set the entry point
ENTRYPOINT ["dotnet", "run", "--project", "/app", "/app/agent-swagger.json", "/app/generated/agent_gen.ts"]
