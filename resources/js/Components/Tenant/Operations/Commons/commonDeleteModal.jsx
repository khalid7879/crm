import React, { useState, useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { swalToast } from "@/utils/toast";

export default function CommonDeleteModal({
    isModalOpen,
    setIsModalOpen,
    deleteData = {},
    actionRoute,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const { routeNames, tenant, toastAlert } = usePage().props;

    /* Local state to track which delete items are active (checked) */

    const [deleteItems, setDeleteItems] = useState({});

    useEffect(() => {
        if (
            deleteData?.deleteItems &&
            Object.keys(deleteData?.deleteItems).length > 0
        ) {
            setDeleteItems(deleteData?.deleteItems);
        }
    }, [deleteData]);

    /* Toggle checkbox (update isActive dynamically) */

    const handleCheckboxChange = (key) => {
        setDeleteItems((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                isActive: prev[key].isActive ? 0 : 1,
            },
        }));
    };

    {
        /* Prepare and send delete request */
    }
    const { post, put, processing } = useForm();

    const handleDelete = () => {
        /* Prepare data like { task: 1, note: 0 */
        const payload = Object.entries(deleteItems).reduce(
            (acc, [key, value]) => {
                acc[key] = value.isActive ? 1 : 0;
                return acc;
            },
            {}
        );

        /*Merge with id and send delete request*/

        const finalPayload = { ...payload, id: deleteData?.id };

        console.log("Delete payload:", finalPayload);

        post(
            route(actionRoute, {
                tenant,
                finalPayload,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    swalToast({
                        ...toastAlert,
                        message: __("Data deleted successfully!"),
                    });
                    setIsModalOpen(false);
                },
            }
        );
    };

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title={__("Delete Data")}
            headerIcon="delete"
            confirmText={__("Yes")}
            showSaveNewBtn={false}
            cancelText={__("Cancel")}
            processing={processing}
            size="lg"
            modalType="DELETE"
            saveText={__("Yes, delete selected items")}
            handleDelete={handleDelete}
        >
            <div className="space-y-4">
                {/* Instruction alert */}
                <p className="border border-red-600 rounded p-3 text-sm text-red-600">
                    {__(
                        "Select which related data you want to delete (e.g., tasks, notes). Uncheck items you want to keep."
                    )}
                </p>

                {Object.keys(deleteItems).length > 0 ? (
                    <div className="grid gap-3">
                        {Object.entries(deleteItems).map(([key, value]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between border-b pb-2"
                            >
                                <div>
                                    <span className="block text-xs uppercase font-semibold text-gray-500">
                                        {value.label}
                                    </span>
                                    <span className="text-sm text-gray-800">
                                        Count: {value.count ?? "-"}
                                    </span>
                                </div>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-error"
                                        checked={!!value.isActive}
                                        onChange={() =>
                                            handleCheckboxChange(key)
                                        }
                                    />
                                    <span className="text-xs text-gray-600">
                                        {value.isActive
                                            ? __("Delete")
                                            : __("Keep")}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                ) : null}

                {!deleteData && (
                    <div className="p-4 text-sm text-gray-500 italic flex items-center gap-2">
                        <LoadingSpinner /> {__("Loading data...")}
                    </div>
                )}
                {deleteData && Object.keys(deleteItems).length <= 0 && (
                    <div className="p-4 text-sm text-gray-500 italic flex items-center justify-center gap-2 border rounded-md">
                        <p>{__("No dependency data found")}</p>
                    </div>
                )}
            </div>
        </ModalFormInputsLayout>
    );
}
