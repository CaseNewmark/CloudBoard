using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudBoard.ApiService.Data;

public class Node
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public NodePosition Position { get; set; } = new NodePosition();
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoardDocument CloudBoardDocument { get; set; } = null!;
}

public class NodePosition
{
    public int X { get; set; }
    public int Y { get; set; }
}
