using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudBoard.ApiService.Data;

public enum ConnectorPosition
{
    Top,
    Bottom,
    Left,
    Right
}

public enum ConnectorType
{
    In,
    Out,
    InOut
}

public class Connector
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public Guid NodeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ConnectorPosition Position { get; set; }
    public ConnectorType Type { get; set; }
    public Node Node { get; set; } = null!;
}
