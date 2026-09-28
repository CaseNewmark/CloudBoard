namespace CloudBoard.ApiService.Data;

/// <summary>An image uploaded to a board, stored in the database. Deleted together with its board.</summary>
public class BoardImage
{
    public Guid Id { get; set; }
    public Guid CloudBoardDocumentId { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public long SizeBytes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
