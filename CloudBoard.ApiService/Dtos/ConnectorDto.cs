namespace CloudBoard.ApiService.Dtos;

public class ConnectorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
