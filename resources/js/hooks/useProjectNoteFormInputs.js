import {
    makeSection,
    makeTextarea,
} from "@/utils/common/sectionAndFieldFactory";

export const useProjectNoteFormInputs = ({
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
}) => {
    return [
        /*** Task general information ***/
        makeSection({
            title: "",
            // actionProps: {
            //     showActionBtns: false,
            //     submitBtnActionLink: route(
            //         sources.routeNames.leadsCreate,
            //         sources.tenant
            //     ),
            //     goBackLink: route(sources.routeNames.opportunityList, sources.tenant),
            //     handleOnSave,
            //     processing,
            //     handleReset,
            // },
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-x-2 gap-y-1",
            childItems: [
                makeTextarea({
                    field: "details",
                    info: "Project details",
                    data,
                    errors,
                    setData,
                }),
            ],
        }),

    ];
};
