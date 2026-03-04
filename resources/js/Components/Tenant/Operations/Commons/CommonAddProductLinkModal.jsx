import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { AddProductLinkSchema } from "@/schemas/tenants/addProductLinkSchema";
import AsyncSelect from "react-select/async";
import { swalToast } from "@/utils/toast";
import { useRoute } from "ziggy";
import axios from "axios";

export default function CommonAddProductLinkModal({
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
            product_id: "",
            price: "",
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

        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    route(routeNames.productsLinkData, {
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
                        message: __("Failed to fetch product details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();

        return () => controller.abort();
    }, [model?.id]);

    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeKey = routeNames.productsLinkData;

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

    const schema = useMemo(() => AddProductLinkSchema(__), []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            clearErrors();

            const { error } = schema.validate(
                {
                    product_id: data.product_id,
                    price: data.price,
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
            post(route(routeNames.addProductsLink, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: () => {
                    swalToast({
                        type: "error",
                        message: __("Please project the highlighted fields"),
                        position: "bottom-start",
                    });
                },
            });
        },
        [post, route, routeNames, tenant, setIsModalOpen, swalToast]
    );

    const handlePriceSelect = (e) => {
        console.log('data==',e);
        
        setData("product_id", e?.value);
        setData("price", e?.price);
    };

    const FieldError = ({ error }) =>
        error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null;

    return (
        <ModalFormInputsLayout
            title={__("Link product")}
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
            <div>
                <p className="">{__("Please select product")}</p>
                <AsyncSelect
                    cacheOptions
                    defaultOptions={modelDetails}
                    loadOptions={handleAsyncCall}
                    isLoading={loading}
                    onChange={(e) => handlePriceSelect(e)}
                    placeholder="Select product..."
                    closeMenuOnSelect={true}
                />
                <FieldError error={errors.product_id} />
                <label className="">{__("Price")}</label>
                <input
                    type="text"
                    name="price"
                    className="input input-bordered w-full"
                    autoComplete="off"
                    value={data.price}
                    onChange={(e) => setData("price", e.target.value)}
                />
                <FieldError error={errors.price} />
            </div>
        </ModalFormInputsLayout>
    );
}
