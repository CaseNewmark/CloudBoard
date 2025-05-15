namespace CloudBoard.ApiService.Data;

public class Node
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public NodePosition Position { get; set; } = new NodePosition();
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoardDocument CloudBoardDocument { get; set; } = null!;
}

public class NodePosition
{
    public int X { get; set; }
    public int Y { get; set; }
}
