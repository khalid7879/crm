import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useAttachmentFormInputs } from "@/hooks/useAttachmentFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { TenantAttachmentSchema } from "@/schemas/tenants/tenantAttachmentSchema";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import React, { useCallback, useMemo } from "react";
import { useRoute } from "ziggy";

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
export default function AttachmentCreateModal({
    isModalOpen,
    setIsModalOpen,
    type,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const { tenant, routeNames, tenantUsers, model: parentModel } = page.props;

    const schema = useMemo(() => TenantAttachmentSchema(__), []);

    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            attachmentable_id: parentModel?.id ?? "",
            causer_id: tenantUsers?.authUser,
            title: "",
            alt_text: "",
            attachment_file: "",
            details: "",
            type: type,
            is_active: true,
        }),
        [tenantUsers]
    );

    const { data, setData, post, processing, errors, clearErrors, setError, transform } =
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
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    /** Transform data before submit (ensures correct noteable_id) */
    transform((data) => ({
        ...data,
        attachmentable_id: data.attachmentable_id
            ? data.attachmentable_id
            : parentModel?.id,
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
            formData.append("title", data.title);
            formData.append("causer_id", data.causer_id ?? "");
            formData.append("details", data.details ?? "");
            formData.append("alt_text", data.alt_text ?? "");
            formData.append("is_active", data.is_active);
            formData.append("type", data.type ?? "");

            if (data.attachment_file instanceof File) {
                formData.append("attachment_file", data.attachment_file);
            }

            post(route(routeNames.attachmentsStore, { tenant }), formData, {
                // forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (!isSaveAndNew) setIsModalOpen(false);
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
        [data, routeNames, tenant, setIsModalOpen, handleReset, post, route]
    );

    /** Build form inputs dynamically */
    const formInputs = useAttachmentFormInputs({
        data,
        setData,
        errors,
        sources: formStateDataSources,
        route,
        handleSubmit,
        processing,
        handleReset,
    });

    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Create new attachment"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="lg"
            handleReset={handleReset}
            modalType="CREATE"
        >
            <form>
                {formInputs.map((section, sIdx) => (
                    <FormSectionComponent
                        key={sIdx}
                        {...section.parentSection}
                        className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                    >
                        <div className={`${section.childGridClass} py-2`}>
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
