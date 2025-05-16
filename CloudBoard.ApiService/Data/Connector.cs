using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudBoard.ApiService.Data;

public class Connector
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public Guid FromNodeId { get; set; }
    public Guid ToNodeId { get; set; }
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoardDocument CloudBoardDocument { get; set; } = null!;
}
