var builder = DistributedApplication.CreateBuilder(args);

var keycloak = builder.AddKeycloak("keycloak", 8080)
                      .WithRealmImport("./Realms/cloudboard.json")
                      .WithDataVolume()
                      .PublishAsContainer();

var dbserver = builder.AddPostgres("postgres")
                      .WithDataVolume()
                      .PublishAsContainer();
                      //.WithPgAdmin();

var database = dbserver.AddDatabase("cloudboard");

var apiService = builder.AddProject<Projects.CloudBoard_ApiService>("apiservice")
    .WithReference(database)
    .WithReference(keycloak)
    .WaitFor(database)
    .WaitFor(keycloak)
    .WithHttpsHealthCheck("/health");

builder.AddNpmApp("angular", "../CloudBoard.Angular")
       .WithReference(keycloak)
       .WithReference(apiService)
       .WaitFor(apiService)
       .WithExternalHttpEndpoints()
       .PublishAsDockerFile();

builder.Build().Run();
