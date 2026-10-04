var builder = DistributedApplication.CreateBuilder(args);

// Users sign in with Google through Keycloak. Set these as AppHost user secrets:
//   dotnet user-secrets set "Parameters:google-client-id" "<client id>"
//   dotnet user-secrets set "Parameters:google-client-secret" "<client secret>"
var googleClientId = builder.AddParameter("google-client-id");
var googleClientSecret = builder.AddParameter("google-client-secret", secret: true);

var keycloak = builder.AddKeycloak("keycloak", 8080)
                      .WithRealmImport("./Realms/cloudboard.json")
                      // Substituted into the realm's Google identity provider on import.
                      .WithEnvironment("GOOGLE_CLIENT_ID", googleClientId)
                      .WithEnvironment("GOOGLE_CLIENT_SECRET", googleClientSecret)
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
       // Keycloak's URL as Aspire publishes it: https://localhost:8080 when a trusted ASP.NET
       // dev certificate exists (Aspire then serves Keycloak over HTTPS only), otherwise http.
       .WithEnvironment("VITE_KEYCLOAK_URL", keycloak.GetEndpoint("http"))
       .WaitFor(apiService)
       .WithExternalHttpEndpoints()
       .PublishAsStaticWebsite();

builder.Build().Run();
