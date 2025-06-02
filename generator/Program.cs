using NJsonSchema.CodeGeneration.TypeScript;
using NSwag;
using NSwag.CodeGeneration.TypeScript;

if (args.Length != 2)
    throw new ArgumentException("Expecting 3 arguments: URL, generatePath");

var url = args[0];
var generatePath = Path.Combine(Directory.GetCurrentDirectory(), args[1]);

await GenerateClient(
    document: await OpenApiDocument.FromUrlAsync(url),
    generatePath: generatePath,
    generateCode: (OpenApiDocument document) =>
    {
        var settings = new TypeScriptClientGeneratorSettings();

        settings.ClassName = "ApiClientService";
        settings.Template = TypeScriptTemplate.Angular;
        settings.PromiseType = PromiseType.Promise;
        settings.HttpClass = HttpClass.HttpClient;
        settings.RxJsVersion = 7;
        settings.UseSingletonProvider = true;
        settings.InjectionTokenType = InjectionTokenType.InjectionToken;
        settings.TypeScriptGeneratorSettings.TypeStyle = TypeScriptTypeStyle.Interface;
        settings.TypeScriptGeneratorSettings.TypeScriptVersion = 5.5M;
        settings.TypeScriptGeneratorSettings.DateTimeType = TypeScriptDateTimeType.String;

        var generator = new TypeScriptClientGenerator(document, settings);
        var code = generator.GenerateFile();

        return code;
    }
);


async static Task GenerateClient(OpenApiDocument document, string generatePath, Func<OpenApiDocument, string> generateCode)
{
    Console.WriteLine($"Generating {generatePath}...");

    var code = generateCode(document);

    await System.IO.File.WriteAllTextAsync(generatePath, code);
}