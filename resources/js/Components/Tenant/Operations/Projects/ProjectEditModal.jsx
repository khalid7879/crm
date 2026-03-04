import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useProjectFormInputs } from "@/hooks/useProjectFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";

/**
 * OrganizationEditModal Component
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
export default function ProjectEditModal({
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
        dataTags,
        dataCategoriesForProject,
        dataStagesForProject,
        tenantUsers,
        model: parentModel,
    } = page.props;

    const stateDefaults = useMemo(
        () => ({
            projectable_id: parentModel?.id ?? "",
            causer_id: tenantUsers.authUser,
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
        put,
        processing,
        errors,
        clearErrors,
        transform,
        reset,
    } = useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** Transform before submit to ensure taskable_id is always set */
    /** Transform before submit to ensure contactable_id is always set */
    transform((prevState) => ({
        ...prevState,
        projectable_id: prevState.projectable_id || model?.id,
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

    /** Task show route for fetching details */
    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.projectsShow, {
                      tenant,
                      project: currentActionId,
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

        const fetchProjectDetails = async () => {
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

        fetchProjectDetails();

        /* Cleanup: abort fetch if modal closes or component unmounts */
        return () => controller.abort();
    }, [isModalOpen, showRoute, currentActionId]);

    /** Submit form */
    const handleSubmit = useCallback(
        (e, isSaveAndNew = false) => {
            e.preventDefault();
            put(
                route(routeNames.projectsUpdate, {
                    tenant,
                    project: currentActionId,
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

    const componentMap = useMemo(() => componentMapping(), []);

    /** Form inputs built using factory hook */
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

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Edit project"
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
