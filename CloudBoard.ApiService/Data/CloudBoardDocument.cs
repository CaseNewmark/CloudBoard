namespace CloudBoard.ApiService.Data;

public class CloudBoardDocument
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Node> Nodes { get; set; } = new List<Node>();
    public List<Connector> Connectors { get; set; } = new List<Connector>();
}