namespace CloudBoard.ApiService.Data;

public class Connector
{
    public string Id { get; set; } = string.Empty;
    public string FromNodeId { get; set; } = string.Empty;
    public string ToNodeId { get; set; } = string.Empty;
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoardDocument CloudBoardDocument { get; set; } = null!;
}
