using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services.Contracts;

public interface INodeService
{
    Task<NodeDto?> GetNodeByIdAsync(string nodeId);
    Task<NodeDto> CreateNodeAsync(string cloudBoardId, NodeDto nodeDto);
    Task<NodeDto?> UpdateNodeAsync(NodeDto nodeDto);
    Task<bool> DeleteNodeAsync(string nodeId);
}
