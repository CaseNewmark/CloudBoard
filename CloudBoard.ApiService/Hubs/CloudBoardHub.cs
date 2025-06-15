using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace CloudBoard.ApiService.Hubs;

[Authorize]
public class CloudBoardHub : Hub
{
    private const string CLOUDBOARD_GROUP_PREFIX = "CloudBoard_";

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var userName = GetUserName();
        
        Console.WriteLine($"User {userName} ({userId}) connected to CloudBoard hub");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        
        Console.WriteLine($"User {userName} ({userId}) disconnected from CloudBoard hub");
        await base.OnDisconnectedAsync(exception);
    }

    // Join a specific CloudBoard room
    public async Task JoinCloudBoard(string cloudBoardId)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        
        // Notify others in the group that a user joined
        await Clients.Group(groupName).SendAsync("UserJoined", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            JoinedAt = DateTime.UtcNow
        });

        Console.WriteLine($"User {userName} joined CloudBoard {cloudBoardId}");
    }

    // Leave a specific CloudBoard room
    public async Task LeaveCloudBoard(string cloudBoardId)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        
        // Notify others in the group that a user left
        await Clients.Group(groupName).SendAsync("UserLeft", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            LeftAt = DateTime.UtcNow
        });

        Console.WriteLine($"User {userName} left CloudBoard {cloudBoardId}");
    }

    // Send a message to all users in a CloudBoard
    public async Task SendMessageToCloudBoard(string cloudBoardId, string message)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("MessageReceived", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    // Broadcast node position changes
    public async Task UpdateNodePosition(string cloudBoardId, string nodeId, double x, double y)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("NodePositionUpdated", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            NodeId = nodeId,
            X = x,
            Y = y,
            Timestamp = DateTime.UtcNow
        });
    }

    // Broadcast node creation
    public async Task CreateNode(string cloudBoardId, object nodeData)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("NodeCreated", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            NodeData = nodeData,
            Timestamp = DateTime.UtcNow
        });
    }

    // Broadcast node deletion
    public async Task DeleteNode(string cloudBoardId, string nodeId)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("NodeDeleted", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            NodeId = nodeId,
            Timestamp = DateTime.UtcNow
        });
    }

    // Broadcast connection creation
    public async Task CreateConnection(string cloudBoardId, object connectionData)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("ConnectionCreated", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            ConnectionData = connectionData,
            Timestamp = DateTime.UtcNow
        });
    }

    // Broadcast user cursor position for collaboration
    public async Task UpdateCursorPosition(string cloudBoardId, double x, double y)
    {
        var userId = GetUserId();
        var userName = GetUserName();
        var groupName = $"{CLOUDBOARD_GROUP_PREFIX}{cloudBoardId}";

        await Clients.Group(groupName).SendAsync("CursorPositionUpdated", new
        {
            UserId = userId,
            UserName = userName,
            CloudBoardId = cloudBoardId,
            X = x,
            Y = y,
            Timestamp = DateTime.UtcNow
        });
    }

    // Helper methods
    private string GetUserId()
    {
        return Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
               ?? Context.User?.FindFirst("sub")?.Value 
               ?? "unknown";
    }

    private string GetUserName()
    {
        return Context.User?.FindFirst(ClaimTypes.Name)?.Value 
               ?? Context.User?.FindFirst("preferred_username")?.Value 
               ?? Context.User?.FindFirst("name")?.Value 
               ?? "Unknown User";
    }
}