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
          // Map Connector to ConnectorDto and vice versa
        CreateMap<Connector, ConnectorDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position.ToString().ToLower()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
        CreateMap<ConnectorDto, Connector>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
            .ForMember(dest => dest.Position, opt => opt.MapFrom(src => Enum.Parse<ConnectorPosition>(src.Position, true)))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<ConnectorType>(src.Type, true)));
        CreateMap<CreateConnectorDto, Connector>()
            .ForMember(dest => dest.Position, opt => opt.MapFrom(src => Enum.Parse<ConnectorPosition>(src.Position, true)))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<ConnectorType>(src.Type, true)));        // Map Node to NodeDto and vice versa
        CreateMap<Node, NodeDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => ConvertNodeTypeToString(src.Type)));
        CreateMap<NodeDto, Node>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => ParseNodeType(src.Type)));
        CreateMap<CreateNodeDto, Node>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => ParseNodeType(src.Type)));// Map Connection to ConnectionDto and vice versa
        CreateMap<Connection, ConnectionDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.FromConnectorId, opt => opt.MapFrom(src => src.FromConnectorId.ToString()))
            .ForMember(dest => dest.ToConnectorId, opt => opt.MapFrom(src => src.ToConnectorId.ToString()));
        CreateMap<ConnectionDto, Connection>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)))            
            .ForMember(dest => dest.FromConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.FromConnectorId)))
            .ForMember(dest => dest.ToConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.ToConnectorId)));
        CreateMap<CreateConnectionDto, Connection>()
            .ForMember(dest => dest.FromConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.FromConnectorId)))
            .ForMember(dest => dest.ToConnectorId, opt => opt.MapFrom(src => Guid.Parse(src.ToConnectorId)));

        // Map CloudboardDocument to CloudboardDocumentDto and vice versa
        CreateMap<CreateCloudBoardDocumentDto, CloudBoardDocument>();
        CreateMap<CloudBoardDocument, CloudBoardDocumentDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
        CreateMap<CloudBoardDocumentDto, CloudBoardDocument>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.Parse(src.Id)));
    }    private static NodeType ParseNodeType(string typeString)
    {
        return typeString?.ToLower() switch
        {
            "note" => NodeType.Note,
            "card" => NodeType.Card,
            "link-collection" => NodeType.LinkCollection,
            "image" => NodeType.ImageNode,
            "code-block" => NodeType.CodeBlock,
            _ => NodeType.Note
        };
    }

    private static string ConvertNodeTypeToString(NodeType nodeType)
    {
        return nodeType switch
        {
            NodeType.Note => "note",
            NodeType.Card => "card",
            NodeType.LinkCollection => "link-collection",
            NodeType.ImageNode => "image",
            NodeType.CodeBlock => "code-block",
            _ => "note"
        };
    }
}

