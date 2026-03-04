import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTaskFormInputs } from "@/hooks/useTaskFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import useFetchDependencies from "@/hooks/useFetchDependencies";
import DynamicForm from "@/Components/Tenant/Operations/Commons/DynamicForm";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useRoute } from "ziggy";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

/**
 * TaskCreateModal Component
 *
 * A reusable modal component for creating new tasks within a tenant’s workspace.
 * It integrates Inertia.js forms, task-specific input mappings, and dynamic
 * related data fetching. Provides support for reset, async lookup, and both
 * normal save and "save & new" actions.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isModalOpen - Whether the modal is currently open
 * @param {Function} props.setIsModalOpen - State setter to toggle modal visibility
 *
 * @example
 * <TaskCreateModal
 *   isModalOpen={isOpen}
 *   setIsModalOpen={setIsOpen}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ExternalTaskCreateModal({
    isModalOpen,
    setIsModalOpen,
    relatedToTypeIsReadOnly = false,
    model = null,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const relatedToDataCollections = [];

    const { tenant, routeNames } = page.props;

    /**  Fetch dependencies when modal opens */
    const { loading, dependencies, defaultData } = useFetchDependencies(
        isModalOpen,
        model,
        routeNames.neededData
    );

    /** Example: set form data when dependencies load  */
    useEffect(() => {
        if (defaultData) {
            setData(defaultData);
            clearErrors();
        }
    }, [defaultData]);

    /**  Safely destructure with fallback empty objects */
    const {
        tenantUsers = {},
        dataCategoriesForTasks = {},
        dataPriorities = {},
        dataRelatedTypes = {},
        dataStagesForTask = {},
    } = dependencies ?? {};

    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            taskable_id: "",
            causer_id: tenantUsers?.authUser,
            name: "",
            details: "",
            date_start: "",
            date_due: "",
            date_reminder: "",
            progress_percent: 0,
            owner_id: tenantUsers?.authUser,
            stage_id: dataStagesForTask?.default,
            data_priority_id: dataPriorities?.default,
            data_category_id: dataCategoriesForTasks?.default,
            associates: [],
            related_to_type: dataRelatedTypes?.default
                ? dataRelatedTypes?.default
                : "LEAD",
            relatedToDataCollections,
            is_active: true,
        }),
        [dataStagesForTask, dataCategoriesForTasks, dataPriorities, tenantUsers]
    );

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm(stateDefaults);

    /**
     * Options list for assigning tasks to tenant users
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

    /** Pre-rendered sources to pass into input factory hooks */
    const formStateDataSources = useMemo(
        () => ({ ...dependencies, userOptions }),
        [dependencies, userOptions]
    );

    /** Transform data before submit (ensures correct taskable_id) */
    transform((data) => ({
        ...data,
        taskable_id: data.taskable_id ? data.taskable_id : "",
    }));

    /**
     * Reset form data and clear validation errors
     *
     * @function handleReset
     * @returns {void}
     */
    const handleReset = useCallback(() => {
        setData(stateDefaults);
        clearErrors();
    }, [setData, stateDefaults, clearErrors]);

    /**
     * Submit task creation form
     *
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} e - Form event
     * @param {boolean} [isSaveAndNew=false] - If true, keeps modal open for new task entry
     * @returns {void}
     */
    const handleSubmit = useCallback(
        (e, isSaveAndNew = false) => {
            e.preventDefault();
            post(route(routeNames.tasksStore, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    !isSaveAndNew ? setIsModalOpen(false) : null;
                    handleReset();
                },
                onError: () => {
                    swalToast({
                        type: "error",
                        message: __("Please correct the highlighted fields"),
                        position: "bottom-start",
                    });
                },
            });
        },
        [
            post,
            route,
            routeNames,
            tenant,
            setIsModalOpen,
            handleReset,
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
    useEffect(() => {
        if (data.related_to_type) {
            setData("relatedToDataCollections", []);
        }
    }, [data.related_to_type]);

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

    /** Build form inputs dynamically */
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
        relatedToTypeIsReadOnly,
    });

    const { renderForm } = DynamicForm(formInputs);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Create new task"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
            handleReset={handleReset}
            modalType="CREATE"
        >
            {loading ? <LoadingSpinner /> : isModalOpen && renderForm()}
        </ModalFormInputsLayout>
    );
}
