using System.Text.Json;

namespace CloudBoard.ApiService.Dtos;

public class NodePositionDto
{
    public float X { get; set; }
    public float Y { get; set; }
}

public class NodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public NodePositionDto Position { get; set; } = new NodePositionDto();
    public List<ConnectorDto> Connectors { get; set; } = new List<ConnectorDto>();
    public JsonDocument Properties { get; set; } = JsonDocument.Parse("{}");
}
