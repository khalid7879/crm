import React, { useCallback, useMemo, useState, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import CommonAddContactLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddContactLinkModal";
import ContactCreateModal from "@/Components/Tenant/Operations/Contacts/ContactCreateModal";
import ContactEditModal from "@/Components/Tenant/Operations/Contacts/ContactEditModal";
import ContactDeleteModal from "@/Components/Tenant/Operations/Contacts/ContactDeleteModal";
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

export default function ContactReport({ dataItems, addLinkBtn = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const [isDelete, setIsDelete] = useState(true);

    const __ = useTranslations();

    const page = usePage();
    const { model, routeNames, tenant, dataRelatedTypes } = page.props;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm({});

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
                route(routeNames.contactUnLink, {
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
                title="Contacts"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new contact"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data="Name" as="th" />
                            <TableCell data="Email" as="th" />
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
                                            <IconComponent
                                                icon={
                                                    item?.is_delete == 0
                                                        ? "notDelete"
                                                        : "delete"
                                                }
                                                size="lg"
                                                color="brand"
                                                tooltip={
                                                    item?.is_delete == 0
                                                        ? "Not Deleted"
                                                        : "Deleted"
                                                }
                                                callback={() => {
                                                    setCurrentActionId(item.id);
                                                    setIsModalOpenForDelete(
                                                        true
                                                    );
                                                    setIsDelete(item.is_delete);
                                                }}
                                            />
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

            {/* Modals */}
            {isModalOpen && (
                <ContactCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}

            {isModalOpenForDelete && isDelete && (
                <ContactDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}

            {isModalOpenForEdit && (
                <ContactEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                />
            )}

            {isAddLinkModalOpen && (
                <CommonAddContactLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
