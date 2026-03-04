import {
    makeInput,
    makeSelect,
    makeTextarea,
    makeSection,
    makeMultiSelect,
    makeDatalist
} from "@/utils/common/sectionAndFieldFactory";

export const useProjectFormInputs = ({
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
    handleSubmit,
    showActionBtns=false,
}) => {
    return [
        /*** Task general information ***/
        makeSection({
            title: "Project general information",
            actionProps: {
                showActionBtns: showActionBtns,
                submitBtnActionLink: route(
                    sources.routeNames?.projectsCreate,
                    sources.tenant
                ),
                goBackLink: route(sources.routeNames?.projectsList, sources.tenant),
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
                    info: "Name of project",
                    required: true,
                    classColSpan: "col-span-full",
                }),
                makeTextarea({
                    field: "details",
                    info: "Project details",
                    data,
                    errors,
                    setData,
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
                    field: "data_category_id",
                    info: "Project category",
                    defaultOptText: "Select category",
                    data,
                    errors,
                    setData,
                    icon: "category",
                    options: sources.dataCategoriesForProject?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    defaultOptionDisabled: false,
                }),
                makeSelect({
                    field: "stage_id",
                    info: "Project pipeline stage",
                    defaultOptText: "Select stage",
                    data,
                    errors,
                    setData,
                    icon: "stage",
                    required: true,
                    options: sources.dataStagesForProject?.list,
                    classColSpan: "col-span-full md:col-span-1",
                    extraOnChange: (val) =>
                        setData(
                            "progress_percent",
                            sources.dataStagesForProject?.list[val]
                                .stage_percent
                        ),
                }),
                {
                    componentType: "RsCreatableComponent",
                    classColSpan: "col-span-full",
                    info: "Project tags",
                    isMulti: true,
                    isCreatable: true,
                    // ✅ Correct value: reflect selected tags
                    value: Array.isArray(data?.tags)
                        ? data.tags.map(tag => ({ label: tag, value: tag }))
                        : [],
                    // ✅ Options: from available tag list
                    options: Array.isArray(sources.dataTags?.list)
                        ? sources.dataTags?.list.map(tag => ({ label: tag, value: tag }))
                        : [],
                    onChange: (selectedOptions) => {
                        const tags = selectedOptions?.map(opt => opt.value) || [];
                        setData("tags", tags);
                    },
                }
            
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
                    info: "Project owner",
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
