import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { OpportunityListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import {
    OpportunitySchema,
    ValidationAttributes,
} from "@/schemas/tenants/opportunitySchema";
import { joiValidation } from "@/utils/joiValidation";
import OpportunityStageStepsComponent from "@/Components/Tenant/Addons/OpportunityStageStepsComponent";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { useOpportunityFormInputs } from "@/hooks/useOpportunityFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import ActivityAttachmentSectionComponent from "@/Components/Tenant/PageComponent/ActivityAttachmentSectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import OpportunityDetailsViewComponent from "@/Components/Tenant/Operations/Opportunities/OpportunityDetailsViewComponent";
import AiSummaryComponent from "@/Components/Tenant/PageComponent/AiSummaryComponent";
import RelativesSectionComponent from "@/Components/Tenant/PageComponent/RelativesSectionComponent";

/**
 * OpportunityEditPage
 *
 * React component responsible for editing an existing Opportunity within the tenant dashboard.
 * It provides a comprehensive form interface that integrates AI insights, activity tracking,
 * stage visualization, and tabbed detail sections. The component uses Joi-based validation,
 * dynamic form configuration, and Inertia.js for data persistence and page state management.
 *
 * @component
 * @returns {JSX.Element} The rendered opportunity edit page including form sections, widgets, tabs, and AI insights.
 *
 * @dependencies
 * - @inertiajs/react → Provides `useForm`, `usePage`, and `router` for Inertia integration.
 * - ziggy → Enables Laravel route generation via `useRoute()`.
 * - TenantDashboardLayout → Base layout wrapper for tenant pages.
 * - useTranslations → Handles multilingual translations across UI text.
 * - joiValidation & OpportunitySchema → Joi schema-based validation for form fields.
 * - useOpportunityFormInputs → Custom hook to handle opportunity form input configuration.
 * - FormSectionComponent, TabsComponent, WidgetBasicComponent → Manage form structure, layout, and organization.
 * - OpportunityStageStepsComponent, StageDurationTable → Handle opportunity stage visualization and duration tracking.
 * - ActivitySectionComponent, ActivityNoteSectionComponent → Manage related activities and notes.
 * - OpportunityDetailsViewComponent → Displays contextual opportunity details.
 * - AiSummaryComponent → Displays AI-generated insights for the current opportunity.
 *
 * @state
 * @property {boolean} loading - Indicates if the page is currently fetching or processing data.
 * @property {Object|null} serverData - Stores data retrieved from the backend for initializing the form.
 *
 * @constants
 * @property {Object} stateDefaults - Default form state values for opportunity creation/editing.
 * Includes stage, category, user ownership, revenue type, and related entity fields.
 * @property {Array<{value: string, label: string}>} userOptions - List of tenant users formatted for dropdown assignment.
 *
 * @inertiaProps
 * @property {Object} tenant - Current tenant’s metadata.
 * @property {Object} routeNames - Collection of named routes accessible to the tenant module.
 * @property {Object} tenantUsers - Authenticated user and related tenant user list.
 * @property {Object} dataCategoriesForOpportunities - Available opportunity categories with defaults.
 * @property {Object} dataStagesForOpportunities - Configurable opportunity stages with default selection.
 * @property {Object} dataPriorities - Priority levels available for opportunities.
 * @property {Object} dataSources - Source types from which opportunities originate.
 * @property {Object} dataRevenueTypes - Revenue type definitions used in opportunity financials.
 * @property {Object} model - Existing opportunity model loaded for editing.
 * @property {Object} toastAlert - Preconfigured backend alert messages.
 *
 * @example
 * <OpportunityEditPage />
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function OpportunityEditPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const schema = useMemo(() => OpportunitySchema(__), [__]);

    const {
        toastAlert,
        tenant,
        routeNames,
        dataCategoriesForOpportunities,
        dataStagesForOpportunities,
        dataPriorities,
        dataSources,
        tenantUsers,
        dataRevenueTypes,
        stage_id,
        modelStages,
        model,
    } = page.props;

    console.log('model===',model);
    

    /**
     * Default form state values
     * @constant
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            opportunityable_id: model?.id ?? "",
            causer_id: tenantUsers.authUser,
            name: "",
            details: "",
            organization_name: model?.get_organization?.name ?? "",
            date_forecast: "",
            date_close: "",
            data_source_id: dataSources.default,
            data_category_id: dataCategoriesForOpportunities?.default,
            stage_id: dataStagesForOpportunities?.default,
            progress_percent:
                dataStagesForOpportunities?.list?.[
                    dataStagesForOpportunities?.default
                ]?.stage_percent,
            amount: "",
            currency: "",
            data_revenue_type_id: dataRevenueTypes.default,
            owner_id: tenantUsers.authUser,
            associates: [],
            is_active: true,
        }),
        [
            dataStagesForOpportunities,
            dataCategoriesForOpportunities,
            dataPriorities,
            tenantUsers,
            dataSources,
        ]
    );
    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);
    /** Inertia Form Hook */
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        transform,
        reset,
    } = useForm(stateDefaults);

    /**
     * Options list for assigning opportunities to users
     * @constant
     * @type {Array<{value: string, label: string}>}
     */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    /**
     * Pre-rendered lookup sources for form inputs
     * @constant
     * @type {Object}
     */
    const formStateDataSources = useMemo(
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    /** Transform data before submit */
    transform((data) => ({
        ...data,
        amount: data.amount ? data.amount : 0,
        opportunityable_id: data.opportunityable_id
            ? data.opportunityable_id
            : model?.id,
    }));

    /**
     * Reset form state and clear errors
     * @function handleReset
     * @returns {void}
     */
    const handleReset = useCallback(() => {
        setData(stateDefaults);
        clearErrors();
    }, [setData, stateDefaults, clearErrors]);

    /**
     * Load related model data asynchronously based on user input.
     *
     * @async
     * @function handleAsyncCall
     * @param {string} inputValue - Search term entered by the user
     * @returns {Promise<Array>} - Returns matching related model collection
     */
    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeMap = routeNames.dataRelatedRoutes ?? {};
                if (
                    data.related_to_type &&
                    routeMap.hasOwnProperty(data.related_to_type)
                ) {
                    const routeKey = routeMap[data.related_to_type];

                    let response = await fetch(
                        route(routeKey, { search: inputValue, tenant })
                    );
                    let json = await response.json();

                    if (!json.success) return [];

                    setData("relatedToDataCollections", json.data);
                    return json.data;
                }
                return [];
            } catch (error) {
                return [];
            }
        },
        [routeNames, data.related_to_type, tenant, setData, route]
    );

    /** Task show route for fetching details */
    const currentActionId = model?.id;

    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.opportunityShow, {
                      tenant,
                      opportunity: currentActionId,
                      isFormattedShort: false,
                  })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    /** Fetch task details when modal opens */

    useEffect(() => {
        if (!showRoute || !currentActionId) {
            swalToast({
                type: "error",
                message: __("Model not found"),
                position: "bottom-start",
            });
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchOpportunityDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(showRoute, { signal });
                const json = await response.json();

                console.log("json===", json);
                

                if (json?.success && json?.data) {
                    console.log("json data==", json?.data);

                    const mergedData = { ...stateDefaults, ...json.data };

                    setData(mergedData);
                    setServerData(mergedData);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Opportunity not found"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch opportunity details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunityDetails();

        /* Cleanup: abort fetch if modal closes or component unmounts */
        return () => controller.abort();
    }, [showRoute, currentActionId]);

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
                route(routeNames.opportunityUpdate, {
                    opportunity: model.id,
                    tenant: tenant,
                }),
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        // const updatedModel = page.props.model;
                        // setData(mapModelToFormData(updatedModel, rawDefaults));
                    },
                }
            );
        },
        [
            schema,
            data,
            model,
            setError,
            clearErrors,
            put,
            route,
            routeNames,
            tenant,
            __,
            swalToast,
        ]
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

    /** Stage click */

    const handleStepClick = (stageIndex, isFinalStep = false) => {
        router.visit(route(routeNames.opportunityChangeStage, tenant), {
            method: "post",
            data: {
                stageable_id: data?.opportunityable_id,
                stage_id: stageIndex,
            },

            onSuccess: (page) => {
                /** If lead convert to final stage redirect to opportunity details page else show toast alert */
                swalToast({
                    type: "success",
                    message: __("Status changed successfully"),
                    position: "bottom-start",
                });
            },
        });
    };

    /**
     * Dynamically generated form inputs
     * @constant
     * @type {Array}
     */

    /** Build form inputs dynamically */
    const formInputs = useOpportunityFormInputs({
        data,
        setData,
        errors,
        sources: formStateDataSources,
        route,
        handleSubmit,
        processing,
        handleReset,
        handleAsyncCall,
        showActionBtns: true,
    });

    /** Input component map */
    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Opportunity")}: ${model?.name}`}
            breadNavItems={[...OpportunityListNavItems, { name: "Edit" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stage Steps */}
                <OpportunityStageStepsComponent
                    steps={dataStagesForOpportunities?.list}
                    currentIndex={stage_id}
                    onStepClick={handleStepClick}
                    showStepHeader={false}
                    className="text-base-content"
                    opportunityId={model?.id}
                />

                {/* Stats */}
                <WidgetBasicComponent
                    stats={model?.get_opportunity_stats}
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
                                <OpportunityDetailsViewComponent
                                    modelData={
                                        model?.get_opportunity_stats?.modelData
                                    }
                                    overviewStats={
                                        model?.get_opportunity_stats?.overview
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
                                <form>
                                    {formInputs.map((section, sIdx) => (
                                        <FormSectionComponent
                                            key={sIdx}
                                            {...section.parentSection}
                                            className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                                        >
                                            <div
                                                className={
                                                    section.childGridClass
                                                }
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
                                                                {__(
                                                                    "No data found"
                                                                )}
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
                            label: "Ai summary",
                            icon: "time",
                            defaultChecked: true,
                            tabIndex: "ai-summary",
                            content: (
                                <AiSummaryComponent
                                    modelId={model?.id}
                                    modelData={
                                        model?.get_opportunity_stats
                                            ?.modelData
                                    }
                                    overviewStats={
                                        model?.modelData?.get_opportunity_stats
                                            ?.overview ?? []
                                    }
                                    aiPayload={
                                        model?.modelData?.get_ai_payload ?? []
                                    }
                                    existingAiAnalysis={
                                        model?.modelData?.get_ai_analysis ?? []
                                    }
                                    type="OPPORTUNITY"
                                />
                            ),
                        },
                        {
                            label: "History",
                            icon: "time",
                            defaultChecked: false,
                            tabIndex: "history",
                            content: (
                                <StageDurationTable
                                    dataList={modelStages}
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

                        {
                            label: "Tree log",
                            icon: "time",
                            defaultChecked: false,
                            tabIndex: "tree-log",
                            content: <h1>Tree </h1>,
                        },
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
                            label: "Attachment",
                            icon: "attachment",
                            defaultChecked: false,
                            tabIndex: "attachment",
                            content: (
                                <ActivityAttachmentSectionComponent type="OPPORTUNITY" />
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
                                        "ORGANIZATION",
                                        "PROJECT",
                                        "LEAD",
                                        "LEAD_CONTACT",
                                        "ORGANIZATION_CONTACT",
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
