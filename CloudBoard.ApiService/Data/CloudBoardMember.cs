namespace CloudBoard.ApiService.Data;

/// <summary>
/// A user a board is shared with, identified by email. Members can view and edit the
/// board's nodes and connections; only the owner can rename, share or delete it.
/// </summary>
public class CloudBoardMember
{
    public Guid CloudBoardDocumentId { get; set; }
    /// <summary>Lower-case, trimmed email address.</summary>
    public string Email { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public CloudBoard CloudBoardDocument { get; set; } = null!;
}
