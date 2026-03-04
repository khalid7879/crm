import React, { useCallback, useMemo, useState, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import ContactEditModal from "@/Components/Tenant/Operations/Contacts/ContactEditModal";
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

export default function LeadContactReport({ dataItems, addLinkBtn = false }) {
    const __ = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");

    const page = usePage();
    const { model, routeNames, tenant } = page.props;

    const { data, setData, post, processing, errors, clearErrors } = useForm(
        {}
    );

    const handleUnlink = useCallback(
        (itemId, leadId) => {
            post(
                route(routeNames.contactUnLink, {
                    tenant,
                    base_id: leadId,
                    parent_id: itemId,
                    related_to_type: "LEAD",
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
        [tenant]
    );

    return (
        <>
            <FormSectionComponent
                title="Lead contacts"
                showActionBtns={false}
                classesParentSection="mt-3"
                iconTitle="Add new lead contact"
                addLinkBtn={addLinkBtn}
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data="Name" as="th" />
                            <TableCell data="Email" as="th" />
                            <TableCell data="Lead" as="th" />
                            <TableCell data="Mobile" as="th" />
                            <TableCell data="Owner" as="th" />
                            <TableCell data="Created At" as="th" />
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
                                    <TableCell data={item.email} />
                                    <TableCell data={item.lead_name} />
                                    <TableCell data={item.mobile_number} />
                                    <TableCell data={item.owner_name} />
                                    <TableCell
                                        data={item.model_time?.create_date_only}
                                    />

                                    <TableCell>
                                        <div className="flex gap-3">
                                            <IconComponent
                                                icon="edit"
                                                size="lg"
                                                color="gray5"
                                                tooltip="Edit"
                                                callback={() => {
                                                    setCurrentActionId(item.id);
                                                    setIsModalOpenForEdit(true);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleUnlink(
                                                        item.id,
                                                        item?.lead_id
                                                    )
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
            {isModalOpenForEdit && (
                <ContactEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
