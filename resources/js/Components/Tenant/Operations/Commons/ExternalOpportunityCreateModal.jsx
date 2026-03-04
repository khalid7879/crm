import React, { useCallback, useMemo, useEffect } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useOpportunityFormInputs } from "@/hooks/useOpportunityFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import useFetchDependencies from "@/hooks/useFetchDependencies";
import DynamicForm from "@/Components/Tenant/Operations/Commons/DynamicForm";
import { swalToast } from "@/utils/toast";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

/**
 * OpportunityCreateModal
 *
 * Modal component for creating new opportunities in a tenant’s workspace.
 * Integrates with Inertia.js forms, dynamic field factories, and async lookup sources.
 * Supports "Save" and "Save & New" workflows with reset capabilities.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isModalOpen - Whether the modal is open
 * @param {Function} props.setIsModalOpen - Setter to toggle modal visibility
 *
 * @example
 * <OpportunityCreateModal
 *   isModalOpen={isOpen}
 *   setIsModalOpen={setIsOpen}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ExternalOpportunityCreateModal({
    isModalOpen,
    setIsModalOpen,
    model,
    finalStepInfos,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

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
        dataCategoriesForOpportunities = {},
        dataStagesForOpportunities = {},
        dataPriorities = {},
        dataStagesForTask = {},
        dataRevenueTypes = {},
    } = dependencies ?? {};


    console.log("dataStagesForOpportunities", dataStagesForOpportunities);
    

    /**
     * Default form state values
     * @constant
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            causer_id: tenantUsers?.authUser,
            name: "",
            details: "",
            organization_name: "",
            date_forecast: "",
            date_close: "",
            data_source_id: "",
            data_category_id: dataCategoriesForOpportunities?.default,
            stage_id: dataStagesForOpportunities?.default,
            progress_percent:
                dataStagesForOpportunities?.list?.[
                    dataStagesForOpportunities?.default
                ]?.stage_percent,
            amount: "",
            currency: "",
            data_revenue_type_id: dataRevenueTypes?.default,
            owner_id: tenantUsers.authUser,
            associates: [],
            is_active: true,
            finalStepInfos,
        }),
        [
            dataStagesForOpportunities,
            dataCategoriesForOpportunities,
            dataPriorities,
            tenantUsers,
        ]
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

    /**
     * Pre-rendered lookup sources for form inputs
     * @constant
     * @type {Object}
     */
    const formStateDataSources = useMemo(
        () => ({ ...dependencies, userOptions }),
        [dependencies, userOptions]
    );

    /** Transform data before submit */
    transform((data) => ({
        ...data,
        amount: data.amount ? data.amount : 0,
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
     * Submit form to create a new opportunity
     *
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} e - Form event
     * @param {boolean} [isSaveAndNew=false] - If true, keep modal open for another entry
     * @returns {void}
     */
    const handleSubmit = useCallback(
        (e, isSaveAndNew = false) => {
            e.preventDefault();

            post(route(routeNames.opportunityStore, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    if (!isSaveAndNew) {
                        setIsModalOpen(false);
                    }
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
     * Dynamically generated form inputs
     * @constant
     * @type {Array}
     */
    const formInputs = useOpportunityFormInputs({
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
    /** Render */
    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Create new opportunity"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
            handleReset={handleReset}
            modalType="CREATE"
            showSaveNewBtn={false}
        >
            {loading ? <LoadingSpinner /> : isModalOpen && renderForm()}
        </ModalFormInputsLayout>
    );
}
