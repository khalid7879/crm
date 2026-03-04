import React, { useCallback, useMemo } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { useProjectFormInputs } from "@/hooks/useProjectFormInputs";
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
export default function ProjectCreateModal({ isModalOpen, setIsModalOpen, finalStepInfos }) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const {
        tenant,
        routeNames,
        dataTags,
        dataCategoriesForProject,
        dataStagesForProject,
        tenantUsers,
        dataRelatedTypes,
        model : parentModel,
    } = page.props;


    /**
     * Default form state values
     * @constant
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            projectable_id: parentModel?.id ?? "",
            causer_id: tenantUsers.authUser,
            related_to_type: dataRelatedTypes?.default
                ? dataRelatedTypes?.default
                : "LEAD",
            name: "",
            details: "",
            data_category_id: dataCategoriesForProject?.default,
            stage_id: dataStagesForProject?.default,
            owner_id: tenantUsers.authUser,
            associates: [],
            tags: [],
            is_active: true,
            finalStepInfos,
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

    /**
     * Pre-rendered lookup sources for form inputs
     * @constant
     * @type {Object}
     */
   const formStateDataSources = useMemo(
       () => ({
           ...page.props,
           userOptions,
           tagOptions,
       }),
       [page.props, userOptions, tagOptions]
   );

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

            post(route(routeNames.projectsStore, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                   sessionStorage.removeItem("toast_alert");
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

    /** Input component map */
    const componentMap = useMemo(() => componentMapping(), []);

    /** Render */
    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Create new project"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="lg"
            handleReset={handleReset}
            modalType="CREATE"
            showSaveNewBtn={true}
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
