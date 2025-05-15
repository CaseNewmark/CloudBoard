namespace CloudBoard.ApiService.Dtos;

public class NodePositionDto
{
    public int X { get; set; }
    public int Y { get; set; }
}

public class NodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public NodePositionDto Position { get; set; } = new NodePositionDto();
}
