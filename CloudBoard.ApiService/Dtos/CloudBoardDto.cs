namespace CloudBoard.ApiService.Dtos;

public class CloudBoardDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<NodeDto> Nodes { get; set; } = new List<NodeDto>();
    public List<ConnectionDto> Connections { get; set; } = new List<ConnectionDto>();
}