namespace CloudBoard.ApiService.Data;

public class CloudBoardDocument
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}