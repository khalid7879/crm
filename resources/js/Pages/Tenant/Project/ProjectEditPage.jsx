import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { ProjectListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { useProjectFormInputs } from "@/hooks/useProjectFormInputs";
import { joiValidation } from "@/utils/joiValidation";
import ProjectStageStepsComponent from "@/Components/Tenant/Addons/ProjectStageStepsComponent";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import OverviewComponent from "@/Components/Tenant/PageComponent/OverviewComponent";
import RelativesSectionComponent from "@/Components/Tenant/PageComponent/RelativesSectionComponent";
import AiSummaryComponent from "@/Components/Tenant/PageComponent/AiSummaryComponent";
import {
    ProjectSchema,
    ValidationAttributes,
} from "@/schemas/tenants/ProjectSchema";

/**
 * ProjectEditPage Component
 *
 * Allows editing of an existing project with comprehensive tabs for overview,
 * general information, tasks, notes, stage history, AI summary, communications,
 * relatives, and more.
 *
 * Features:
 * - Fetches project details on mount
 * - Client-side validation using Joi schema
 * - Inertia form handling with PUT update
 * - Stage progression with visual steps
 * - Dynamic form fields via useProjectFormInputs hook
 * - Toast notifications for success/error feedback
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @returns {JSX.Element}
 */
export default function ProjectEditPage() {
    const __ = useTranslations();
    const { props } = usePage();
    const {
        toastAlert,
        tenant,
        routeNames,
        dataTags,
        dataCategoriesForProject,
        dataStagesForProject,
        tenantUsers,
        stage_id,
        modelStages,
        model,
    } = props;

    console.log("props=", model);

    const currentProjectId = model?.id;

    /** Validation schema */
    const schema = useMemo(() => ProjectSchema(__), [__]);

    /** Default form values */
    const defaultFormData = useMemo(
        () => ({
            stageable_id: currentProjectId ?? "",
            causer_id: tenantUsers.authUser,
            name: "",
            details: "",
            data_category_id: dataCategoriesForProject.default,
            stage_id: dataStagesForProject?.default,
            owner_id: tenantUsers.authUser,
            associates: [],
            tags: [],
            is_active: true,
        }),
        [
            currentProjectId,
            dataCategoriesForProject,
            dataStagesForProject,
            tenantUsers,
        ]
    );

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);
    const [callProjectDetails, setCallProjectDetails] = useState(true);

    const {
        data,
        setData,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        reset,
    } = useForm(defaultFormData);

    /** Select options */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    const tagOptions = useMemo(
        () =>
            Object.entries(dataTags?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [dataTags]
    );

    const formDataSources = useMemo(
        () => ({
            ...props,
            userOptions,
            tagOptions,
        }),
        [props, userOptions, tagOptions]
    );

    /** Reset form to defaults */
    const handleReset = useCallback(() => {
        reset();
        clearErrors();
    }, [reset, clearErrors]);

    /** Form submission with validation */
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
                route(routeNames.projectsUpdate, {
                    project: currentProjectId,
                    tenant,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Model is updated via props on next page load
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
            currentProjectId,
            tenant,
            __,
        ]
    );

    /** Stage change handler */
    const handleStepClick = useCallback(
        (stageIndex, isFinalStep = false) => {
            router.visit(route(routeNames.projectsChangeStage, tenant), {
                method: "post",
                data: {
                    stageable_id: data.stageable_id,
                    stage_id: stageIndex,
                },
                onSuccess: () => {
                    if (isFinalStep) {
                        router.visit(route(routeNames.leadsList, tenant));
                        return;
                    }
                    // swalToast({
                    //     type: "success",
                    //     message: __("Status changed successfully"),
                    //     position: "bottom-start",
                    // });
                },
            });
        },
        [data.stageable_id, route, routeNames, tenant, __]
    );

    /** Fetch project details on mount */
    useEffect(() => {
        if (!callProjectDetails) {
            return;
        }
        if (!currentProjectId) {
            swalToast({
                type: "error",
                message: __("Model not found"),
                position: "bottom-start",
            });
            return;
        }

        const showRoute = route(routeNames.projectsShow, {
            tenant,
            project: currentProjectId,
            isFormattedShort: false,
        });

        const controller = new AbortController();

        const fetchDetails = async () => {
            setLoading(true);
            console.log("call test...");

            try {
                const response = await fetch(showRoute, {
                    signal: controller.signal,
                });
                const json = await response.json();

                if (json?.success && json?.data) {
                    setCallProjectDetails(false);
                    const merged = { ...defaultFormData, ...json.data };
                    setData(merged);
                    setServerData(merged);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Project not found"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch project details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();

        return () => controller.abort();
    }, [
        currentProjectId,
        route,
        routeNames,
        tenant,
        defaultFormData,
        setData,
        clearErrors,
        __,
    ]);

    /** Show toast alerts from server */
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

    /** Dynamic form inputs */
    const formInputs = useProjectFormInputs({
        data,
        setData,
        errors,
        sources: formDataSources,
        route,
        handleSubmit,
        processing,
        handleReset,
        reset,
        showActionBtns: true,
    });

    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Project")}: ${model?.name ?? ""}`}
            breadNavItems={[...ProjectListNavItems, { name: __("Edit") }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stage Progression */}
                <ProjectStageStepsComponent
                    steps={dataStagesForProject?.list}
                    currentIndex={stage_id}
                    onStepClick={handleStepClick}
                    showStepHeader={false}
                    className="text-base-content"
                    projectId={currentProjectId}
                />

                {/* Project Stats Widget */}
                <WidgetBasicComponent
                    stats={model?.get_project_stats}
                    className="bg-base-100 border border-base-300 rounded-md shadow p-3 text-base-content"
                />

                {/* Main Tabs */}
                <TabsComponent
                    variant="tabs-lift"
                    className="bg-base-100 border-base-300 text-base-content"
                    tabs={[
                        {
                            label: __("Overview"),
                            icon: "view",
                            defaultChecked: true,
                            tabIndex: "overview",
                            content: (
                                <OverviewComponent
                                    modelData={
                                        model?.get_project_stats?.modelData
                                    }
                                    overviewStats={
                                        model?.get_project_stats?.overview ?? []
                                    }
                                    associatedPersons={
                                        model?.get_associated_persons ?? []
                                    }
                                />
                            ),
                        },
                        {
                            label: __("Edit"),
                            icon: "edit",
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
                                                                    "No component found for type: "
                                                                ) +
                                                                    field.componentType}
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
                            label: __("Tasks"),
                            icon: "activity",
                            tabIndex: "tasks",
                            content: <ActivitySectionComponent />,
                        },
                        {
                            label: __("Note"),
                            icon: "followup2",
                            tabIndex: "note",
                            content: <ActivityNoteSectionComponent />,
                        },
                        {
                            label: __("Stage history"),
                            icon: "time",
                            tabIndex: "history",
                            content: (
                                <StageDurationTable dataList={modelStages} />
                            ),
                        },
                        {
                            label: __("Email"),
                            icon: "email",
                            tabIndex: "email",
                            content: (
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-100 border-base-300 text-base-content"
                                    placeholder={__("Write email here...")}
                                />
                            ),
                        },
                        {
                            label: __("Ai summary"),
                            icon: "time",
                            tabIndex: "ai-summary",
                            content: (
                                <AiSummaryComponent
                                    modelId={currentProjectId}
                                    modelData={
                                        model?.get_project_stats?.modelData
                                    }
                                    overviewStats={
                                        model?.get_project_stats?.overview ?? []
                                    }
                                    aiPayload={model?.get_ai_payload ?? []}
                                    existingAiAnalysis={
                                        model?.get_ai_analysis ?? []
                                    }
                                    type="PROJECT"
                                />
                            ),
                        },
                        {
                            label: __("Sms"),
                            icon: "sms",
                            tabIndex: "sms",
                            content: (
                                <p className="text-base-content/80">
                                    {__("SMS history & activities go here...")}
                                </p>
                            ),
                        },
                        {
                            label: __("Tree log"),
                            icon: "time",
                            tabIndex: "tree-log",
                            content: <h1>Tree Log</h1>,
                        },
                        {
                            label: __("Relatives"),
                            icon: "activity",
                            tabIndex: "relatives",
                            content: (
                                <RelativesSectionComponent
                                    needReport={[
                                        "CONTACT",
                                        "OPPORTUNITY",
                                        "ORGANIZATION",
                                        "LEAD",
                                        "LEAD_CONTACT",
                                        "ORGANIZATION_CONTACT",
                                    ]}
                                    addLinkBtn={true}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </TenantDashboardLayout>
    );
}
