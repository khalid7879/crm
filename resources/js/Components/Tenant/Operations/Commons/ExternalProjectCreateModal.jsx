import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useProjectFormInputs } from "@/hooks/useProjectFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import useFetchDependencies from "@/hooks/useFetchDependencies";
import DynamicForm from "@/Components/Tenant/Operations/Commons/DynamicForm";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import React, { useCallback, useMemo, useState, useEffect } from "react";
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
export default function ExternalProjectCreateModal({
    isModalOpen,
    setIsModalOpen,
    model,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { toastAlert } = usePage().props;
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
        dataTags = {},
        dataCategoriesForProject = {},
        dataStagesForProject = {},
    } = dependencies ?? {};

    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
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
        [dataStagesForProject, dataCategoriesForProject, tenantUsers]
    );

       /** Inertia Form Hook */
       const {
           data,
           setData,
           post,
           processing,
           errors,
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

    const tagOptions = useMemo(
        () =>
            Object.entries(dataTags?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [dataTags]
    );


    /** Pre-rendered sources to pass into input factory hooks */
    const formStateDataSources = useMemo(
        () => ({ ...dependencies, userOptions }),
        [dependencies, userOptions]
    );


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
            post(route(routeNames.projectsStore, { tenant }), {
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

    /** Build form inputs dynamically */
    const formInputs = useProjectFormInputs({
        data,
        setData,
        errors,
        sources: formStateDataSources,
        route,
        handleSubmit,
        processing,
        handleReset,
        reset,
    });

    const { renderForm } = DynamicForm(formInputs);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Create new project"
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
