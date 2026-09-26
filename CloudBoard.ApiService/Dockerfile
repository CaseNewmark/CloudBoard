# Build from the repository root (the API references CloudBoard.ServiceDefaults):
#   docker build -f CloudBoard.ApiService/Dockerfile .
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY CloudBoard.ApiService/CloudBoard.ApiService.csproj CloudBoard.ApiService/
COPY CloudBoard.ServiceDefaults/CloudBoard.ServiceDefaults.csproj CloudBoard.ServiceDefaults/
RUN dotnet restore CloudBoard.ApiService/CloudBoard.ApiService.csproj

COPY CloudBoard.ApiService/ CloudBoard.ApiService/
COPY CloudBoard.ServiceDefaults/ CloudBoard.ServiceDefaults/
# OpenApiGenerateDocuments=false: the build otherwise regenerates ../OpenApi/cloudboard-api.json.
RUN dotnet publish CloudBoard.ApiService/CloudBoard.ApiService.csproj \
      -c Release -o /app --no-restore -p:OpenApiGenerateDocuments=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "CloudBoard.ApiService.dll"]
