# Stage 1: Build the ASP.NET Core application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy all other files and build
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Create the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expose port 5138 (matches development configuration and frontend expectation)
EXPOSE 5138
ENV ASPNETCORE_URLS=http://+:5138

ENTRYPOINT ["dotnet", "sim_backend.dll"]
