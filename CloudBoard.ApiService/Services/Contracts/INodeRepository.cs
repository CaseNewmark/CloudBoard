using CloudBoard.ApiService.Data;

namespace CloudBoard.ApiService.Services.Contracts;

public interface INodeRepository : IRepository<Node, Guid>
{
    // Specific methods for Node operations beyond the generic ones
    Task<Node?> GetNodeByIdAsync(Guid nodeId);
    Task<Node> AddNodeAsync(Node node);
    Task<Node?> UpdateNodeAsync(Node node);
    Task<bool> DeleteNodeAsync(Guid nodeId);
    Task<IEnumerable<Node>> GetNodesByCloudBoardIdAsync(Guid cloudBoardId);
}