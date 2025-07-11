using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;
using System;

namespace CloudBoard.ApiService.Services;

public class DtoMappingProfile : Profile
{
    public DtoMappingProfile()
    {
        // Map NodePosition to NodePositionDto and vice versa
        CreateMap<NodePosition, NodePositionDto>().ReverseMap();
        
        // Map Connector to ConnectorDto and vice versa
        CreateMap<Connector, ConnectorDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position.ToString().ToLower()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            
        CreateMap<ConnectorDto, Connector>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.Position, opt => opt.MapFrom(src => Enum.Parse<ConnectorPosition>(src.Position, true)))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<ConnectorType>(src.Type, true)));
                
        // Map Node to NodeDto and vice versa
        CreateMap<Node, NodeDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            
        CreateMap<NodeDto, Node>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<NodeType>(src.Type, true)));
                
        // Map Connection to ConnectionDto and vice versa
        CreateMap<Connection, ConnectionDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.FromConnectorId, opt => opt.MapFrom(src => src.FromConnectorId.ToString()))
            .ForMember(dest => dest.ToConnectorId, opt => opt.MapFrom(src => src.ToConnectorId.ToString()));
            
        CreateMap<ConnectionDto, Connection>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.FromConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.FromConnectorId)))
            .ForMember(dest => dest.ToConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.ToConnectorId)));

        // Map CloudboardDocument to CloudboardDocumentDto and vice versa
        CreateMap<Data.CloudBoard, CloudBoardDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
            
        CreateMap<CloudBoardDto, Data.CloudBoard>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)));
    }
}

