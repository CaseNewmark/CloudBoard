using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface INodeRepository
{
    Task<Node?> GetNodeByIdAsync(Guid nodeId);
    Task<Node> AddNodeAsync(Node node);
    Task<Node?> UpdateNodeAsync(Node node);
    Task<bool> DeleteNodeAsync(Guid nodeId);
}