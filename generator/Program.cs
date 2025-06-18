using CommandLine;
using NJsonSchema.CodeGeneration.TypeScript;
using NSwag;
using NSwag.CodeGeneration.TypeScript;

public class Options
{
    [Option('i', "input", Required = true, HelpText = "The OpenAPI/Swagger input (URL or local file path) to generate client from.")]
    public string Input { get; set; } = string.Empty;

    [Option('o', "output", Required = true, HelpText = "Output file path for the generated TypeScript client.")]
    public string Output { get; set; } = string.Empty;

    [Option('c', "class", Required = false, Default = "ApiClientService", HelpText = "Name of the generated client class.")]
    public string ClassName { get; set; } = "ApiClientService";
}

class Program
{
    static async Task Main(string[] args)
    {
        await Parser.Default.ParseArguments<Options>(args)
            .WithParsedAsync(async options =>
            {
                var outputPath = Path.Combine(Directory.GetCurrentDirectory(), options.Output);

                await GenerateClient(
                    document: await LoadOpenApiDocument(options.Input),
                    outputPath: outputPath,
                    className: options.ClassName
                );
            });
    }

    static async Task<OpenApiDocument> LoadOpenApiDocument(string input)
    {
        Console.WriteLine($"Loading OpenAPI document from: {input}");

        // Check if the input is a local file path
        if (File.Exists(input) || (!input.StartsWith("http://") && !input.StartsWith("https://")))
        {
            // Handle as local file
            var fullPath = Path.GetFullPath(input);
            
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"OpenAPI file not found: {fullPath}");
            }

            Console.WriteLine($"Reading local file: {fullPath}");
            return await OpenApiDocument.FromFileAsync(fullPath);
        }
        else
        {
            // Handle as URL
            Console.WriteLine($"Fetching from URL: {input}");
            return await OpenApiDocument.FromUrlAsync(input);
        }
    }

    static async Task GenerateClient(OpenApiDocument document, string outputPath, string className)
    {
        Console.WriteLine($"Generating {outputPath}...");

        var settings = new TypeScriptClientGeneratorSettings
        {
            ClassName = className,
            Template = TypeScriptTemplate.Angular,
            PromiseType = PromiseType.Promise,
            HttpClass = HttpClass.HttpClient,
            RxJsVersion = 7,
            UseSingletonProvider = true,
            InjectionTokenType = InjectionTokenType.InjectionToken,
        };
        settings.TypeScriptGeneratorSettings.TypeStyle = TypeScriptTypeStyle.Interface;
        settings.TypeScriptGeneratorSettings.TypeScriptVersion = 5.5M;
        settings.TypeScriptGeneratorSettings.DateTimeType = TypeScriptDateTimeType.String;

        var generator = new TypeScriptClientGenerator(document, settings);
        var code = generator.GenerateFile();

        await File.WriteAllTextAsync(outputPath, code);
        
        Console.WriteLine($"Generated successfully: {outputPath}");
    }
}