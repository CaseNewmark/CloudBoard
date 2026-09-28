using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using Microsoft.EntityFrameworkCore;

namespace CloudBoard.ApiService.Services;

public interface IBoardImageService
{
    /// <summary>Stores an image on a board. Returns null if the bytes aren't a supported image format.</summary>
    Task<BoardImageDto?> AddAsync(Guid boardId, byte[] data, string userId);
    Task<BoardImage?> GetAsync(Guid imageId);
    /// <summary>Copies an image to another board (e.g. when nodes are pasted across boards).</summary>
    Task<BoardImageDto?> CopyAsync(Guid imageId, Guid targetBoardId, string userId);
}

public class BoardImageService : IBoardImageService
{
    public const long MaxImageBytes = 5 * 1024 * 1024;

    private readonly CloudBoardDbContext _dbContext;

    public BoardImageService(CloudBoardDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BoardImageDto?> AddAsync(Guid boardId, byte[] data, string userId)
    {
        var contentType = DetectImageType(data);
        if (contentType is null) return null;

        var image = new BoardImage
        {
            Id = Guid.NewGuid(),
            CloudBoardDocumentId = boardId,
            ContentType = contentType,
            Data = data,
            SizeBytes = data.LongLength,
            CreatedBy = userId,
        };
        _dbContext.BoardImages.Add(image);
        await _dbContext.SaveChangesAsync();
        return ToDto(image);
    }

    public Task<BoardImage?> GetAsync(Guid imageId) =>
        _dbContext.BoardImages.AsNoTracking().FirstOrDefaultAsync(i => i.Id == imageId);

    public async Task<BoardImageDto?> CopyAsync(Guid imageId, Guid targetBoardId, string userId)
    {
        var source = await GetAsync(imageId);
        if (source is null) return null;
        if (source.CloudBoardDocumentId == targetBoardId) return ToDto(source);
        return await AddAsync(targetBoardId, source.Data, userId);
    }

    public static BoardImageDto ToDto(BoardImage image) => new()
    {
        Id = image.Id.ToString(),
        Url = $"/api/images/{image.Id}",
        ContentType = image.ContentType,
        Size = image.SizeBytes,
    };

    /// <summary>
    /// Identifies the format from the file's leading bytes rather than trusting the upload's
    /// declared type. SVG is deliberately not accepted: it can carry scripts.
    /// </summary>
    public static string? DetectImageType(ReadOnlySpan<byte> data)
    {
        if (data.StartsWith(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return "image/png";
        if (data.StartsWith(new byte[] { 0xFF, 0xD8, 0xFF })) return "image/jpeg";
        if (data.StartsWith("GIF87a"u8) || data.StartsWith("GIF89a"u8)) return "image/gif";
        if (data.Length >= 12 && data[..4].SequenceEqual("RIFF"u8) && data[8..12].SequenceEqual("WEBP"u8)) return "image/webp";
        return null;
    }
}
