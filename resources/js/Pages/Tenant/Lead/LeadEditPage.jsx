import React, { useEffect, useMemo, useCallback } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { LeadListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import TwGeneralFormInput from "@/Components/Tenant/Forms/TwGeneralFormInput";
import TwGeneralFormSelect from "@/Components/Tenant/Forms/TwGeneralFormSelect";
import TwGeneralFormTextarea from "@/Components/Tenant/Forms/TwGeneralFormTextarea";
import TwGeneralFormRadioGroup from "@/Components/Tenant/Forms/TwGeneralFormRadioGroup";
import TwGeneralFormDatalist from "@/Components/Tenant/Forms/TwGeneralFormDatalist";
import RsCreatableComponent from "@/Components/Tenant/Forms/RsCreatableComponent";
import RsSelectableComponent from "@/Components/Tenant/Forms/RsSelectableComponent";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { swalToast } from "@/utils/toast";
import { useLeadFormInputs } from "@/hooks/useLeadFormInputs";
import { LeadSchema, ValidationAttributes } from "@/schemas/tenants/leadSchema";
import { joiValidation } from "@/utils/joiValidation";
import StageStepsComponent from "@/Components/Tenant/Addons/StageStepsComponent";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import OverviewComponent from "@/Components/Tenant/PageComponent/OverviewComponent";
import AiSummaryComponent from "@/Components/Tenant/PageComponent/AiSummaryComponent";
import RelativesSectionComponent from "@/Components/Tenant/PageComponent/RelativesSectionComponent";

/**
 * mapModelToFormData
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
function mapModelToFormData(model, defaults) {
    if (!model) return defaults;

    return {
        ...defaults,
        id: model.id,
        owner_id: model.owner_id ?? defaults.owner_id,
        associates: model.get_associates ?? [],
        salutation: model.salutation ?? defaults.salutation,
        first_name: model.first_name ?? "",
        last_name: model.last_name ?? "",
        nickname: model.nickname ?? "",
        data_designation_id: model.get_designation?.id ?? "",
        organization: model.get_organization?.name ?? "",
        stage_id: model.get_last_stage?.id ?? defaults.stage_id,
        email: model.email ?? "",
        telephone: model.telephone ?? "",
        mobile_phone: model.mobile_phone ?? "",
        alt_mobile_phone: model.alt_mobile_phone ?? "",
        fax: model.fax ?? "",
        website: model.website ?? "",
        employees_count: model.get_emp_size?.id ?? "",
        data_category_id: model.get_category?.id ?? "",
        data_source_id: model.get_lead_source?.id ?? "",
        social_links: model.social_links ?? [],
        details: model.details ?? "",
        data_rating_id: model.get_lead_rating?.id ?? "",
        tags: model.get_tag_names ?? [],
        is_active: model.is_active ?? 1,
        data_priority_id: model.get_lead_priority?.id ?? "",
        preferred_contact_method:
            model.preferred_contact_method > 0
                ? model.preferred_contact_method
                : "",
        preferred_contact_time: model.get_preferred_time?.id ?? "",
    };
}

/**
 * LeadEditPage Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function LeadEditPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const {
        toastAlert,
        tenant,
        routeNames,
        dataSalutations,
        dataStages,
        dataCategories,
        dataSources,
        tenantUsers,
        dataSocial = [],
        dataPriorities,
        dataContactMethods,
        dataContactTimes,
        model,
        modelStages,
    } = page.props;

    /** Validation */
    const schema = useMemo(() => LeadSchema(__), [__]);

    /** Defaults */
    const rawDefaults = useMemo(
        () => ({
            creator_id: model.creator_id ?? tenantUsers.authUser,
            owner_id: model?.owner_id,
            salutation: dataSalutations?.default || "",
            stage_id: dataStages?.default ?? "",
            data_category_id: dataCategories.default ?? "",
            data_source_id: dataSources?.default ?? "",
            social_links: dataSocial,
            data_priority_id: dataPriorities.default,
            preferred_contact_method: dataContactMethods.default,
            preferred_contact_time: dataContactTimes.default,
        }),
        [
            tenantUsers,
            dataSalutations,
            dataStages,
            dataCategories,
            dataSources,
            dataSocial,
            dataPriorities,
            dataContactMethods,
            dataContactTimes,
            model,
        ]
    );

    const stateDefaults = useMemo(
        () => mapModelToFormData(model, rawDefaults),
        [model, rawDefaults]
    );

    const { data, setData, put, processing, errors, setError, clearErrors } =
        useForm(stateDefaults);

    /** Submit */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            if (
                !joiValidation(
                    schema,
                    ValidationAttributes(data),
                    setError,
                    clearErrors
                )
            ) {
                swalToast({
                    type: "error",
                    message: __("Please correct the highlighted fields"),
                    position: "bottom-start",
                });
                return;
            }

            put(
                route(routeNames.leadsUpdate, {
                    lead: data.id,
                    tenant: tenant,
                }),
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const updatedModel = page.props.model;
                        setData(mapModelToFormData(updatedModel, rawDefaults));
                    },
                }
            );
        },
        [
            schema,
            data,
            setError,
            clearErrors,
            put,
            route,
            routeNames,
            tenant,
            rawDefaults,
            __,
            swalToast,
        ]
    );

    /** Reset */
    const handleReset = useCallback(
        (e) => {
            e.preventDefault();
            setData(stateDefaults);
            clearErrors();
        },
        [setData, stateDefaults]
    );

    /** Toast */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /** User options */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    /** Associates */
    useEffect(() => {
        if (data.associateType === "all") {
            setData(
                "associates",
                userOptions.map((u) => u.value)
            );
        } else {
            setData("associates", model?.get_associates);
        }
    }, [data.associateType]);

    /** Inputs */
    const formStateSources = useMemo(
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    const formInputs = useLeadFormInputs({
        data,
        errors,
        setData,
        sources: formStateSources,
        route,
        routeNames,
        tenant,
        handleSubmit,
        processing,
        handleReset,
    });

    /** Component map */
    const componentMap = useMemo(
        () => ({
            TwGeneralFormInput,
            TwGeneralFormSelect,
            TwGeneralFormDatalist,
            TwGeneralFormTextarea,
            RsCreatableComponent,
            TwGeneralFormRadioGroup,
            RsSelectableComponent,
        }),
        []
    );

    /** Stage click */
    const handleStepClick = (stageIndex, isFinalStep = false) => {
        router.visit(route(routeNames.leadsChangeStage, tenant), {
            method: "post",
            data: { stageable_id: data.id, stage_id: stageIndex },
            onSuccess: (page) => {
                /** If lead convert to final stage redirect to opportunity details page else show toast alert */

                if (isFinalStep) {
                    router.visit(route(routeNames.leadsList, tenant));
                    return;
                }

                swalToast({
                    type: "success",
                    message: __("Status changed successfully"),
                    position: "bottom-start",
                });
            },
        });
    };

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Lead")}: ${model?.get_lead_name}`}
            breadNavItems={[...LeadListNavItems, { name: "Edit" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stage Steps */}
                <StageStepsComponent
                    steps={dataStages.list}
                    currentIndex={data.stage_id}
                    onStepClick={handleStepClick}
                    showStepHeader={false}
                    className="text-base-content"
                    leadId={data.id}
                />

                {/* Stats */}
                <WidgetBasicComponent
                    stats={model?.get_lead_stats}
                    className="bg-base-100 border border-base-300 rounded-md shadow p-3 text-base-content"
                />

                {/* Tabs */}
                <TabsComponent
                    variant="tabs-lift"
                    tabs={[
                        {
                            label: "Overview",
                            icon: "view",
                            defaultChecked: true,
                            tabIndex: "overview",
                            content: (
                                <OverviewComponent
                                    modelData={model?.get_lead_stats?.modelData}
                                    overviewStats={
                                        model?.get_lead_stats?.overview ?? []
                                    }
                                    associatedPersons={
                                        model?.get_associated_persons ?? []
                                    }
                                />
                            ),
                        },
                        {
                            label: "Edit",
                            icon: "edit",
                            defaultChecked: false,
                            tabIndex: "general-info",
                            content: (
                                <form onSubmit={handleSubmit}>
                                    {formInputs.map((section, sIdx) => (
                                        <FormSectionComponent
                                            key={sIdx}
                                            {...section.parentSection}
                                            className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                                        >
                                            <div
                                                className={`${section.childGridClass} py-2`}
                                            >
                                                {section.childItems.map(
                                                    (field, idx) => {
                                                        const Component =
                                                            componentMap[
                                                                field
                                                                    .componentType
                                                            ];
                                                        return Component ? (
                                                            <Component
                                                                key={`${sIdx}_${idx}`}
                                                                {...field}
                                                                className="bg-base-100 text-base-content border border-base-300"
                                                            />
                                                        ) : (
                                                            <h1
                                                                key={`${sIdx}_${idx}`}
                                                                className="text-error"
                                                            >
                                                                Invalid
                                                            </h1>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </FormSectionComponent>
                                    ))}
                                </form>
                            ),
                        },
                        {
                            label: "Tasks",
                            icon: "activity",
                            defaultChecked: false,
                            tabIndex: "tasks",
                            content: <ActivitySectionComponent />,
                        },
                        {
                            label: "Note",
                            icon: "note",
                            defaultChecked: false,
                            tabIndex: "note",
                            content: <ActivityNoteSectionComponent />,
                        },
                        {
                            label: "Stage history",
                            icon: "stage",
                            defaultChecked: false,
                            tabIndex: "history",
                            content: (
                                <StageDurationTable dataList={modelStages} />
                            ),
                        },
                        {
                            label: "Ai summary",
                            icon: "time",
                            defaultChecked: false,
                            tabIndex: "ai-summary",
                            content: (
                                <AiSummaryComponent
                                    modelId={model?.id}
                                    modelData={model?.get_lead_stats?.modelData}
                                    overviewStats={
                                        model?.get_lead_stats?.overview ?? []
                                    }
                                    aiPayload={model?.get_ai_payload ?? []}
                                    existingAiAnalysis={
                                        model?.get_ai_analysis ?? []
                                    }
                                    type="LEAD"
                                />
                            ),
                        },
                        {
                            label: "Email",
                            icon: "email",
                            defaultChecked: false,
                            tabIndex: "email",
                            content: (
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-100 border-base-300 text-base-content"
                                    placeholder="Write notes here..."
                                />
                            ),
                        },

                        // {
                        //     label: "Tree log",
                        //     icon: "time",
                        //     defaultChecked: false,
                        //     tabIndex: "tree-log",
                        //     content: <h1>Tree </h1>,
                        // },
                        {
                            label: "Sms",
                            icon: "sms",
                            defaultChecked: false,
                            tabIndex: "sms",
                            content: (
                                <p className="text-base-content/80">
                                    Lead history & activities go here...
                                </p>
                            ),
                        },
                        {
                            label: "Relatives",
                            icon: "activity",
                            defaultChecked: false,
                            tabIndex: "relatives",
                            content: (
                                <RelativesSectionComponent
                                    needReport={[
                                        "CONTACT",
                                        "OPPORTUNITY",
                                        "ORGANIZATION",
                                        "PROJECT",
                                        "ORGANIZATION_CONTACT",
                                        "PRODUCT",
                                    ]}
                                    addLinkBtn={true}
                                />
                            ),
                        },
                    ]}
                    className="bg-base-100 border-base-300 text-base-content"
                />
            </div>
        </TenantDashboardLayout>
    );
}
