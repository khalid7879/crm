import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useAttachmentFormInputs } from "@/hooks/useAttachmentFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { TenantAttachmentSchema } from "@/schemas/tenants/tenantAttachmentSchema";

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
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function AttachmentEditModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
    type,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const { tenant, routeNames, tenantUsers, model: parentModel } = page.props;

    const schema = useMemo(() => TenantAttachmentSchema(__), []);

    /** Default form state */
    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            attachmentable_id: parentModel?.id ?? "",
            causer_id: tenantUsers?.authUser,
            id: currentActionId,
            title: "",
            alt_text: "",
            attachment_file: "",
            details: "",
            type: type,
            is_active: true,
        }),
        [tenantUsers]
    );

    const {
        data,
        setData,
        put,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        transform,
    } = useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** Transform data before submit (ensures correct attachmentable_id) */
    transform((data) => ({
        ...data,
        attachmentable_id: data.attachmentable_id
            ? data.attachmentable_id
            : parentModel?.id,
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

            clearErrors();

            const { error } = schema.validate(
                {
                    attachment_file: data.attachment_file,
                },
                { abortEarly: false }
            );

            if (error) {
                const joiErrors = {};
                error.details.forEach((detail) => {
                    const field = detail.path[0];
                    joiErrors[field] = detail.message;
                });

                clearErrors();
                setError(joiErrors);
                return;
            }

            clearErrors();

            const formData = new FormData();
            formData.append("title", data.title ?? "");
            formData.append("causer_id", data.causer_id ?? "");
            formData.append("details", data.details ?? "");
            formData.append("alt_text", data.alt_text ?? "");
            formData.append("is_active", data.is_active ?? 1);
            formData.append("type", data.type ?? "");
            formData.append("id", data.id ?? "");

            if (data.attachment_file instanceof File) {
                formData.append("attachment_file", data.attachment_file);
            }

            post(
                route(routeNames.attachmentsDataUpdate, { tenant }),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        if (!isSaveAndNew) setIsModalOpen(false);
                        handleReset();
                    },
                }
            );
        },
        [data, routeNames, tenant, setIsModalOpen, handleReset, post, route]
    );

    const componentMap = useMemo(() => componentMapping(), []);

    /** Attachment show route for fetching details */
    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.attachmentsShow, {
                      tenant,
                      attachment: currentActionId,
                      isFormattedShort: false,
                  })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    /** Fetch attachment details when modal opens */
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

        const fetchAttachmentDetails = async () => {
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
                        message: __("Attachment not found"),
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

        fetchAttachmentDetails();

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
    const formInputs = useAttachmentFormInputs({
        data,
        setData,
        errors,
        sources: { ...page.props, userOptions },
        route,
        handleSubmit,
        processing,
        handleReset,
    });

    console.log("data", data);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Edit attachment"
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
