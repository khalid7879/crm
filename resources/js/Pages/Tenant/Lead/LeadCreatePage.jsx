import React, { useEffect, useMemo, useCallback } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import { LeadListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { useTranslations } from "@/hooks/useTranslations";
import TwGeneralFormInput from "@/Components/Tenant/Forms/TwGeneralFormInput";
import TwGeneralFormSelect from "@/Components/Tenant/Forms/TwGeneralFormSelect";
import TwGeneralFormTextarea from "@/Components/Tenant/Forms/TwGeneralFormTextarea";
import TwGeneralFormRadioGroup from "@/Components/Tenant/Forms/TwGeneralFormRadioGroup";
import TwGeneralFormDatalist from "@/Components/Tenant/Forms/TwGeneralFormDatalist";
import RsCreatableComponent from "@/Components/Tenant/Forms/RsCreatableComponent";
import RsSelectableComponent from "@/Components/Tenant/Forms/RsSelectableComponent";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { swalToast } from "@/utils/toast";
import { useLeadFormInputs } from "@/hooks/useLeadFormInputs";
import { LeadSchema, ValidationAttributes } from "@/schemas/tenants/leadSchema";
import { joiValidation } from "@/utils/joiValidation";
/**
 * Lead create page
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function LeadCreatePage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const {
        toastAlert,
        tenant,
        routeNames,
        dataSalutations,
        dataStages,
        dataCategories,
        dataSources,
        tenantUsers,
        dataSocial = [],
        dataPriorities,
        dataContactMethods,
        dataContactTimes,
    } = page.props;

    console.log(page.props);
    

    /** Frontend validation using joi schema */
    const schema = useMemo(() => LeadSchema(__), [__]);

    /** Memoize initial state */
    const stateDefaults = useMemo(
        () => ({
            creator_id: tenantUsers.authUser,
            owner_id: tenantUsers?.authUser || "",
            associates: [],
            salutation: dataSalutations?.default || "",
            first_name: "",
            last_name: "",
            nickname: "",
            data_designation_id: "",
            organization: "",
            stage_id: dataStages?.default || "",
            email: "",
            telephone: "",
            mobile_phone: "",
            alt_mobile_phone: "",
            fax: "",
            website: "",
            employees_count: "",
            data_category_id: dataCategories.default ?? "",
            data_source_id: dataSources?.default || "",
            social_links: dataSocial,
            details: "",
            data_rating_id: "",
            tags: [],
            associateType: "selected",
            is_active: 1,
            data_priority_id: dataPriorities.default,
            preferred_contact_method: dataContactMethods.default,
            preferred_contact_time: dataContactTimes.default,
        }),
        [
            tenantUsers,
            dataSalutations,
            dataStages,
            dataCategories,
            dataSources,
            dataSocial,
            dataPriorities,
            dataContactMethods,
            dataContactTimes,
        ]
    );

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm(stateDefaults);

    /** Handlers */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            /* stop if invalid */
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
            post(route(routeNames.leadsStore, tenant), {
                preserveScroll: true,
            });
        },
        [
            schema,
            ValidationAttributes,
            setError,
            clearErrors,
            post,
            route,
            routeNames.leadsStore,
            tenant,
            swalToast,
        ]
    );

    const handleReset = useCallback(
        (e) => {
            e.preventDefault();
            setData(stateDefaults);
            clearErrors();
        },
        [setData, stateDefaults]
    );

    /** Toast effect */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
            if (toastAlert.type === "success") {
                setData(stateDefaults);
            }
        }
    }, [toastAlert]);

    /** Memoize user options */
    const userOptions = useMemo(
        () =>
            Object.entries(tenantUsers?.list || {}).map(([id, name]) => ({
                value: id,
                label: name,
            })),
        [tenantUsers]
    );

    /** Associates logic */
    useEffect(() => {
        const associatesArray = Array.isArray(data.associates)
            ? data.associates
            : [];

        if (data.associateType === "all") {
            const allUserIds = userOptions.map((u) => u.value);
            const areSame =
                allUserIds.length === associatesArray.length &&
                allUserIds.every((id) => associatesArray.includes(id));
            if (!areSame) {
                setData("associates", allUserIds);
            }
        } else if (
            data.associateType === "selected" &&
            associatesArray.length === userOptions.length
        ) {
            setData("associates", []);
        }
    }, [data.associateType, userOptions, data.associates, setData]);

    /** State sources */
    const formStateSources = useMemo(
        () => ({ ...page.props, userOptions }),
        [page.props, userOptions]
    );

    const formInputs = useLeadFormInputs({
        data,
        errors,
        setData,
        sources: formStateSources,
        route,
        routeNames,
        tenant,
        handleSubmit,
        processing,
        handleReset,
    });

    /** Component mapping */
    const componentMap = useMemo(
        () => ({
            TwGeneralFormInput,
            TwGeneralFormSelect,
            TwGeneralFormDatalist,
            TwGeneralFormTextarea,
            RsCreatableComponent,
            TwGeneralFormRadioGroup,
            RsSelectableComponent,
        }),
        []
    );

    return (
        <TenantDashboardLayout
            metaTitle={__("Create lead")}
            breadNavItems={[...LeadListNavItems, { name: "Create" }]}
        >
            <div className="w-full bg-base-100 pt-2 pb-10 px-3 rounded-md shadow border border-base-300">
                <form>
                    {formInputs.map((section, sIdx) => (
                        <FormSectionComponent
                            key={sIdx}
                            {...section.parentSection}
                        >
                            <div className={`${section.childGridClass} py-2`}>
                                {section.childItems.map((field, idx) => {
                                    const Component =
                                        componentMap[field.componentType];
                                    return Component ? (
                                        <Component
                                            key={`${sIdx}_${idx}`}
                                            {...field}
                                        />
                                    ) : (
                                        <h1 key={`${sIdx}_${idx}`}>Invalid</h1>
                                    );
                                })}
                            </div>
                        </FormSectionComponent>
                    ))}
                </form>
            </div>
        </TenantDashboardLayout>
    );
}
