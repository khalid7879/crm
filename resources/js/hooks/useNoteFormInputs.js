import {
    makeInput,
    makeSelect,
    makeTextarea,
    makeSection,
    makeMultiSelect,
    makeAsyncSelect,
} from "@/utils/common/sectionAndFieldFactory";

export const useNoteFormInputs = ({
    data,
    errors,
    setData,
    sources,
    route,
    handleOnSave,
    processing,
    handleReset,
    handleAsyncCall = () => {},
}) => {
    console.log('Use task input = ',data);
    
    return [
        /*** Task general information ***/
        makeSection({
            title: "Note general information",
            actionProps: {
                showActionBtns: false,
                submitBtnActionLink: route(
                    sources.routeNames.leadsCreate,
                    sources.tenant
                ),
                goBackLink: route(sources.routeNames.leadsList, sources.tenant),
                handleOnSave,
                processing,
                handleReset,
            },
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeInput({
                    field: "title",
                    data,
                    errors,
                    setData,
                    icon: "edit",
                    info: "Note title",
                    required: true,
                    classColSpan: "col-span-full",
                }),
                makeTextarea({
                    field: "details",
                    data,
                    errors,
                    setData,
                    info: "Note details",
                }),
                makeInput({
                    field: "date_reminder",
                    data,
                    errors,
                    setData,
                    icon: "date",
                    info: "Date time",
                    type: "datetime-local",
                    classColSpan: "col-span-full md:col-span-1",
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
                    info: "Note owner",
                    required: true,
                    options: sources.tenantUsers.list,
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
