namespace CloudBoard.ApiService.Dtos;

public class ConnectionDto
{
    public string Id { get; set; } = string.Empty;
    public required string FromConnectorId { get; set; }
    public required string ToConnectorId { get; set; }
}
