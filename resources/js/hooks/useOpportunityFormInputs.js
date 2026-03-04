import {
    makeInput,
    makeSelect,
    makeTextarea,
    makeSection,
    makeMultiSelect,
    makeDatalist
} from "@/utils/common/sectionAndFieldFactory";

export const useOpportunityFormInputs = ({
    data,
    errors,
    setData,
    sources,
    route,
    handleOnSave,
    processing,
    handleReset,
    handleAsyncCall = () => {},
    reset,
    showActionBtns=false,
    handleSubmit,
}) => {
    return [
        /*** Task general information ***/
        makeSection({
            title: "Opportunity general information",
            actionProps: {
                showActionBtns: showActionBtns,
                submitBtnActionLink: route(
                    sources.routeNames?.opportunityCreate,
                    sources.tenant
                ),
                goBackLink: route(sources.routeNames?.opportunityList, sources.tenant),
                handleOnSave,
                handleSubmit,
                processing,
                handleReset,
            },
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeInput({
                    field: "name",
                    data,
                    errors,
                    setData,
                    icon: "edit",
                    info: "Name of opportunity",
                    required: true,
                    classColSpan: "col-span-full",
                }),
                makeTextarea({
                    field: "details",
                    info: "Opportunity details",
                    data,
                    errors,
                    setData,
                }),
                makeDatalist({
                    field: "organization_name",
                    info: "Name of organization",
                    data,
                    errors,
                    setData,
                    icon: "organization",
                    options: sources.organizations,
                    classColSpan: "col-span-full md:col-span-2",
                }),
                makeInput({
                    field: "date_forecast",
                    info: "Forecast close date",
                    data,
                    errors,
                    setData,
                    icon: "date",
                    type: "date",
                    classColSpan: "col-span-full md:col-span-1",
                }),
                makeInput({
                    field: "date_close",
                    info: "Actual close date",
                    data,
                    errors,
                    setData,
                    icon: "date",
                    type: "date",
                    classColSpan: "col-span-full md:col-span-1",
                }),
            ],
        }),

        /*** Additional information ***/
        makeSection({
            title: "Additional information",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeSelect({
                    field: "data_source_id",
                    info: "What is the opportunity source",
                    defaultOptText: "Select source",
                    data,
                    errors,
                    setData,
                    icon: "organization",
                    options: sources.dataSources?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    defaultOptionDisabled: false,
                }),

                makeSelect({
                    field: "data_category_id",
                    info: "Opportunity category",
                    defaultOptText: "Select category",
                    data,
                    errors,
                    setData,
                    icon: "category",
                    options: sources.dataCategoriesForOpportunities?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    defaultOptionDisabled: false,
                }),
                makeSelect({
                    field: "stage_id",
                    info: "Opportunity pipeline stage",
                    defaultOptText: "Select stage",
                    data,
                    errors,
                    setData,
                    icon: "stage",
                    required: true,
                    options: sources.dataStagesForOpportunities?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    extraOnChange: (val) =>
                        setData(
                            "progress_percent",
                            sources.dataStagesForOpportunities?.list[val]
                                .stage_percent
                        ),
                }),
                makeInput({
                    field: "progress_percent",
                    info: "Probability in percent",
                    data,
                    errors,
                    setData,
                    icon: "percentBold",
                    type: "number",
                    min: 0,
                    max: 100,
                    isReadOnly: true,
                    classColSpan: "col-span-full md:col-span-1",
                }),

                makeInput({
                    field: "amount",
                    info: "Opportunity value",
                    data,
                    errors,
                    setData,
                    icon: "dolor",
                    type: "number",
                    classColSpan: "col-span-full md:col-span-1",
                    extraOnChange: (val) => {
                        const n = Number(val);
                        if (!val || n <= 0) {
                            setData("currency", "");
                            setData("data_revenue_type_id", "");
                        }
                    },
                }),
                makeSelect({
                    field: "currency",
                    info: "Currency of the value",
                    defaultOptText: "Select currency",
                    data,
                    errors,
                    setData,
                    icon: "currencyExchange",
                    options: sources.dataCurrencies?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    readOnly: !data.amount || Number(data.amount) <= 0,
                }),

                makeSelect({
                    field: "data_revenue_type_id",
                    info: "Revenue type",
                    defaultOptText: "Select revenue type",
                    data,
                    errors,
                    setData,
                    icon: "currencyType",
                    options: sources.dataRevenueTypes?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    readOnly: !data.amount || Number(data.amount) <= 0,
                }),
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
                    info: "Task owner",
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
