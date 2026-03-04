import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { AddProjectLinkSchema } from "@/schemas/tenants/addProjectLinkSchema";
import AsyncSelect from "react-select/async";
import { swalToast } from "@/utils/toast";
import { useRoute } from "ziggy";
import axios from "axios";

export default function CommonAddProjectLinkModal({
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
            project_ids: [],
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

        const fetchProjectDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    route(routeNames.projectsLinkData, {
                        search: "",
                        tenant,
                    }),
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
                        message: __("Failed to fetch project details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();

        return () => controller.abort();
    }, [model?.id]);

    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeKey = routeNames.projectsLinkData;

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

    const schema = useMemo(() => AddProjectLinkSchema(__), []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            clearErrors();

            const { error } = schema.validate(
                {
                    project_ids: data.project_ids,
                },
                { abortEarly: false }
            );

            if (error) {
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
            post(route(routeNames.addProjectsLink, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: () => {
                    swalToast({
                        type: "error",
                        message: __(
                            "Please project the highlighted fields"
                        ),
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
            title={__("Link projects")}
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
            <p className="">{__("Please select projects")}</p>

            <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions={modelDetails}
                loadOptions={handleAsyncCall}
                isLoading={loading}
                onChange={(selected) => {
                    const values = selected
                        ? selected.map((item) => item.value)
                        : [];
                    setData("project_ids", values);
                }}
                placeholder="Select projects..."
                closeMenuOnSelect={false}
            />
            <FieldError error={errors.project_ids} />
        </ModalFormInputsLayout>
    );
}
