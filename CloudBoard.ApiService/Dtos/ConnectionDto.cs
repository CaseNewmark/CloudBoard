namespace CloudBoard.ApiService.Dtos;

public class ConnectionDto
{
    public Guid Id { get; set; } 
    public required string FromConnectorId { get; set; }
    public required string ToConnectorId { get; set; }
}
