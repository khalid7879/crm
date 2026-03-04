import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { OrganizationListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { useOrganizationFormInputs } from "@/hooks/useOrganizationFormInputs";
import {
    OrganizationSchema,
    ValidationAttributes,
} from "@/schemas/tenants/organizationSchema";
import { joiValidation } from "@/utils/joiValidation";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import TabsComponent from "@/Components/Tenant/Addons/TabsComponent";
import ActivitySectionComponent from "@/Components/Tenant/PageComponent/ActivitySectionComponent";
import ActivityNoteSectionComponent from "@/Components/Tenant/PageComponent/ActivityNoteSectionComponent";
import StageDurationTable from "@/Components/Tenant/PageComponent/StageDurationTable";
import RelativesSectionComponent from "@/Components/Tenant/PageComponent/RelativesSectionComponent";
import OverviewComponent from "@/Components/Tenant/PageComponent/OverviewComponent";
import { useRoute } from "ziggy";

/**
 * LeadEditPage Component
 *
 * @author Mamun Hossen
 */
export default function OrganizationEditPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    // const { toastAlert, tenant, routeNames, model } = page.props;
    const {
        toastAlert,
        tenant,
        routeNames,
        tenantUsers,
        model,
        dataRelatedTypes,
        dataSocial,
        modelStages,
    } = page.props;

    console.log("page.props==", page.props);

    /** Default form state */
    const stateDefaults = useMemo(
        () => ({
            organizationable_id: model?.id ?? "",
            causer_id: tenantUsers?.authUser,
            owner_id: tenantUsers?.authUser,
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

    /** Validation */
    const schema = useMemo(() => OrganizationSchema(__), [__]);

    const {
        data,
        setData,
        put,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        transform,
    } = useForm(stateDefaults);

    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);
    const [shippingDataCities, setShippingCities] = useState([]);
    const [billingDataCities, setBillingCities] = useState([]);
    const [addressType, setAddressType] = useState("");

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

    /** Transform before submit to ensure taskable_id is always set */
    transform((prevState) => ({
        ...prevState,
        taskable_id: prevState.taskable_id || model?.id,
    }));

    /** Reset form */
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
                route(routeNames.organizationUpdate, {
                    organization: model?.id,
                    tenant: tenant,
                }),
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        // const updatedModel = page.props.model;
                        // setData(mapModelToFormData(updatedModel, rawDefaults));
                    },
                }
            );
        },
        [
            schema,
            data,
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
        
        /** Show toast alerts from server */
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
        router.reload({ only: [] });

        if (toastAlert?.cities) {
            console.log("cities==", toastAlert?.cities);

            const countryCities = toastAlert?.cities;
            if (addressType == "BILLING") {
                setBillingCities(countryCities);
            }
            if (addressType == "SHIPPING") {
                setShippingCities(countryCities);
            }
        }
    }, [toastAlert]);

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

    const componentMap = useMemo(() => componentMapping(), []);

    /** Task show route for fetching details */
    const currentActionId = model?.id;
    const showRoute = useMemo(
        () =>
            currentActionId
                ? route(routeNames.organizationShow, {
                      tenant,
                      organization: currentActionId,
                      isFormattedShort: false,
                  })
                : null,
        [currentActionId, routeNames, tenant, route]
    );

    /** Fetch organization details when modal opens */

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

        const fetchOrganizationDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(showRoute, { signal });
                const json = await response.json();

                if (json?.success && json?.data) {
                    const mergedData = { ...stateDefaults, ...json.data };

                    setData(mergedData);
                    setServerData(mergedData);
                    setShippingCities(json.data.shippingCities);
                    setBillingCities(json.data.billingCities);
                    console.log("data===", json);

                    clearErrors();
                } else {
                    swalToast({
                        type: "error",
                        message: __("Organization not found"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                console.log("error == ", err);

                if (err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch task details"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizationDetails();

        /* Cleanup: abort fetch if modal closes or component unmounts */
        return () => controller.abort();
    }, [showRoute, currentActionId]);

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
        showActionBtns: true,
        countryWiseCities,
        shippingDataCities,
        billingDataCities,
    });

    return (
        <TenantDashboardLayout
            metaTitle={`${__("Organization")}: ${model?.name}`}
            breadNavItems={[...OrganizationListNavItems, { name: "Edit" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                {/* Stats */}
                <WidgetBasicComponent
                    stats={model?.get_organization_stats}
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
                                        model?.get_organization_stats?.modelData
                                    }
                                    overviewStats={
                                        model?.get_organization_stats
                                            .overview ?? []
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
                                                className={
                                                    section.childGridClass
                                                }
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
                            label: "Ai summary",
                            icon: "time",
                            defaultChecked: false,
                            tabIndex: "ai-summary",
                            content: <h1>ai </h1>,
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
                        {
                            label: "Relatives",
                            icon: "activity",
                            defaultChecked: false,
                            tabIndex: "relatives",
                            content: (
                                <RelativesSectionComponent
                                    needReport={[
                                        "CONTACT",
                                        "OPPORTUNITY",
                                        "LEAD",
                                        "PROJECT",
                                        "LEAD_CONTACT",
                                    ]}
                                    addLinkBtn={true}
                                />
                            ),
                        },
                    ]}
                    className="bg-base-100 border-base-300 text-base-content"
                />
            </div>
        </TenantDashboardLayout>
    );
}
