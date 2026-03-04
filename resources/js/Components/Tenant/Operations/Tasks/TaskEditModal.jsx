import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTaskFormInputs } from "@/hooks/useTaskFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";

/**
 * TaskEditModal Component
 *
 * A modal form for editing a task. Handles fetching task details, form state,
 * validation errors, and submission.
 *
 * @param {Object} props
 * @param {boolean} props.isModalOpen - Whether the modal is open.
 * @param {function} props.setIsModalOpen - Setter for modal open state.
 * @param {string|number|null} props.currentActionId - The task ID to edit.
 * @param {string} [props.relatedToType="LEAD"] - Default related type for task.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TaskEditModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
    relatedToType = "LEAD",
    relatedToTypeIsReadOnly= false,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const {
        tenant,
        routeNames,
        dataCategoriesForTasks,
        dataStagesForTask,
        dataPriorities,
        tenantUsers,
        model: parentModel,
        dataRelatedTypes,
    } = page.props;

    /** Default form state */
    const stateDefaults = useMemo(
        () => ({
            taskable_id: parentModel?.id ?? "",
            causer_id: tenantUsers.authUser,
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
            related_to_type: dataRelatedTypes?.default || relatedToType,
            relatedToDataCollections: [],
            is_active: true,
        }),
        [
            parentModel,
            tenantUsers,
            dataStagesForTask,
            dataCategoriesForTasks,
            dataPriorities,
            relatedToType,
            dataRelatedTypes,
        ]
    );

    const { data, setData, put, processing, errors, clearErrors, transform } =
        useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** Transform before submit to ensure taskable_id is always set */
    transform((prevState) => ({
        ...prevState,
        taskable_id: prevState.taskable_id || parentModel?.id,
    }));

    /** Reset form */
    const handleReset = useCallback(() => {
        setData(serverData);
        clearErrors();
    }, [setData, serverData, clearErrors]);

    /** Submit form */
    const handleSubmit = useCallback(
        (e, isSaveAndNew = false) => {
            e.preventDefault();
            put(
                route(routeNames.tasksUpdate, {
                    tenant,
                    task: currentActionId,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (!isSaveAndNew) setIsModalOpen(false);
                        handleReset();
                    },
                }
            );
        },
        [put, route, routeNames, tenant, setIsModalOpen, handleReset]
    );

    /** Async fetch for related data */
    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeMap = routeNames.dataRelatedRoutes ?? {};
                if (data.related_to_type && routeMap[data.related_to_type]) {
                    const response = await fetch(
                        route(routeMap[data.related_to_type], {
                            search: inputValue,
                            tenant,
                        })
                    );
                    const json = await response.json();
                    return json.success ? json.data : [];
                }
                return [];
            } catch {
                return [];
            }
        },
        [routeNames, data.related_to_type, tenant, route]
    );

    const componentMap = useMemo(() => componentMapping(), []);

    /** Task show route for fetching details */
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
        if (!isModalOpen) return;

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
    }, [isModalOpen, showRoute, currentActionId]);

    /** User dropdown options */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    /** Form inputs built using factory hook */
    const formInputs = useTaskFormInputs({
        data,
        setData,
        errors,
        sources: { ...page.props, userOptions },
        route,
        handleSubmit,
        processing,
        handleReset,
        handleAsyncCall,
        relatedToTypeIsReadOnly,
    });

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Edit task"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
            handleReset={handleReset}
            modalType="EDIT"
            showSaveNewBtn={false}
        >
            {formInputs.length > 0 && !loading ? (
                <form>
                    {formInputs.map((section, sIdx) => (
                        <FormSectionComponent
                            key={sIdx}
                            {...section.parentSection}
                            className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                        >
                            <div className={section.childGridClass}>
                                {section.childItems.map((field, idx) => {
                                    const Component =
                                        componentMap[field.componentType];
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
                                            {__("No data found")}
                                        </h1>
                                    );
                                })}
                            </div>
                        </FormSectionComponent>
                    ))}
                </form>
            ) : (
                <h1 className="text-center text-base-content">
                    <LoadingSpinner />
                </h1>
            )}
        </ModalFormInputsLayout>
    );
}
