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
                        .WithHttpHealthCheck("/health");

// The Vite dev server is pinned to port 5173 (not proxied) because Keycloak's
// cloudboard-client only accepts redirects to http://localhost:5173 (see Realms/cloudboard.json).
builder.AddJavaScriptApp("vue", "../CloudBoard.Vue", "dev")
       .WithHttpEndpoint(port: 5173, env: "PORT", isProxied: false)
       .WithReference(apiService)
       .WaitFor(apiService)
       .WithExternalHttpEndpoints()
       .PublishAsStaticWebsite();

builder.Build().Run();
