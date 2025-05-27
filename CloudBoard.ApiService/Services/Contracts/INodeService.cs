using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface INodeService
{
    Task<NodeDto?> GetNodeByIdAsync(Guid nodeId);
    Task<NodeDto> CreateNodeAsync(CreateNodeDto createNodeDto);
    Task<NodeDto?> UpdateNodeAsync(Guid nodeId, NodeDto nodeDto);
    Task<bool> DeleteNodeAsync(Guid nodeId);
}
