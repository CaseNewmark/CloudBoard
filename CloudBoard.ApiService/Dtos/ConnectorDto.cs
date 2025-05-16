namespace CloudBoard.ApiService.Dtos;

public class ConnectorDto
{
    public required string Id { get; init; } 
    public required string FromNodeId { get; set; }
    public required string ToNodeId { get; set; }
}
