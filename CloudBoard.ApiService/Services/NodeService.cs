using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using CloudBoard.ApiService.Services.Contracts;

namespace CloudBoard.ApiService.Services;

public class NodeService : INodeService
{
    private readonly ICloudBoardRepository _cloudBoardRepository;
    private readonly INodeRepository _nodeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<NodeService> _logger;

    public NodeService(
        ICloudBoardRepository cloudBoardRepository,
        INodeRepository nodeRepository,
        IMapper mapper,
        ILogger<NodeService> logger)
    {
        _cloudBoardRepository = cloudBoardRepository ?? throw new ArgumentNullException(nameof(cloudBoardRepository));
        _nodeRepository = nodeRepository ?? throw new ArgumentNullException(nameof(nodeRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<NodeDto?> GetNodeByIdAsync(string id)
    {
        var nodeId = Guid.Parse(id);
        try
        {
            var node = await _nodeRepository.GetNodeByIdAsync(nodeId);
            if (node == null)
            {
                _logger.LogWarning("Node with ID {NodeId} not found", nodeId);
                return null;
            }

            return _mapper.Map<NodeDto>(node);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving node with ID {NodeId}", nodeId);
            throw;
        }
    }

    public async Task<NodeDto> CreateNodeAsync(string id, NodeDto nodeDto)
    {
        var cloudboardId = Guid.Parse(id);
        try
        {
            var cloudboard = await _cloudBoardRepository.GetDocumentByIdAsync(cloudboardId);
            if (cloudboard == null)
            {
                _logger.LogWarning("CloudBoard document with ID {DocumentId} not found", cloudboardId);
                throw new ArgumentException($"CloudBoard document with ID {cloudboardId} does not exist.");
            }

            var node = _mapper.Map<Node>(nodeDto);
            node.CloudBoardDocumentId = cloudboardId;
            
            var createdNode = await _nodeRepository.AddNodeAsync(node);
            return _mapper.Map<NodeDto>(createdNode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating node {NodeName} for document {DocumentId}",
                nodeDto.Name, cloudboardId);
            throw;
        }
    }

    public async Task<NodeDto?> UpdateNodeAsync(NodeDto nodeDto)
    {
        var nodeId = Guid.Parse(nodeDto.Id);
        try
        {
            // Verify the node exists
            var nodeExists = await _nodeRepository.GetNodeByIdAsync(nodeId);
            if (nodeExists == null)
            {
                _logger.LogWarning("Node with ID {NodeId} not found for update", nodeId);
                return null;
            }

            // Map DTO to entity
            var nodeToUpdate = _mapper.Map<Node>(nodeDto);

            // Update the node
            var updatedNode = await _nodeRepository.UpdateNodeAsync(nodeToUpdate);
            if (updatedNode == null)
            {
                _logger.LogWarning("Node with ID {NodeId} could not be updated", nodeId);
                return null;
            }

            return _mapper.Map<NodeDto>(updatedNode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating node with ID {NodeId}", nodeId);
            throw;
        }
    }

    public async Task<bool> DeleteNodeAsync(string id)
    {
        var nodeId = Guid.Parse(id);
        try
        {
            return await _nodeRepository.DeleteNodeAsync(nodeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting node with ID {NodeId}", nodeId);
            throw;
        }
    }
}
