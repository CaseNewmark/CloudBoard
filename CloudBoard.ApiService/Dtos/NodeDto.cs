using System.Text.Json;

namespace CloudBoard.ApiService.Dtos;

public class NodePositionDto
{
    public float X { get; set; }
    public float Y { get; set; }
}

public class NodeDto
{
    public required string Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public NodePositionDto Position { get; set; } = new NodePositionDto();
    public List<ConnectorDto> Connectors { get; set; } = new List<ConnectorDto>();
    public string Type { get; set; } = "note";
    public JsonDocument Properties { get; set; } = JsonDocument.Parse("{}");
}
