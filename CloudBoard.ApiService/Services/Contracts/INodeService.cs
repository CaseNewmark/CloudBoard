using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface INodeService
{
    Task<NodeDto?> GetNodeByIdAsync(Guid nodeId);
    Task<NodeDto> CreateNodeAsync(Guid cloudBoardId, NodeDto nodeDto);
    Task<NodeDto?> UpdateNodeAsync(NodeDto nodeDto);
    Task<bool> DeleteNodeAsync(Guid nodeId);
}
