import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { swalToast } from "@/utils/toast";

/**
 * TaskDeleteModal Component
 *
 * Renders a modal to confirm deletion of a task. Displays task details
 * in a side-by-side list layout and allows the user to delete the task via backend.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isModalOpen - Whether the modal is currently open
 * @param {Function} props.setIsModalOpen - Function to toggle modal visibility
 * @param {number|string|null} props.currentActionId - ID of the task to delete
 *
 * @returns {JSX.Element} The TaskDeleteModal component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function NoteDeleteModal({ isModalOpen, setIsModalOpen, currentActionId }) {
    const __ = useTranslations();
    const route = useRoute();
    const { routeNames, tenant } = usePage().props;
    const { delete: destroy, processing } = useForm();

    /**
     * Task details fetched from backend.
     * @type {Array<{label: string, value: string}> | null}
     */
    const [modelDetails, setModelDetails] = useState(null);

    /**
     * Precompute the route to fetch task details.
     * @type {string | null}
     */
    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.notesShow, { note: currentActionId, tenant })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    /**
     * Precompute the route to delete the task.
     * @type {string | null}
     */
    const deleteRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.notesDelete, {
                      note: currentActionId,
                      tenant,
                  })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    /**
     * Fetch task details from the backend when the modal opens.
     * Sets the `modelDetails` state with the fetched data.
     *
     * @async
     */
    useEffect(() => {
        if (!isModalOpen || !showRoute) {
            swalToast({
                type: "error",
                message: __("Task not found"),
                position: "bottom-start",
            });
            return;
        }

        const fetchTaskDetails = async () => {
            try {
                const response = await fetch(showRoute);
                const json = await response.json();

                if (json?.success) {
                    setModelDetails(json.data);
                } else {
                    setModelDetails(null);
                }
            } catch (err) {
                setModelDetails(null);
            }
        };

        fetchTaskDetails();
        return () => {
            setModelDetails(null);
        };
    }, [isModalOpen, showRoute]);

    /**
     * Handles deletion of the task.
     * Calls the Inertia delete route and closes modal on success.
     */
    const handleDelete = useCallback(() => {
        if (!deleteRoute) return;

        destroy(deleteRoute, {
            preserveScroll: true,
            onSuccess: () => setIsModalOpen(false),
        });
    }, [deleteRoute, destroy, setIsModalOpen]);

    return (
        <ModalFormInputsLayout
            title={__("Delete note text")}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            size="md"
            processing={processing}
            headerIcon="delete"
            saveText={__("Yes delete the note text")}
            handleDelete={handleDelete}
            modalType="DELETE"
            showSaveNewBtn={false}
        >
            <ul className="list bg-base-100 rounded-box shadow-md divide-y divide-gray-200">
                {/* Confirmation message */}
                <li className="py-2 px-1 text-[14px] font-semibold text-red-600 tracking-wide">
                    {__("Are you sure to delete this task")}
                </li>

                {/* Task details list */}
                {modelDetails && modelDetails.length > 0 ? (
                    modelDetails.map((item, index) => (
                        <li
                            key={index}
                            className="flex flex-col md:flex-row md:items-center py-2 px-1 text-sm gap-y-1 md:gap-x-2"
                        >
                            <span className="font-semibold text-base-content/70">
                                {`${item.label}:`}
                            </span>
                            <span className="text-sm text-base-content/70">
                                {item.value}
                            </span>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-sm text-gray-500 italic">
                        <LoadingSpinner />
                    </li>
                )}
            </ul>
        </ModalFormInputsLayout>
    );
}
