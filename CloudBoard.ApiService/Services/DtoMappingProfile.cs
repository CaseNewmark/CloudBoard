using AutoMapper;
using CloudBoard.ApiService.Data;
using CloudBoard.ApiService.Dtos;

namespace CloudBoard.ApiService.Services;

public class DtoMappingProfile : Profile
{
    public DtoMappingProfile()
    {
        // Map FloorPlan to FloorPlanDto and vice versa
        CreateMap<CreateCloudBoardDocumentDto, CloudBoardDocument>();

        // Map Section to SectionDto and vice versa (assuming SectionDto and Section exist)
        CreateMap<CloudBoardDocument, CloudBoardDocumentDto>();
    }
}

