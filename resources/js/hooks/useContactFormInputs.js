import {
    makeInput,
    makeSelect,
    makeTextarea,
    makeSection,
    makeMultiSelect,
    makeAsyncSelect,
} from "@/utils/common/sectionAndFieldFactory";

export const useContactFormInputs = ({
    data,
    errors,
    setData,
    sources,
    route,
    handleOnSave,
    processing,
    handleReset,
    handleAsyncCall = () => {},
    countryWiseCities,
    shippingDataCities,
    billingDataCities,
    showActionBtns = false,
    handleSubmit,
}) => {
    return [
        /*** Contact general information ***/
        makeSection({
            title: "Contact general information",
            actionProps: {
                showActionBtns: showActionBtns,
                submitBtnActionLink: route(
                    sources.routeNames?.contactsCreate,
                    sources.tenant
                ),
                goBackLink: route(
                    sources.routeNames?.contactsList,
                    sources.tenant
                ),
                handleOnSave,
                handleSubmit,
                processing,
                handleReset,
            },
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeSelect({
                    field: "salutation",
                    data,
                    errors,
                    setData,
                    icon: "usersOwner",
                    info: "Salutations mr or mrs",
                    required: false,
                    options: sources.dataSalutations?.list,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeInput({
                    field: "nickname",
                    data,
                    errors,
                    setData,
                    icon: "nameNick",
                    info: "Nickname",
                    required: true,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeInput({
                    field: "first_name",
                    data,
                    errors,
                    setData,
                    icon: "nameFirst",
                    info: "First name",
                    required: false,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeInput({
                    field: "last_name",
                    data,
                    errors,
                    setData,
                    icon: "nameLast",
                    info: "Last name",
                    required: false,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeSelect({
                    field: "data_designation_id",
                    data,
                    errors,
                    setData,
                    icon: "designation",
                    info: "Title or designation",
                    required: false,
                    options: sources.dataDesignations,
                    classColSpan: "col-span-full md:col-span-1",
                }),
            ],
        }),

        /*** Contact Details ***/
        makeSection({
            title: "Contact details",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeInput({
                    field: "email",
                    data,
                    errors,
                    setData,
                    icon: "email",
                    info: "Email address",
                    required: false,
                    classColSpan: "col-span-full md:col-span-1",
                }),

                makeInput({
                    field: "mobile_number",
                    data,
                    errors,
                    setData,
                    icon: "mobile",
                    info: "Mobile number",
                    required: false,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeInput({
                    field: "dob",
                    data,
                    errors,
                    setData,
                    icon: "date",
                    info: "Date of birth",
                    type: "date",
                    classColSpan: "col-span-full md:col-span-1",
                }),
                ...(data.social_links
                    ? Object.entries(data.social_links).map(([id, item]) => ({
                          componentType: "TwGeneralFormInput",
                          info: item.name,
                          icon: item.icon || "link",
                          type: "url",
                          value: item.value,
                          error:
                              errors?.social_links?.[id]?.value ||
                              errors?.[`social_links.${id}.value`] ||
                              "",
                          onChange: (e) =>
                              setData("social_links", {
                                  ...data.social_links,
                                  [id]: {
                                      ...item,
                                      value: e.target.value,
                                  },
                              }),
                      }))
                    : []),
            ],
        }),

        /*** Address information ***/
        makeSection({
            title: "Shipping address information",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeSelect({
                    field: "shipping_country_id",
                    data,
                    errors,
                    setData,
                    icon: "country",
                    info: "Country",
                    required: false,
                    options: sources.dataCountries?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    onChange: (value) => {
                        setData("shipping_country_id", value || "");
                        countryWiseCities?.(value, "SHIPPING");
                    },
                }),
                makeSelect({
                    field: "shipping_city_id",
                    data,
                    errors,
                    setData,
                    icon: "city",
                    info: "City",
                    required: false,
                    options: shippingDataCities?.list,
                    classColSpan: "col-span-full md:col-span-1",
                }),

                makeInput({
                    field: "shipping_postal_code",
                    data,
                    errors,
                    setData,
                    icon: "postalCode",
                    required: false,
                    info: "Shipping postal code",
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeTextarea({
                    field: "shipping_street",
                    data,
                    errors,
                    setData,
                    required: false,
                    info: "Shipping street",
                    classColSpan: "col-span-full",
                    rows: "2",
                }),
            ],
        }),
        makeSection({
            title: "Billing address information",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeSelect({
                    field: "billing_country_id",
                    data,
                    errors,
                    setData,
                    icon: "country",
                    info: "Country",
                    required: false,
                    options: sources.dataCountries?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    onChange: (value) => {
                        setData("billing_country_id", value || "");
                        countryWiseCities?.(value, "BILLING"); // ✅ call parent function
                    },
                }),
                makeSelect({
                    field: "billing_city_id",
                    data,
                    errors,
                    setData,
                    icon: "city",
                    info: "City",
                    required: false,
                    options: billingDataCities?.list,
                    classColSpan: "col-span-full md:col-span-1",
                }),

                makeInput({
                    field: "billing_postal_code",
                    data,
                    errors,
                    setData,
                    icon: "postalCode",
                    required: false,
                    info: "Billing postal code",
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeTextarea({
                    field: "billing_street",
                    data,
                    errors,
                    setData,
                    required: false,
                    info: "Billing street",
                    classColSpan: "col-span-full",
                    rows: "2",
                }),
            ],
        }),

        /*** Additional information ***/
        makeSection({
            title: "Additional information",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeTextarea({
                    field: "details",
                    data,
                    errors,
                    setData,
                    info: "Contact details",
                }),
                {
                    componentType: "RsCreatableComponent",
                    classColSpan: "col-span-full",
                    info: "Contact tags",
                    isMulti: true,
                    isCreatable: true,
                    // ✅ Correct value: reflect selected tags
                    value: Array.isArray(data?.tags)
                        ? data.tags.map((tag) => ({ label: tag, value: tag }))
                        : [],
                    // ✅ Options: from available tag list
                    options: Array.isArray(sources.dataTags?.list)
                        ? sources.dataTags.list.map((tag) => ({
                              label: tag,
                              value: tag,
                          }))
                        : [],
                    onChange: (selectedOptions) => {
                        const tags =
                            selectedOptions?.map((opt) => opt.value) || [];
                        setData("tags", tags);
                    },
                },
            ],
        }),

        /*** Permissions ***/
        makeSection({
            title: "Permissions",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeSelect({
                    field: "owner_id",
                    data,
                    errors,
                    setData,
                    icon: "usersOwner",
                    info: "Contact owner",
                    required: true,
                    options: sources.tenantUsers?.list,
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeMultiSelect({
                    field: "associates",
                    data,
                    errors,
                    setData,
                    options: sources.userOptions,
                    info: "Select associates",
                    icon: "users3",
                    classColSpan: "col-span-full",
                }),
            ],
        }),
    ];
};
