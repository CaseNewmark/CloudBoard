namespace CloudBoard.ApiService.Dtos;

public class BoardImageDto
{
    public string Id { get; set; } = string.Empty;
    /// <summary>Relative URL to fetch the image with (requires the same auth as the rest of the API).</summary>
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
