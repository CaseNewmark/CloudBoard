namespace CloudBoard.ApiService.Dtos;

public class NodePositionDto
{
    public int X { get; set; }
    public int Y { get; set; }
}

public class NodeDto
{
    public required string Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public NodePositionDto Position { get; set; } = new NodePositionDto();
}
