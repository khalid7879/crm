import React, { useState, useEffect, useCallback } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { swalToast } from "@/utils/toast";
import IconComponent from "@/Components/IconComponent";

/**
 * CommonSampleDeleteModal Component
 *
 * Displays a confirmation modal to delete "sample" data associated with a given model.
 * It shows the total count of sample records and handles the deletion request via Inertia.
 *
 * @component
 * @example
 * <CommonSampleDeleteModal
 *   isModalOpen={isModalOpen}
 *   setIsModalOpen={setIsModalOpen}
 *   sampleData={{ sampleData: { data: 12, model: "Lead" } }}
 *   actionRoute="tenant.sample.delete"
 * />
 *
 * @param {Object} props
 * @param {boolean} props.isModalOpen - Controls modal visibility.
 * @param {Function} props.setIsModalOpen - Function to toggle modal state.
 * @param {Object} props.sampleData - Object containing sample data from the backend.
 * @param {string} props.actionRoute - Named route for the delete action.
 *
 * @returns {JSX.Element} A modal that confirms deletion of sample data.
 *
 * @author Mamun
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function CommonSampleDeleteModal({
    isModalOpen,
    setIsModalOpen,
    sampleData = {},
    actionRoute,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const { tenant, toastAlert } = usePage().props;

    const [sampleCount, setSampleCount] = useState(null);
    const [model, setModel] = useState(null);

    const { post, processing } = useForm();

    /** Sync data from controller response */
    useEffect(() => {
        const data = sampleData?.sampleData;
        if (data?.data !== undefined) {
            setSampleCount(data.data);
            setModel(data.model);
        }
    }, [sampleData]);

    /** Handle delete request */
    const handleDelete = useCallback(() => {
        if (!model) return;

        post(
            route(actionRoute, {
                tenant,
                model: model,
                action: "delete",
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('success');
                    
                    swalToast({
                        ...toastAlert,
                        message: __("Data deleted successfully!"),
                    });
                    setIsModalOpen(false);
                },
            }
        );
    }, [
        model,
        tenant,
        post,
        route,
        actionRoute,
        toastAlert,
        setIsModalOpen,
        __,
    ]);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title={__("Delete sample data")}
            headerIcon="delete"
            confirmText={__("Yes")}
            cancelText={__("Cancel")}
            processing={processing}
            size="md"
            modalType="DELETE"
            showSaveNewBtn={false}
            saveText={__("Yes, delete sample data")}
            handleDelete={handleDelete}
        >
            <div className="space-y-2">
                {/* Warning alert */}
                <div className="p-2 alert alert-error bg-red-50 border border-red-200 text-red-700 shadow-sm rounded-md">
                    <IconComponent icon="alert" classList="text-xl" />
                    <div>
                        <h3 className="font-semibold text-[14px]">
                            {__("Proceed with caution")}
                        </h3>
                        <p className="text-[12px]">
                            {__(
                                "Deleting sample data may also remove related dependent records. Please confirm before proceeding."
                            )}
                        </p>
                    </div>
                </div>

                {/* Record count info */}
                <div className="flex items-center justify-center p-2 min-h-20 border border-gray-200 bg-base-100 rounded-xl text-center shadow-sm hover:shadow-md transition-all duration-200">
                    {sampleCount === null ? (
                        <LoadingSpinner
                            title="Loading sample data"
                            size="sm"
                            style="ring"
                            color="secondary"
                        />
                    ) : sampleCount > 0 ? (
                        <article className="flex flex-col items-center justify-center">
                            <p className="text-gray-500 text-md font-medium">
                                {__(
                                    "There are varCount sample records found for model varModel",
                                    { count: sampleCount, model: model }
                                )}
                            </p>
                            <p className="text-gray-500/50 text-sm mt-1">
                                {__("Do you want to delete them permanently")}
                            </p>
                        </article>
                    ) : (
                        <p className="text-success font-medium">
                            {__("No non-sample data found to delete.")}
                        </p>
                    )}
                </div>
            </div>
        </ModalFormInputsLayout>
    );
}
