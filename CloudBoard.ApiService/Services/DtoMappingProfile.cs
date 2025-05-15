using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services;

public class DtoMappingProfile : Profile
{
    public DtoMappingProfile()
    {
        // Map NodePosition to NodePositionDto and vice versa
        CreateMap<NodePosition, NodePositionDto>().ReverseMap();

        // Map Node to NodeDto and vice versa
        CreateMap<Node, NodeDto>().ReverseMap();

        // Map Connector to ConnectorDto and vice versa
        CreateMap<Connector, ConnectorDto>().ReverseMap();

        // Map CloudboardDocument to CloudboardDocumentDto and vice versa
        CreateMap<CreateCloudBoardDocumentDto, CloudBoardDocument>();
        CreateMap<CloudBoardDocument, CloudBoardDocumentDto>().ReverseMap();
    }
}

