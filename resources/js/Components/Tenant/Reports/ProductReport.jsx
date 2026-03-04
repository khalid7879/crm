import React, { useCallback, useState, useMemo, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import ProjectEditModal from "@/Components/Tenant/Operations/Projects/ProjectEditModal";
import ProjectDeleteModal from "@/Components/Tenant/Operations/Projects/ProjectDeleteModal";
import CommonAddProductLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddProductLinkModal";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";

export default function ProductReport({ dataItems, addLinkBtn = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
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
                route(routeNames.productsUnLink, {
                    tenant,
                    base_id: model?.id,
                    product_id: itemId,
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
                title="Product"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new product"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
                addLinkBtnText="Link product"
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Face value")} as="th" />
                            <TableCell data={__("Customize value")} as="th" />
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

                                    <TableCell data={item?.face_value} />
                                    <TableCell data={item?.customized_value} />
                                    <TableCell>
                                        <div className="flex gap-3">
                                            {/* <IconComponent
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
                                            /> */}
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
                        label="No project found"
                    />
                )}
            </FormSectionComponent>

            {/* Modals */}
            {isModalOpenForEdit && (
                <ProjectEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                />
            )}

            {isModalOpenForDelete && (
                <ProjectDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}
            {isAddLinkModalOpen && (
                <CommonAddProductLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
