import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { TaskListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { swalToast } from "@/utils/toast";
import { useTaskFormInputs } from "@/hooks/useTaskFormInputs";
import { TaskSchema, ValidationAttributes } from "@/schemas/tenants/taskSchema";
import { joiValidation } from "@/utils/joiValidation";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import OverviewComponent from "@/Components/Tenant/PageComponent/OverviewComponent";
import RelativesSectionComponent from "@/Components/Tenant/PageComponent/RelativesSectionComponent";

/**
 * LeadEditPage Component
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TaskEditPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const relatedToDataCollections = [];

    const {
        toastAlert,
        tenant,
        routeNames,
        dataCategoriesForTasks,
        dataStagesForTask,
        dataPriorities,
        tenantUsers,
        modelStages,
        model,
        dataRelatedTypes,
    } = page.props;

    /** Validation */
    const schema = useMemo(() => TaskSchema(__), [__]);

    /** Default form state */
    const stateDefaults = useMemo(
        () => ({
            taskable_id: model?.id ?? "",
            causer_id: tenantUsers?.authUser,
            name: "",
            details: "",
            date_start: "",
            date_due: "",
            date_reminder: "",
            progress_percent: 0,
            owner_id: tenantUsers.authUser,
            stage_id: dataStagesForTask.default,
            data_priority_id: dataPriorities.default,
            data_category_id: dataCategoriesForTasks.default,
            associates: [],
            related_to_type: model?.get_task_type ?? dataRelatedTypes?.default,
            relatedToDataCollections: [],
            is_active: true,
        }),
        [
            model,
            tenantUsers,
            dataStagesForTask,
            dataCategoriesForTasks,
            dataPriorities,
            dataRelatedTypes,
        ]
    );

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
    } = useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** User options */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    /** Pre-rendered sources to pass into input factory hooks */
    const formStateDataSources = useMemo(
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    /** Transform data before submit (ensures correct taskable_id) */
    transform((data) => ({
        ...data,
        taskable_id: data.taskable_id ? data.taskable_id : model?.id,
    }));

    /**
     * Reset form data and clear validation errors
     *
     * @function handleReset
     * @returns {void}
     */
    const handleReset = useCallback(() => {
        setData(serverData);
        clearErrors();
    }, [setData, serverData, clearErrors]);

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
                route(routeNames.tasksUpdate, {
                    task: model?.id,
                    tenant: tenant,
                }),
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        },
        [
            model,
            schema,
            data,
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

    /** Toast */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
            router.reload({ only: [] });
        }
    }, [toastAlert]);

    /** Task show route for fetching details */
    const currentActionId = model?.id;

    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.tasksShow, {
                      tenant,
                      task: currentActionId,
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

        const fetchTaskDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(showRoute, { signal });
                const json = await response.json();

                if (json?.success && json?.data) {
                    const mergedData = { ...stateDefaults, ...json.data };

                    setData(mergedData);
                    setServerData(mergedData);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Task not found"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch task details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();

        /* Cleanup: abort fetch if modal closes or component unmounts */
        return () => controller.abort();
    }, [showRoute, currentActionId]);

    /** Build form inputs dynamically */

    const actualRelatedType = model?.get_task_type ?? "";

    const formInputs = useTaskFormInputs({
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
        relatedToTypeIsReadOnly: actualRelatedType ? true : false,
    });

    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Task")}: ${model?.name}`}
            breadNavItems={[...TaskListNavItems, { name: "Edit" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stats */}
                <WidgetBasicComponent
                    stats={model?.get_task_stats}
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
                                    modelData={model?.get_task_stats?.modelData}
                                    overviewStats={
                                        model?.get_task_stats?.overview ?? []
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
                                <form
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {formInputs.map((section, sIdx) => (
                                        <FormSectionComponent
                                            key={sIdx}
                                            {...section.parentSection}
                                            className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                                        >
                                            <div
                                                className={`${section.childGridClass} py-3`}
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
                            indicator: model?.total_tasks,
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
                            icon: "time",
                            defaultChecked: true,
                            tabIndex: "history",
                            content: (
                                <StageDurationTable dataList={modelStages} />
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
                                        "OPPORTUNITY",
                                        "PARENT_TASK",
                                        "TASK_HISTORY",
                                    ]}
                                    addLinkBtn={false}
                                    showActionBtns={false}
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
