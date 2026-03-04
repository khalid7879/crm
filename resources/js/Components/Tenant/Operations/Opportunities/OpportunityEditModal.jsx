import React, { useCallback, useMemo, useState, useEffect } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { useOpportunityFormInputs } from "@/hooks/useOpportunityFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";

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
export default function OpportunityEditModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
    relatedToType = "LEAD",
    finalStepInfos,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { toastAlert } = usePage().props;

    const {
        tenant,
        routeNames,
        dataCategoriesForOpportunities,
        dataStagesForOpportunities,
        dataPriorities,
        tenantUsers,
        dataRevenueTypes,
        dataRelatedTypes,
        model = null,
    } = page.props;

    console.log("opportunity ===", page.props);

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
            data_source_id: "",
            data_category_id: dataCategoriesForOpportunities?.default,
            stage_id: dataStagesForOpportunities?.default,
            progress_percent:
                dataStagesForOpportunities?.list?.[
                    dataStagesForOpportunities?.default
                ]?.stage_percent,

            related_to_type: dataRelatedTypes?.default
                ? dataRelatedTypes?.default
                : "LEAD",
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
        put,
        processing,
        errors,
        clearErrors,
        transform,
        reset,
    } = useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** Transform before submit to ensure contactable_id is always set */
    transform((prevState) => ({
        ...prevState,
        opportunityable_id: prevState.opportunityable_id || model?.id,
    }));
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
    }));

    /**
     * Reset form state and clear errors
     * @function handleReset
     * @returns {void}
     */
    /** Reset form */
    const handleReset = useCallback(() => {
        setData(serverData);
        clearErrors();
    }, [setData, serverData, clearErrors]);

    console.log("currentActionId===", currentActionId);

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

    /** Fetch contact details when modal opens */
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

        const fetchOpportunityDetails = async () => {
            setLoading(true);
            console.log("calling=========");

            try {
                const response = await fetch(showRoute, { signal });
                const json = await response.json();

                console.log("json = ", json);

                if (json?.success && json?.data) {
                    const mergedData = { ...stateDefaults, ...json.data };

                    setData(mergedData);
                    setServerData(mergedData);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Contact not found"),
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
    }, [isModalOpen, showRoute, currentActionId]);

    /**
     * Submit form to create a new opportunity
     *
     * @function handleSubmit
     * @param {React.FormEvent<HTMLFormElement>} e - Form event
     * @param {boolean} [isSaveAndNew=false] - If true, keep modal open for another entry
     * @returns {void}
     */
      /** Submit form */
       const handleSubmit = useCallback(
           (e, isSaveAndNew = false) => {
               e.preventDefault();
               put(
                   route(routeNames.opportunityUpdate, {
                       tenant,
                       opportunity: currentActionId,
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

    /** Input component map */
    const componentMap = useMemo(() => componentMapping(), []);

    /** Render */
    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Edit opportunity"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
            handleReset={handleReset}
            modalType="CREATE"
            showSaveNewBtn={false}
        >
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
        </ModalFormInputsLayout>
    );
}
