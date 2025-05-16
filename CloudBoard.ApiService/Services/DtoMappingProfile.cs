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
        CreateMap<Node, NodeDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
        CreateMap<NodeDto, Node>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)));

        // Map Connector to ConnectorDto and vice versa
        CreateMap<Connector, ConnectorDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.FromNodeId, opt => opt.MapFrom(src => src.FromNodeId.ToString()))
            .ForMember(dest => dest.ToNodeId, opt => opt.MapFrom(src => src.ToNodeId.ToString()));
        CreateMap<ConnectorDto, Connector>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
            .ForMember(dest => dest.FromNodeId, opt => opt.MapFrom(src => Guid.Parse(src.FromNodeId)))
            .ForMember(dest => dest.ToNodeId, opt => opt.MapFrom(src => Guid.Parse(src.ToNodeId)));

        // Map CloudboardDocument to CloudboardDocumentDto and vice versa
        CreateMap<CreateCloudBoardDocumentDto, CloudBoardDocument>();
        CreateMap<CloudBoardDocument, CloudBoardDocumentDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
        CreateMap<CloudBoardDocumentDto, CloudBoardDocument>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)));
    }
}

