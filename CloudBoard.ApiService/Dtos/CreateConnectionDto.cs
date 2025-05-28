namespace CloudBoard.ApiService.Dtos;

public class CreateConnectionDto
{
    public string FromConnectorId { get; set; } = string.Empty;
    public string ToConnectorId { get; set; } = string.Empty;
    public Guid CloudBoardDocumentId { get; set; }
}
