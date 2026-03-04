import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useContactFormInputs } from "@/hooks/useContactFormInputs";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { useRoute } from "ziggy";

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
 * @param {string} [props.relatedToType="LEAD"] - Default related type for task.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ContactEditModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
    relatedToType = "LEAD",
    relatedToTypeIsReadOnly = false,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { toastAlert } = usePage().props;

    const {
        tenant,
        routeNames,
        tenantUsers,
        dataSalutations,
        dataSocial,
        dataRelatedTypes,
        model: parentModel,
    } = page.props;

    const [shippingDataCities, setShippingCities] = useState([]);
    const [billingDataCities, setBillingCities] = useState([]);
    const [addressType, setAddressType] = useState("");

    /** Default form state */
    const stateDefaults = useMemo(
        () => ({
            contactable_id: parentModel?.id ?? "",
            causer_id: tenantUsers?.authUser,
            owner_id: tenantUsers?.authUser,
            details: "",
            dob: "",
            email: "",
            last_name: "",
            first_name: "",
            nickname: "",
            mobile_number: "",
            data_designation_id: "",
            social_links: dataSocial,
            shipping_street: "",
            shipping_postal_code: "",
            shipping_city_id: "",
            billing_city_id: "",
            billing_postal_code: "",
            billing_street: "",
            salutation: dataSalutations?.default,
            related_to_type: dataRelatedTypes?.default
                ? dataRelatedTypes?.default
                : "LEAD",
            associates: [],
            tags: [],
            is_active: true,
            is_delete: true,
        }),
        [tenantUsers, dataSalutations]
    );

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        clearErrors,
        transform,
    } = useForm(stateDefaults);

    const countryWiseCities = (countryId, addressType = "") => {
        if (!countryId) return;
        setAddressType(addressType);
        post(
            route(routeNames.countryIdWiseCity, {
                tenant,
                countryId: countryId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => console.log("Status updated successfully!"),
            }
        );
    };

    useEffect(() => {
        if (toastAlert?.cities) {
            console.log("cities ===", toastAlert?.cities);
            const countryCities = toastAlert?.cities;
            if (addressType == "BILLING") {
                setBillingCities(countryCities);
            }
            if (addressType == "SHIPPING") {
                setShippingCities(countryCities);
            }
            // setData("city_id", cityList[0]?.value || "");
        }
    }, [toastAlert]);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /** Transform before submit to ensure contactable_id is always set */
    transform((prevState) => ({
        ...prevState,
        contactable_id: prevState.contactable_id || parentModel?.id,
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
            put(
                route(routeNames.contactsUpdate, {
                    tenant,
                    contact: currentActionId,
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

    /** Async fetch for related data */

    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeMap = routeNames.dataRelatedRoutes ?? {};
                if (data.related_to_type && routeMap[data.related_to_type]) {
                    const response = await fetch(
                        route(routeMap[data.related_to_type], {
                            search: inputValue,
                            tenant,
                        })
                    );
                    const json = await response.json();
                    return json.success ? json.data : [];
                }
                return [];
            } catch {
                return [];
            }
        },
        [routeNames, data.related_to_type, tenant, route]
    );

    /** Contact show route for fetching details */

    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.contactsShow, {
                      tenant,
                      contact: currentActionId,
                      isFormattedShort: false,
                  })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    console.log("currentActionId===", currentActionId);

    /** Fetch contact details when modal opens */
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

        const fetchContactDetails = async () => {
            setLoading(true);
            
            try {
                const response = await fetch(showRoute, { signal });
                const json = await response.json();

                console.log("json = ", json);

                if (json?.success && json?.data) {
                    const mergedData = { ...stateDefaults, ...json.data };

                    setData(mergedData);
                    setServerData(mergedData);
                    setShippingCities(json.data.shippingCities);
                    setBillingCities(json.data.billingCities);
                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Contact not found"),
                        position: "bottom-start",
                    });
                 }
            } catch (err) {
                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch contact details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContactDetails();

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

    /** Pre-rendered sources to pass into input factory hooks */
    const formStateDataSources = useMemo(
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    /** Form inputs built using factory hook */
    const formInputs = useContactFormInputs({
        data,
        setData,
        errors,
        sources: formStateDataSources,
        route,
        handleSubmit,
        processing,
        handleReset,
        handleAsyncCall,
        countryWiseCities,
        shippingDataCities,
        billingDataCities,
    });

    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Edit contact"
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
