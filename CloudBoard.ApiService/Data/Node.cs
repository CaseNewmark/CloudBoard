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
    public List<Connector> Connectors { get; set; } = new List<Connector>();
    public NodeType Type { get; set; } = NodeType.Note;
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoardDocument CloudBoardDocument { get; set; } = null!;
}

public class NodePosition
{
    public float X { get; set; }
    public float Y { get; set; }
}
