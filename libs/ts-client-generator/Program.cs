using NJsonSchema.CodeGeneration.TypeScript;
using NSwag;
using NSwag.CodeGeneration.TypeScript;

if (args.Length != 2)
    throw new ArgumentException("Expecting 2 arguments: path, generatePath");

var path = args[0];
var generatePath = Path.Combine(Directory.GetCurrentDirectory(), args[1]);


async static Task GenerateTypeScriptClient(string path, string generatePath) =>
  await GenerateClient(
    document: await OpenApiDocument.FromFileAsync(path),
    generatePath: generatePath,
    generateCode: (OpenApiDocument document) =>
    {
       var settings = new TypeScriptClientGeneratorSettings();

       settings.TypeScriptGeneratorSettings.NullValue = TypeScriptNullValue.Null;
       settings.TypeScriptGeneratorSettings.TypeStyle = TypeScriptTypeStyle.Interface;
       settings.TypeScriptGeneratorSettings.TypeScriptVersion = 5.1M;
       settings.TypeScriptGeneratorSettings.DateTimeType = TypeScriptDateTimeType.Date;

       var generator = new TypeScriptClientGenerator(document, settings);
       var code = generator.GenerateFile();

       code = code.Replace("protected jsonParseReviver", "public jsonParseReviver");
       return code;
    }
  );

await GenerateTypeScriptClient(path, generatePath);

async static Task GenerateClient(OpenApiDocument document, string generatePath, Func<OpenApiDocument, string> generateCode)
{
    Console.WriteLine($"Generating {generatePath}...");

    var code = generateCode(document);

    await System.IO.File.WriteAllTextAsync(generatePath, code);
}
