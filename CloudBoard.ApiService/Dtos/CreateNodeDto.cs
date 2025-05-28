using System.Text.Json;

namespace CloudBoard.ApiService.Dtos;

public class CreateNodeDto
{
    public string Name { get; set; } = string.Empty;
    public NodePositionDto Position { get; set; } = new NodePositionDto();
    public List<ConnectorDto> Connectors { get; set; } = new List<ConnectorDto>();
    public string Type { get; set; } = "note";
    public JsonDocument Properties { get; set; } = JsonDocument.Parse("{}");
    public Guid CloudBoardDocumentId { get; set; }
}
