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

        // Map SortingApplication to SortingApplicationDto and vice versa
        CreateMap<SortingApplication, SortingApplicationDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
            
        CreateMap<SortingApplicationDto, SortingApplication>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.ProcessSteps, opt => opt.Ignore()); // Handle separately to avoid circular references

        // Map ProcessStep to ProcessStepDto and vice versa
        CreateMap<ProcessStep, ProcessStepDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.StepType, opt => opt.MapFrom(src => src.StepType.ToString()));
            
        CreateMap<ProcessStepDto, ProcessStep>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.StepType, opt => opt.MapFrom(src => Enum.Parse<ProcessStepType>(src.StepType, true)))
            .ForMember(dest => dest.SortingApplicationId, opt => opt.Ignore())
            .ForMember(dest => dest.SortingApplication, opt => opt.Ignore())
            .ForMember(dest => dest.MarketSegmentId, opt => opt.Ignore())
            .ForMember(dest => dest.TargetMaterials, opt => opt.Ignore()); // Handle separately

        // Map MarketSegment to MarketSegmentDto and vice versa
        CreateMap<MarketSegment, MarketSegmentDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.BusinessUnit, opt => opt.MapFrom(src => src.BusinessUnit.ToString()));
            
        CreateMap<MarketSegmentDto, MarketSegment>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.BusinessUnit, opt => opt.MapFrom(src => Enum.Parse<BusinessUnit>(src.BusinessUnit, true)))
            .ForMember(dest => dest.ProcessSteps, opt => opt.Ignore())
            .ForMember(dest => dest.TargetMaterials, opt => opt.Ignore());

        // Map TargetMaterial to TargetMaterialDto and vice versa
        CreateMap<TargetMaterial, TargetMaterialDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
            .ForMember(dest => dest.Form, opt => opt.MapFrom(src => src.Form.ToString()));
            
        CreateMap<TargetMaterialDto, TargetMaterial>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => Enum.Parse<MaterialCategory>(src.Category, true)))
            .ForMember(dest => dest.Form, opt => opt.MapFrom(src => Enum.Parse<MaterialForm>(src.Form, true)))
            .ForMember(dest => dest.ProcessSteps, opt => opt.Ignore())
            .ForMember(dest => dest.MarketSegments, opt => opt.Ignore());
    }
}

