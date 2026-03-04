import React, { useCallback, useState, useMemo, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import OrganizationCreateModal from "@/Components/Tenant/Operations/Organizations/OrganizationCreateModal";
import OrganizationEditModal from "@/Components/Tenant/Operations/Organizations/OrganizationEditModal";
import OrganizationDeleteModal from "@/Components/Tenant/Operations/Organizations/OrganizationDeleteModal";
import CommonAddOrganizationLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddOrganizationLinkModal";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";

export default function OrganizationReport({ dataItems, addLinkBtn = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const __ = useTranslations();

    const page = usePage();
    const { model, routeNames, tenant, dataRelatedTypes } = page.props;

    const { data, setData, post, processing, errors, clearErrors } = useForm(
        {}
    );

    const handleUnlink = useCallback(
        (itemId) => {
            post(
                route(routeNames.organizationUnLink, {
                    tenant,
                    base_id: model?.id,
                    organization_id: itemId,
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
                title="Organizations"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new organization"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
                addLinkBtnText="Link organization"
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Phone")} as="th" />
                            <TableCell data={__("Owner")} as="th" />
                            <TableCell data={__("Website")} as="th" />
                            <TableCell data={__("Description")} as="th" />
                            <TableCell data={__("Created at")} as="th" />
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
                                    <TableCell
                                        data={item?.name}
                                        isDataIcon={true}
                                        dataIconLetter={item?.first_letter}
                                        dataAsLink={item?.actions_links?.edit}
                                    />
                                    <TableCell data={item?.mobile_number} />
                                    <TableCell data={item?.owner_name} />
                                    <TableCell data={item?.website} />
                                    <TableCell data={item?.details} />
                                    <TableCell
                                        data={
                                            item?.model_time?.create_date_only
                                        }
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
                                                icon="delete"
                                                size="lg"
                                                color="brand"
                                                tooltip="Delete"
                                                callback={() => {
                                                    setCurrentActionId(item.id);
                                                    setIsModalOpenForDelete(
                                                        true
                                                    );
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
                        label="No organization found"
                    />
                )}
            </FormSectionComponent>

            {/* Modals */}
            {isModalOpen && (
                <OrganizationCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}
            {isModalOpenForEdit && (
                <OrganizationEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                />
            )}

            {isModalOpenForDelete && (
                <OrganizationDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}

            {isAddLinkModalOpen && (
                <CommonAddOrganizationLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
