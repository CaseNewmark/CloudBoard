using CloudBoard.ApiService.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CloudBoard.ApiService.Services;

public interface ICloudBoardHubService
{
    Task NotifyCloudBoardUpdated(string cloudBoardId, object data, string userId);
    Task NotifyNodeCreated(string cloudBoardId, object nodeData, string userId);
    Task NotifyNodeUpdated(string cloudBoardId, object nodeData, string userId);
    Task NotifyNodeDeleted(string cloudBoardId, string nodeId, string userId);
    Task NotifyConnectionCreated(string cloudBoardId, object connectionData, string userId);
    Task NotifyConnectionDeleted(string cloudBoardId, string connectionId, string userId);
}

public class CloudBoardHubService : ICloudBoardHubService
{
    private readonly IHubContext<CloudBoardHub> _hubContext;
    private const string CLOUDBOARD_GROUP_PREFIX = "CloudBoard_";

    public CloudBoardHubService(IHubContext<CloudBoardHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyCloudBoardUpdated(string cloudBoardId, object data, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("CloudBoardUpdated", new
        {
            CloudBoardId = cloudBoardId,
            UpdatedBy = userId,
            Data = data,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyNodeCreated(string cloudBoardId, object nodeData, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("NodeCreated", new
        {
            CloudBoardId = cloudBoardId,
            CreatedBy = userId,
            NodeData = nodeData,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyNodeUpdated(string cloudBoardId, object nodeData, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("NodeUpdated", new
        {
            CloudBoardId = cloudBoardId,
            UpdatedBy = userId,
            NodeData = nodeData,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyNodeDeleted(string cloudBoardId, string nodeId, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("NodeDeleted", new
        {
            CloudBoardId = cloudBoardId,
            DeletedBy = userId,
            NodeId = nodeId,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyConnectionCreated(string cloudBoardId, object connectionData, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("ConnectionCreated", new
        {
            CloudBoardId = cloudBoardId,
            CreatedBy = userId,
            ConnectionData = connectionData,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyConnectionDeleted(string cloudBoardId, string connectionId, string userId)
    {
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";
        await _hubContext.Clients.Group(groupName).SendAsync("ConnectionDeleted", new
        {
            CloudBoardId = cloudBoardId,
            DeletedBy = userId,
            ConnectionId = connectionId,
            Timestamp = DateTime.UtcNow
        });
    }
}