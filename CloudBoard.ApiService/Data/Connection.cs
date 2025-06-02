using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudBoard.ApiService.Data;

public class Connection
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public Guid FromConnectorId { get; set; }
    public Guid ToConnectorId { get; set; }
    public Guid CloudBoardDocumentId { get; set; }
    public CloudBoard CloudBoardDocument { get; set; } = null!;
}
