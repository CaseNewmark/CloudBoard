namespace CloudBoard.ApiService.Dtos;

/// <summary>Email addresses a board is shared with. Shared users get full edit access to nodes and connections.</summary>
public class CloudBoardMembersDto
{
    public List<string> Emails { get; set; } = new List<string>();
}
