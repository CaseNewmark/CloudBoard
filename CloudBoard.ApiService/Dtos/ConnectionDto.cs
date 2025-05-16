namespace CloudBoard.ApiService.Dtos;

public class ConnectionDto
{
    public required string Id { get; init; } 
    public required string FromConnectorId { get; set; }
    public required string ToConnectorId { get; set; }
}
