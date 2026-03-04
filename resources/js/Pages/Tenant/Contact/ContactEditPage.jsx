import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { ContactListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { useContactFormInputs } from "@/hooks/useContactFormInputs";
import {
    ContactSchema,
    ValidationAttributes,
} from "@/schemas/tenants/contactSchema";
import { joiValidation } from "@/utils/joiValidation";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import OverviewComponent from "@/Components/Tenant/PageComponent/OverviewComponent";

/**
 * @component
 * ContactEditPage
 *
 * React component for editing an existing contact record within the tenant dashboard.
 * It integrates form handling with validation, dynamic address management, and related data sections
 * such as notes, activities, and overview stats. The component supports Inertia.js routing and state
 * management while leveraging reusable form and layout components for consistent UX.
 *
 * @returns {JSX.Element} The rendered contact edit page with form sections, tabs, and activity components.
 *
 * @dependencies
 * - @inertiajs/react → Provides `useForm`, `usePage`, and `router` for form state and page props management.
 * - ziggy → Enables Laravel route generation using `useRoute()`.
 * - TenantDashboardLayout → Layout wrapper for tenant pages.
 * - useTranslations → Handles multilingual UI text.
 * - joiValidation & ContactSchema → Validate form inputs using Joi schema definitions.
 * - useContactFormInputs → Custom hook for dynamic contact form input handling.
 * - FormSectionComponent, TabsComponent, OverviewComponent, ActivitySectionComponent, ActivityNoteSectionComponent, StageDurationTable → UI sections and widgets.
 *
 * @state
 * @property {Array} shippingDataCities - Dynamic list of cities for the shipping address.
 * @property {Array} billingDataCities - Dynamic list of cities for the billing address.
 * @property {string} addressType - Indicates which address type (shipping or billing) is being modified.
 * @property {boolean} loading - Indicates whether data is currently being fetched or processed.
 * @property {Object|null} serverData - Stores data fetched from the server for populating the form.
 *
 * @constants
 * @property {Object} stateDefaults - Default form state values used for initializing or resetting the contact form.
 * Includes identity, ownership, personal details, address fields, and relationship data.
 *
 * @inertiaProps
 * @property {Object} tenant - Current tenant’s metadata.
 * @property {Object} routeNames - Named routes used throughout the tenant module.
 * @property {Object} tenantUsers - Authenticated user and related user data.
 * @property {Object} dataSalutations - Available salutations with defaults.
 * @property {Object} dataTags - Available contact tags.
 * @property {Object} dataDesignations - Available contact designations with default selection.
 * @property {Object} dataCountries - List of supported countries for address selection.
 * @property {Object} dataSocial - Default social media link configuration.
 * @property {Object} model - Existing contact data loaded for editing.
 * @property {Object} toastAlert - Backend-generated toast or alert configuration.
 *
 * @example
 * <ContactEditPage />
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function ContactEditPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const relatedToDataCollections = [];

    const {
        toastAlert,
        tenant,
        routeNames,
        tenantUsers,
        dataSalutations,
        dataTags,
        dataDesignations,
        dataCountries,
        dataSocial,
        model,
        modelStages,
    } = page.props;

    const [shippingDataCities, setShippingCities] = useState([]);
    const [billingDataCities, setBillingCities] = useState([]);
    const [addressType, setAddressType] = useState("");
    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);

    /**
     * Default state values for the task form
     * @type {Object}
     */
    const stateDefaults = useMemo(
        () => ({
            contactable_id: model?.id ?? "",
            causer_id: tenantUsers?.authUser,
            owner_id: tenantUsers?.authUser,
            details: "",
            dob: "",
            email: "",
            last_name: "",
            first_name: "",
            nickname: "",
            mobile_number: "",
            data_designation_id: dataDesignations?.default,
            social_links: dataSocial,
            shipping_street: "",
            shipping_postal_code: "",
            shipping_city_id: "",
            billing_city_id: "",
            billing_postal_code: "",
            billing_street: "",
            salutation: dataSalutations?.default,
            associates: [],
            tags: [],
            is_active: true,
        }),
        [tenantUsers, dataSalutations, dataDesignations, dataSocial]
    );

    /** Validation */
    const schema = useMemo(() => ContactSchema(__), [__]);

    const {
        data,
        setData,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        transform,
        post,
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

    /** User options */
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

    /** Transform data before submit (ensures correct taskable_id) */
    transform((data) => ({
        ...data,
        taskable_id: data.taskable_id ? data.taskable_id : model?.id,
    }));

    const handleReset = useCallback(() => {
        setData(serverData);
        clearErrors();
    }, [setData, serverData, clearErrors]);

    /** Submit */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            if (
                !joiValidation(
                    schema,
                    ValidationAttributes(data),
                    setError,
                    clearErrors
                )
            ) {
                swalToast({
                    type: "error",
                    message: __("Please correct the highlighted fields"),
                    position: "bottom-start",
                });
                return;
            }
            put(
                route(routeNames.contactsUpdate, {
                    contact: model?.id,
                    tenant: tenant,
                }),
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const updatedModel = page.props.model;
                    },
                }
            );
        },
        [
            schema,
            data,
            model,
            setError,
            clearErrors,
            put,
            route,
            routeNames,
            tenant,
            __,
            swalToast,
        ]
    );

    /** Toast */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

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

    /** Contact show route for fetching details */
    const currentActionId = model?.id;

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

    /** Fetch task details when modal opens */

    useEffect(() => {
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
                console.log("error == ", err);

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
    }, [showRoute, currentActionId]);

    /** Build form inputs dynamically */
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
        showActionBtns: true,
    });

    const componentMap = useMemo(() => componentMapping(), []);

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Contact")}: ${model?.nickname}`}
            breadNavItems={[...ContactListNavItems, { name: "Edit" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stats */}
                <WidgetBasicComponent
                    stats={model?.get_contact_stats}
                    className="bg-base-100 border border-base-300 rounded-md shadow p-3 text-base-content"
                />
                {/* Tabs */}
                <TabsComponent
                    variant="tabs-lift"
                    tabs={[
                        {
                            label: "Overview",
                            icon: "view",
                            defaultChecked: true,
                            tabIndex: "overview",
                            content: (
                                <OverviewComponent
                                    modelData={
                                        model?.get_contact_stats?.modelData
                                    }
                                    overviewStats={
                                        model?.get_contact_stats.overview ?? []
                                    }
                                    associatedPersons={
                                        model?.get_associated_persons ?? []
                                    }
                                />
                            ),
                        },
                        {
                            label: "Edit",
                            icon: "edit",
                            defaultChecked: false,
                            tabIndex: "general-info",
                            content: (
                                <form>
                                    {formInputs.map((section, sIdx) => (
                                        <FormSectionComponent
                                            key={sIdx}
                                            {...section.parentSection}
                                            className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                                        >
                                            <div
                                                className={`${section.childGridClass} py-3`}
                                            >
                                                {section.childItems.map(
                                                    (field, idx) => {
                                                        const Component =
                                                            componentMap[
                                                                field
                                                                    .componentType
                                                            ];
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
                                                                {__(
                                                                    "No data found"
                                                                )}
                                                            </h1>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </FormSectionComponent>
                                    ))}
                                </form>
                            ),
                        },
                        {
                            label: "Tasks",
                            icon: "activity",
                            defaultChecked: false,
                            tabIndex: "tasks",
                            content: <ActivitySectionComponent />,
                        },
                        {
                            label: "Note",
                            icon: "note",
                            defaultChecked: false,
                            tabIndex: "note",
                            content: <ActivityNoteSectionComponent />,
                        },
                        {
                            label: "Stage history",
                            icon: "time",
                            defaultChecked: true,
                            tabIndex: "history",
                            content: (
                                <StageDurationTable dataList={modelStages} />
                            ),
                        },

                        {
                            label: "Email",
                            icon: "email",
                            defaultChecked: false,
                            tabIndex: "email",
                            content: (
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-100 border-base-300 text-base-content"
                                    placeholder="Write notes here..."
                                />
                            ),
                        },
                        {
                            label: "Sms",
                            icon: "sms",
                            defaultChecked: false,
                            tabIndex: "sms",
                            content: (
                                <p className="text-base-content/80">
                                    Lead history & activities go here...
                                </p>
                            ),
                        },
                        {
                            label: "Tree log",
                            icon: "time",
                            defaultChecked: false,
                            tabIndex: "tree-log",
                            content: <h1>Tree </h1>,
                        },
                    ]}
                    className="bg-base-100 border-base-300 text-base-content"
                />
            </div>
        </TenantDashboardLayout>
    );
}
