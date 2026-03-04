import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { AddLeadLinkSchema } from "@/schemas/tenants/addLeadLinkSchema";
import AsyncSelect from "react-select/async";
import { swalToast } from "@/utils/toast";
import { useRoute } from "ziggy";
import axios from "axios";

/**
 * OrganizationDeleteModal Component
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
export default function CommonAddLeadLinkModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const { model, routeNames, tenant, dataRelatedTypes } = usePage().props;
    const { data, setData, setError, errors, post, processing, clearErrors } =
        useForm({
            related_to_id: model?.id,
            related_to_type: dataRelatedTypes?.default,
            lead_ids: [],
        });

    const [modelDetails, setModelDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!model?.id) {
            swalToast({
                type: "error",
                message: __("Model not found"),
                position: "bottom-start",
            });
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchLeadDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    route(routeNames.leadsLinkData, { search: "", tenant }),
                    { signal }
                );

                const json = await response.json();
                console.log("json ==", json);

                if (json?.success && json?.data) {
                    setModelDetails(json.data);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Data not found"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch lead details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeadDetails();

        return () => controller.abort();
    }, [model?.id]);

    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeKey = routeNames.leadsLinkData;

                let response = await fetch(
                    route(routeKey, { search: inputValue, tenant })
                );
                let json = await response.json();

                if (!json.success) return [];
                return json.data;
            } catch (error) {
                return [];
            }
        },
        [routeNames, tenant, route]
    );

    const loadOptions = (inputValue) => {
        return new Promise((resolve) => {
            if (!modelDetails?.length) return resolve([]);
            const filtered = modelDetails.filter((item) =>
                item.label.toLowerCase().includes(inputValue.toLowerCase())
            );

            resolve(filtered);
        });
    };

    const schema = useMemo(() => AddLeadLinkSchema(__), []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            clearErrors();

            const { error } = schema.validate(
                {
                    lead_ids: data.lead_ids,
                },
                { abortEarly: false }
            );

            if (error) {
                console.log("error ==", error);
                console.log("data ==", data);

                const joiErrors = {};
                error.details.forEach((detail) => {
                    console.log("details==", detail);

                    const field = detail.path[0];
                    joiErrors[field] = detail.message;
                });

                console.log("joi error ==", joiErrors);

                clearErrors();
                setError(joiErrors);
                return;
            }
            post(route(routeNames.addLeadsLink, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
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
        [post, route, routeNames, tenant, setIsModalOpen, swalToast]
    );

    const FieldError = ({ error }) =>
        error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null;

    return (
        <ModalFormInputsLayout
            title={__("Link leads")}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            size="lg"
            processing={processing}
            headerIcon="edit"
            saveText={__("Save")}
            modalType="DELETE"
            handleDelete={handleSubmit}
            showSaveNewBtn={false}
            deleteIcon="save"
        >
            <p className="">{__("Please select leads")}</p>

            <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions={modelDetails}
                loadOptions={handleAsyncCall}
                isLoading={loading}
                onChange={(selected) => {
                    // Extract array of values from selected options
                    const values = selected
                        ? selected.map((item) => item.value)
                        : [];
                    setData("lead_ids", values);
                }}
                placeholder="Select leads..."
                closeMenuOnSelect={false} // Keep menu open after selection
            />
            <FieldError error={errors.lead_ids} />
        </ModalFormInputsLayout>
    );
}
