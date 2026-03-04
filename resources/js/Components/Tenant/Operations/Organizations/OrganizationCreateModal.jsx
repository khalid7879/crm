import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useOrganizationFormInputs } from "@/hooks/useOrganizationFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import React, { useCallback, useMemo, useState, useEffect } from "react";
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
export default function OrganizationCreateModal({ isModalOpen, setIsModalOpen }) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { toastAlert } = usePage().props;
    const relatedToDataCollections = [];

    const {
        tenant,
        routeNames,
        tenantUsers,
        dataTags,
        dataCountries,
        dataSocial,
        dataRelatedTypes,
        model: parentModel,
    } = page.props;

    const [shippingDataCities, setShippingCities] = useState([]);
    const [billingDataCities, setBillingCities] = useState([]);
    const [addressType, setAddressType] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            organizationable_id: parentModel?.id ?? "",
            causer_id: tenantUsers?.authUser,
            owner_id: tenantUsers?.authUser,
            related_to_type: dataRelatedTypes?.default
                ? dataRelatedTypes?.default
                : "LEAD",
            name: "",
            details: "",
            website: "",
            mobile_number: "",
            social_links: dataSocial,
            shipping_street: "",
            shipping_postal_code: "",
            shipping_city_id: "",
            billing_city_id: "",
            billing_postal_code: "",
            billing_street: "",
            associates: [],
            tags: [],
            is_active: true,
        }),
        [tenantUsers, dataSocial]
    );

    console.log("Organization ===", page.props);

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm(stateDefaults);

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

    /** Transform data before submit (ensures correct organizationable_id) */
    transform((data) => ({
        ...data,
        organizationable_id: data.organizationable_id
            ? data.organizationable_id
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
            post(route(routeNames.organizationStore, { tenant }), {
                preserveScroll: true,
                onSuccess: () => {
                    !isSaveAndNew ? setIsModalOpen(false) : null;
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
        [
            post,
            route,
            routeNames,
            tenant,
            setIsModalOpen,
            handleReset,
            swalToast,
        ]
    );

    /**
     * Load related model data asynchronously based on user input.
     *
     * @async
     * @function handleAsyncCall
     * @param {string} inputValue - Search term entered by the user
     * @returns {Promise<Array>} - Returns matching related model collection
     */
    const handleAsyncCall = useCallback(
        async (inputValue) => {
            if (!inputValue) return [];

            try {
                const routeMap = routeNames.dataRelatedRoutes ?? {};
                if (
                    data.related_to_type &&
                    routeMap.hasOwnProperty(data.related_to_type)
                ) {
                    const routeKey = routeMap[data.related_to_type];

                    let response = await fetch(
                        route(routeKey, { search: inputValue, tenant })
                    );
                    let json = await response.json();

                    if (!json.success) return [];

                    setData("relatedToDataCollections", json.data);
                    return json.data;
                }
                return [];
            } catch (error) {
                return [];
            }
        },
        [routeNames, data.related_to_type, tenant, setData, route]
    );

    /** Build form inputs dynamically */
    const formInputs = useOrganizationFormInputs({
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
            title="Create new organization"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
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
        </ModalFormInputsLayout>
    );
}
