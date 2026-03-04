import {
    makeFile,
    makeInput,
    makeSelect,
    makeTextarea,
    makeSection,
    makeMultiSelect,
    makeAsyncSelect,
} from "@/utils/common/sectionAndFieldFactory";


export const useAttachmentFormInputs = ({
    data,
    errors,
    setData,
    sources,
    route,
    handleOnSave,
    processing,
    handleReset,
}) => {
    console.log('Use attachment input = ',data);
    
    return [
        /*** Task general information ***/
        makeSection({
            title: "Attachment general information",
            actionProps: {
                showActionBtns: false,
                submitBtnActionLink: route(
                    sources.routeNames?.attachmentsCreate,
                    sources.tenant
                ),
                goBackLink: route(sources.routeNames?.attachmentsList, sources.tenant),
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
                    info: "Attachment title",
                    required: false,
                    classColSpan: "col-span-full",
                }),
                makeTextarea({
                    field: "details",
                    data,
                    errors,
                    setData,
                    info: "Attachment details",
                }),
                 makeInput({
                    field: "alt_text",
                    data,
                    errors,
                    setData,
                    icon: "edit",
                    info: "Attachment alt text",
                    required: false,
                    classColSpan: "col-span-full",
                }),
            ],
        }),

        /*** Permissions ***/
        makeSection({
            title: "Attachment",
            classList: "pt-6",
            childGridClass:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-x-4 gap-y-1",
            childItems: [
                makeFile({
                    field:"attachment_file",
                    data,
                    errors,
                    setData,
                    icon: "attachment",
                    info: "Attachment file(png,jpg,jpeg,mp3,txt,docx,doc,ppt,pptx,webp,pdf,xlsx,xls,mp4)",
                    required: true,
                    classColSpan: "col-span-full md:col-span-1",
                }),
            ],
        }),
    ];
};
