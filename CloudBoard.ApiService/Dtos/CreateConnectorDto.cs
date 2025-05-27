namespace CloudBoard.ApiService.Dtos;

public class CreateConnectorDto
{
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = "left";
    public string Type { get; set; } = "in";
    public Guid NodeId { get; set; }
}
