import React, { useCallback, useMemo, useState, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import CommonAddLeadLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddLeadLinkModal";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import IconComponent from "@/Components/IconComponent";
import { swalToast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";

export default function LeadReport({ dataItems, addLinkBtn = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const [isDelete, setIsDelete] = useState(true);

    const __ = useTranslations();

    const page = usePage();
    const { model, routeNames, tenant, dataRelatedTypes } = page.props;

    const { data, setData, post, processing, errors, clearErrors } = useForm(
        {}
    );

    if (!isDelete && isModalOpenForDelete) {
        setIsModalOpenForDelete(false);
        swalToast({
            message: __([
                "Access denied: You are not allowed to delete this data.",
            ]),
        });
    }

    const handleUnlink = useCallback(
        (itemId) => {
            post(
                route(routeNames.leadsUnLink, {
                    tenant,
                    base_id: model?.id,
                    parent_id: itemId,
                    related_to_type: dataRelatedTypes?.default,
                }),
                {
                    preserveScroll: true,
                    onError: () => {
                        swalToast({
                            type: "error",
                            message: __("Something went wrong."),
                            position: "bottom-start",
                        });
                    },
                }
            );
        },
        [tenant, model?.id]
    );

    return (
        <>
            <FormSectionComponent
                title="Leads"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new lead"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
                addLinkBtnText="Link a lead"
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data="Name" as="th" />
                            <TableCell data="Title" as="th" />
                            <TableCell data="Organization" as="th" />
                            <TableCell data="Phone" as="th" />
                            <TableCell data="Email" as="th" />
                            <TableCell data="Stage" as="th" />
                            <TableCell data="Time" as="th" />
                            <TableCell data="Owner" as="th" />
                            <TableCell classPosition="text-center">
                                <IconComponent
                                    classList="text-xl text-brandColor"
                                    icon="setting3"
                                />
                            </TableCell>
                        </TableHeadComponent>

                        {/* Table Rows */}
                        <TableBodyComponent>
                            {dataItems.map((item, index) => (
                                <TableTrComponent key={`row_${index}`}>
                                    <TableCell data={item.nickname} />
                                    <TableCell
                                        data={item?.get_designation?.name}
                                    />
                                    <TableCell
                                        data={item?.get_organization?.name}
                                    />
                                    <TableCell data={item.mobile_phone} />
                                    <TableCell data={item.email} />
                                    <TableCell
                                        data={item?.get_last_stage?.name}
                                    />
                                    <TableCell
                                        data={item?.model_time?.create_diff}
                                    />
                                    <TableCell>
                                        {item?.owner?.get_user_reference
                                            ?.routeName ? (
                                            <a
                                                href={
                                                    item.owner
                                                        .get_user_reference
                                                        .routeName
                                                }
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        item.owner
                                                            .get_user_reference
                                                            ?.name || "",
                                                }}
                                            />
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        item?.owner
                                                            ?.get_user_reference
                                                            ?.name || "",
                                                }}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleUnlink(item.id)
                                                }
                                            >
                                                <IconComponent
                                                    icon="unlink"
                                                    size="lg"
                                                    color="brand"
                                                    tooltip="Unlink"
                                                />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableTrComponent>
                            ))}
                        </TableBodyComponent>
                    </TableContainer>
                ) : (
                    <DataNotFoundComponent
                        colspan={10}
                        label="No contact found"
                    />
                )}
            </FormSectionComponent>

            {isAddLinkModalOpen && (
                <CommonAddLeadLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
