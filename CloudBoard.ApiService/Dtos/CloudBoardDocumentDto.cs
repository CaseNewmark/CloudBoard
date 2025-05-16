namespace CloudBoard.ApiService.Dtos;

public class CloudBoardDocumentDto
{
    public required string Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public List<NodeDto> Nodes { get; set; } = new List<NodeDto>();
    public List<ConnectorDto> Connectors { get; set; } = new List<ConnectorDto>();
}