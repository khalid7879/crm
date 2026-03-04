<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

/**
 * Models
 */

use App\Models\{User, Role, Tenant, Department};

use App\Models\Tenant\{
    Tag,
    Lead,
    Task,
    Stage,
    SocialLink,
    Organization,
    DataSource,
    DataRating,
    DataEmpSize,
    DataCategory,
    DataPriority,
    SystemCountry,
    DataContactTime,
    DataDesignation,
    DataEmailSetting,
    DataRevenue,
    Opportunity,
    Product,
    Project,
    Note,
    Contact,
    AiAnalysis,
    Attachment
};

/**
 * Services
 */

use App\Services\{
    TenantService,
    TenantSeederService
};

use App\Services\Tenant\{
    AiAnalysisModelService,
    AttachmentModelService,
    CountryService,
    TagModelService,
    TaskModelService,
    TenantRoleService,
    TenantUserService,
    TenantLeadService,
    TenantEmpSizeService,
    TenantLeadStageService,
    EmailSettingModelService,
    NoteModelService,
    OrganizationModelService,
    TenantDepartmentService,
    TenantContactTimeService,
    TenantIndustryTypeService,
    TenantLeadRatingService,
    TenantLeadSourceService,
    TenantLeadPriorityService,
    TenantDataDesignationService,
    TenantOpportunityService,
    TenantProductService,
    TenantProjectService,
    TenantRevenueService,
    TenantSocialLinkService,
    ContactModelService
};
use Faker\Factory;

/**
 * --------------------------------------------------------------------------
 * AppServiceProvider
 * --------------------------------------------------------------------------
 *
 * This service provider registers all core bindings for the application.
 * It wires up models with their respective service classes and defines
 * global macros/utilities (like Vite asset management).
 *
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        $this->app->bind(TenantService::class, fn() => new TenantService(new Tenant, new TenantSeederService()));
        $this->app->bind(OrganizationModelService::class, fn() => new OrganizationModelService(
            new Organization,
            new TenantUserService(
                new User,
                new TenantRoleService(new Role),
                new TenantDepartmentService(new Department)
            ),
            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadSourceService(new DataSource),
            new TenantLeadStageService(new Stage),
            new TenantLeadPriorityService(new DataPriority),
            new TagModelService(new Tag()),
            new TenantSocialLinkService(new SocialLink),
            new CountryService(new SystemCountry),
            new TenantDataDesignationService(new DataDesignation),
            new TenantRevenueService(new DataRevenue),
           
        ));
        $this->app->bind(TenantLeadSourceService::class, fn() => new TenantLeadSourceService(new DataSource));
        $this->app->bind(TenantIndustryTypeService::class, fn() => new TenantIndustryTypeService(new DataCategory));
        $this->app->bind(TenantLeadRatingService::class, fn() => new TenantLeadRatingService(new DataRating));
        $this->app->bind(TenantDataDesignationService::class, fn() => new TenantDataDesignationService(new DataDesignation));
        $this->app->bind(TenantLeadPriorityService::class, fn() => new TenantLeadPriorityService(new DataPriority));
        $this->app->bind(TagModelService::class, fn() => new TagModelService(new Tag));
        $this->app->bind(TenantEmpSizeService::class, fn() => new TenantEmpSizeService(new DataEmpSize));
        $this->app->bind(CountryService::class, fn() => new CountryService(new SystemCountry));
        $this->app->bind(EmailSettingModelService::class, fn() => new EmailSettingModelService(new DataEmailSetting));
        $this->app->bind(TenantRoleService::class, fn() => new TenantRoleService(new Role));
        $this->app->bind(TenantDepartmentService::class, fn() => new TenantDepartmentService(new Department));
        $this->app->bind(TenantRevenueService::class, fn() => new TenantRevenueService(new DataRevenue));
        $this->app->bind(TenantProductService::class, fn() => new TenantProductService(new Product, new TenantIndustryTypeService(new DataCategory())));
        $this->app->bind(TenantUserService::class, fn() => new TenantUserService(
            new User,
            new TenantRoleService(new Role),
            new TenantDepartmentService(new Department)
        ));

        ## Lead service
        $this->app->bind(TenantLeadService::class, fn() => new TenantLeadService(
            new Lead,
            new TenantLeadStageService(new Stage),
            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadSourceService(new DataSource),
            new TenantLeadRatingService(new DataRating),
            new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
            new TenantDataDesignationService(new DataDesignation),
            new TenantSocialLinkService(new SocialLink),
            new OrganizationModelService(
                new Organization,
                new TenantUserService(
                    new User,
                    new TenantRoleService(new Role),
                    new TenantDepartmentService(new Department)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag()),
                new TenantSocialLinkService(new SocialLink),
                new CountryService(new SystemCountry),
                new TenantDataDesignationService(new DataDesignation),
                new TenantRevenueService(new DataRevenue)

            ),
            new TenantLeadPriorityService(new DataPriority),
            new TagModelService(new Tag),
            new TenantEmpSizeService(new DataEmpSize),
            new TenantContactTimeService(new DataContactTime),
            new TenantRevenueService(new DataRevenue()),
            new CountryService(new SystemCountry()),
        ));

        ## Task service
        $this->app->bind(TaskModelService::class, fn() => new TaskModelService(
            new Task,
            new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
            new TenantLeadService(
                new Lead,
                new TenantLeadStageService(new Stage),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadRatingService(new DataRating),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TenantDataDesignationService(new DataDesignation),
                new TenantSocialLinkService(new SocialLink),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag),
                new TenantEmpSizeService(new DataEmpSize),
                new TenantContactTimeService(new DataContactTime),
                new TenantRevenueService(new DataRevenue()),
                new CountryService(new SystemCountry()),
            ),
            new TenantLeadStageService(new Stage),

            new OrganizationModelService(
                new Organization,
                new TenantUserService(
                    new User,
                    new TenantRoleService(new Role),
                    new TenantDepartmentService(new Department)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag()),
                new TenantSocialLinkService(new SocialLink),
                new CountryService(new SystemCountry),
                new TenantDataDesignationService(new DataDesignation),
                new TenantRevenueService(new DataRevenue)
            ),
            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadPriorityService(new DataPriority),
            new TenantOpportunityService(
                new Opportunity,
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantProductService(new Product, new TenantIndustryTypeService(new DataCategory)),
                new TenantLeadSourceService(new DataSource()),
                new TenantLeadService(
                    new Lead,
                    new TenantLeadStageService(new Stage),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadRatingService(new DataRating),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantSocialLinkService(new SocialLink),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag),
                    new TenantEmpSizeService(new DataEmpSize),
                    new TenantContactTimeService(new DataContactTime),
                    new TenantRevenueService(new DataRevenue()),
                    new CountryService(new SystemCountry()),
                ),
                new TenantLeadPriorityService(new DataPriority),
                new TenantRevenueService(new DataRevenue),
                new CountryService(new SystemCountry),
                new TenantProjectService(
                    new Project(),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TagModelService(new Tag()),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority()),
                    new TenantSocialLinkService(new SocialLink),
                    new TenantDataDesignationService(new DataDesignation),
                    new CountryService(new SystemCountry),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadSourceService(new DataSource),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantDataDesignationService(new DataDesignation),
                new TenantSocialLinkService(new SocialLink)
            ),
            new TenantProjectService(
                new Project(),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TagModelService(new Tag()),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority()),
                new TenantSocialLinkService(new SocialLink),
                new TenantDataDesignationService(new DataDesignation),
                new CountryService(new SystemCountry),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadSourceService(new DataSource),
                new TenantRevenueService(new DataRevenue),
            ),
            new ContactModelService(
                new Contact,
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TagModelService(new Tag),
                new TenantSocialLinkService(new SocialLink),
                new TenantDataDesignationService(new DataDesignation),
                new CountryService(new SystemCountry),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadPriorityService(new DataPriority),
               
            ),

        ));

        ## Opportunity model service
        $this->app->bind(TenantOpportunityService::class, fn() => new TenantOpportunityService(
            new Opportunity,
            new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
            new OrganizationModelService(
                new Organization,
                new TenantUserService(
                    new User,
                    new TenantRoleService(new Role),
                    new TenantDepartmentService(new Department)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag()),
                new TenantSocialLinkService(new SocialLink),
                new CountryService(new SystemCountry),
                new TenantDataDesignationService(new DataDesignation),
                new TenantRevenueService(new DataRevenue)

            ),

            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadStageService(new Stage),
            new TenantProductService(new Product, new TenantIndustryTypeService(new DataCategory)),
            new TenantLeadSourceService(new DataSource()),
            new TenantLeadService(
                new Lead,
                new TenantLeadStageService(new Stage),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadRatingService(new DataRating),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TenantDataDesignationService(new DataDesignation),
                new TenantSocialLinkService(new SocialLink),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag),
                new TenantEmpSizeService(new DataEmpSize),
                new TenantContactTimeService(new DataContactTime),
                new TenantRevenueService(new DataRevenue()),
                new CountryService(new SystemCountry()),
                new TenantDataDesignationService(new DataDesignation)
            ),
            new TenantLeadPriorityService(new DataPriority),
            new TenantRevenueService(new DataRevenue),
            new CountryService(new SystemCountry),
            new TenantProjectService(
                new Project(),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TagModelService(new Tag()),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority()),
                new TenantSocialLinkService(new SocialLink),
                new TenantDataDesignationService(new DataDesignation),
                new CountryService(new SystemCountry),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadSourceService(new DataSource),
                new TenantRevenueService(new DataRevenue)
            ),
            new TenantDataDesignationService(new DataDesignation),
            new TenantSocialLinkService(new SocialLink)
        ));
        ## Project model service
        $this->app->bind(TenantProjectService::class, fn() => new TenantProjectService(
            new Project(),
            new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
            new TagModelService(new Tag()),
            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadStageService(new Stage),
            new TenantLeadPriorityService(new DataPriority()),
            new TenantSocialLinkService(new SocialLink),
            new TenantDataDesignationService(new DataDesignation),
            new CountryService(new SystemCountry),
            new OrganizationModelService(
                new Organization,
                new TenantUserService(
                    new User,
                    new TenantRoleService(new Role),
                    new TenantDepartmentService(new Department)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag()),
                new TenantSocialLinkService(new SocialLink),
                new CountryService(new SystemCountry),
                new TenantDataDesignationService(new DataDesignation),
                new TenantRevenueService(new DataRevenue)
            ),
            new TenantLeadSourceService(new DataSource),
            new TenantRevenueService(new DataRevenue)
        ));

        ## Note model service
        $this->app->bind(NoteModelService::class, fn() => new NoteModelService(
            new Note,
            new TenantLeadService(
                new Lead,
                new TenantLeadStageService(new Stage),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadRatingService(new DataRating),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TenantDataDesignationService(new DataDesignation),
                new TenantSocialLinkService(new SocialLink),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag),
                new TenantEmpSizeService(new DataEmpSize),
                new TenantContactTimeService(new DataContactTime),
                new TenantRevenueService(new DataRevenue()),
                new CountryService(new SystemCountry()),
            ),
            new TenantOpportunityService(
                new Opportunity,
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantProductService(new Product, new TenantIndustryTypeService(new DataCategory)),
                new TenantLeadSourceService(new DataSource()),
                new TenantLeadService(
                    new Lead,
                    new TenantLeadStageService(new Stage),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadRatingService(new DataRating),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantSocialLinkService(new SocialLink),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag),
                    new TenantEmpSizeService(new DataEmpSize),
                    new TenantContactTimeService(new DataContactTime),
                    new TenantRevenueService(new DataRevenue()),
                    new CountryService(new SystemCountry()),
                ),
                new TenantLeadPriorityService(new DataPriority),
                new TenantRevenueService(new DataRevenue()),
                new CountryService(new SystemCountry()),
                new TenantProjectService(
                    new Project(),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TagModelService(new Tag()),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority()),
                    new TenantSocialLinkService(new SocialLink),
                    new TenantDataDesignationService(new DataDesignation),
                    new CountryService(new SystemCountry),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadSourceService(new DataSource),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantDataDesignationService(new DataDesignation),
                new TenantSocialLinkService(new SocialLink)
            ),
            new TenantProjectService(
                new Project(),
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TagModelService(new Tag()),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority()),
                new TenantSocialLinkService(new SocialLink),
                new TenantDataDesignationService(new DataDesignation),
                new CountryService(new SystemCountry),
                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantLeadSourceService(new DataSource),
                new TenantRevenueService(new DataRevenue),
            ),
            new OrganizationModelService(
                new Organization,
                new TenantUserService(
                    new User,
                    new TenantRoleService(new Role),
                    new TenantDepartmentService(new Department)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadStageService(new Stage),
                new TenantLeadPriorityService(new DataPriority),
                new TagModelService(new Tag()),
                new TenantSocialLinkService(new SocialLink),
                new CountryService(new SystemCountry),
                new TenantDataDesignationService(new DataDesignation),
                new TenantRevenueService(new DataRevenue)
            ),
            new ContactModelService(
                new Contact,
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TagModelService(new Tag),
                new TenantSocialLinkService(new SocialLink),
                new TenantDataDesignationService(new DataDesignation),
                new CountryService(new SystemCountry),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadStageService(new Stage),
                new TenantLeadSourceService(new DataSource),
                new TenantLeadPriorityService(new DataPriority),
               
            ),
            new TaskModelService(
                new Task,
                new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                new TenantLeadService(
                    new Lead,
                    new TenantLeadStageService(new Stage),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadRatingService(new DataRating),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantSocialLinkService(new SocialLink),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag),
                    new TenantEmpSizeService(new DataEmpSize),
                    new TenantContactTimeService(new DataContactTime),
                    new TenantRevenueService(new DataRevenue()),
                    new CountryService(new SystemCountry()),
                ),
                new TenantLeadStageService(new Stage),

                new OrganizationModelService(
                    new Organization,
                    new TenantUserService(
                        new User,
                        new TenantRoleService(new Role),
                        new TenantDepartmentService(new Department)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority),
                    new TagModelService(new Tag()),
                    new TenantSocialLinkService(new SocialLink),
                    new CountryService(new SystemCountry),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantRevenueService(new DataRevenue)
                ),
                new TenantIndustryTypeService(new DataCategory),
                new TenantLeadPriorityService(new DataPriority),
                new TenantOpportunityService(
                    new Opportunity,
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadStageService(new Stage),
                    new TenantProductService(new Product, new TenantIndustryTypeService(new DataCategory)),
                    new TenantLeadSourceService(new DataSource()),
                    new TenantLeadService(
                        new Lead,
                        new TenantLeadStageService(new Stage),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadRatingService(new DataRating),
                        new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantSocialLinkService(new SocialLink),
                        new OrganizationModelService(
                            new Organization,
                            new TenantUserService(
                                new User,
                                new TenantRoleService(new Role),
                                new TenantDepartmentService(new Department)
                            ),
                            new TenantIndustryTypeService(new DataCategory),
                            new TenantLeadSourceService(new DataSource),
                            new TenantLeadStageService(new Stage),
                            new TenantLeadPriorityService(new DataPriority),
                            new TagModelService(new Tag()),
                            new TenantSocialLinkService(new SocialLink),
                            new CountryService(new SystemCountry),
                            new TenantDataDesignationService(new DataDesignation),
                            new TenantRevenueService(new DataRevenue)
                        ),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag),
                        new TenantEmpSizeService(new DataEmpSize),
                        new TenantContactTimeService(new DataContactTime),
                        new TenantRevenueService(new DataRevenue()),
                        new CountryService(new SystemCountry()),
                    ),
                    new TenantLeadPriorityService(new DataPriority),
                    new TenantRevenueService(new DataRevenue),
                    new CountryService(new SystemCountry),
                    new TenantProjectService(
                        new Project(),
                        new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                        new TagModelService(new Tag()),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority()),
                        new TenantSocialLinkService(new SocialLink),
                        new TenantDataDesignationService(new DataDesignation),
                        new CountryService(new SystemCountry),
                        new OrganizationModelService(
                            new Organization,
                            new TenantUserService(
                                new User,
                                new TenantRoleService(new Role),
                                new TenantDepartmentService(new Department)
                            ),
                            new TenantIndustryTypeService(new DataCategory),
                            new TenantLeadSourceService(new DataSource),
                            new TenantLeadStageService(new Stage),
                            new TenantLeadPriorityService(new DataPriority),
                            new TagModelService(new Tag()),
                            new TenantSocialLinkService(new SocialLink),
                            new CountryService(new SystemCountry),
                            new TenantDataDesignationService(new DataDesignation),
                            new TenantRevenueService(new DataRevenue)
                        ),
                        new TenantLeadSourceService(new DataSource),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantDataDesignationService(new DataDesignation),
                    new TenantSocialLinkService(new SocialLink)
                ),
                new TenantProjectService(
                    new Project(),
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TagModelService(new Tag()),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadPriorityService(new DataPriority()),
                    new TenantSocialLinkService(new SocialLink),
                    new TenantDataDesignationService(new DataDesignation),
                    new CountryService(new SystemCountry),
                    new OrganizationModelService(
                        new Organization,
                        new TenantUserService(
                            new User,
                            new TenantRoleService(new Role),
                            new TenantDepartmentService(new Department)
                        ),
                        new TenantIndustryTypeService(new DataCategory),
                        new TenantLeadSourceService(new DataSource),
                        new TenantLeadStageService(new Stage),
                        new TenantLeadPriorityService(new DataPriority),
                        new TagModelService(new Tag()),
                        new TenantSocialLinkService(new SocialLink),
                        new CountryService(new SystemCountry),
                        new TenantDataDesignationService(new DataDesignation),
                        new TenantRevenueService(new DataRevenue)
                    ),
                    new TenantLeadSourceService(new DataSource),
                    new TenantRevenueService(new DataRevenue)
                ),
                new ContactModelService(
                    new Contact,
                    new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
                    new TagModelService(new Tag),
                    new TenantSocialLinkService(new SocialLink),
                    new TenantDataDesignationService(new DataDesignation),
                    new CountryService(new SystemCountry),
                    new TenantIndustryTypeService(new DataCategory),
                    new TenantLeadStageService(new Stage),
                    new TenantLeadSourceService(new DataSource),
                    new TenantLeadPriorityService(new DataPriority),
                  

                ),

            )
        ));

        ## Contact model service
        $this->app->bind(ContactModelService::class, fn() => new ContactModelService(
            new Contact,
            new TenantUserService(new User, new TenantRoleService(new Role), new TenantDepartmentService(new Department)),
            new TagModelService(new Tag),
            new TenantSocialLinkService(new SocialLink),
            new TenantDataDesignationService(new DataDesignation),
            new CountryService(new SystemCountry),
            new TenantIndustryTypeService(new DataCategory),
            new TenantLeadStageService(new Stage),
            new TenantLeadSourceService(new DataSource),
            new TenantLeadPriorityService(new DataPriority),
        ));

        ## Contact model service
        $this->app->bind(AiAnalysisModelService::class, fn() => new AiAnalysisModelService(
            new AiAnalysis
        ));

        ## Attachment model service
        $this->app->bind(AttachmentModelService::class, fn() => new AttachmentModelService(new Attachment()));
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        ## Define Vite macro for image assets
        Vite::macro('imageRoot', fn($asset) => Vite::asset("resources/images/{$asset}"));
    }
}
