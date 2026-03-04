import React, { useCallback, useState, useMemo, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import ProjectCreateModal from "@/Components/Tenant/Operations/Projects/ProjectCreateModal";
import ProjectEditModal from "@/Components/Tenant/Operations/Projects/ProjectEditModal";
import ProjectDeleteModal from "@/Components/Tenant/Operations/Projects/ProjectDeleteModal";
import CommonAddProjectLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddProjectLinkModal";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";

export default function ProjectReport({ dataItems, addLinkBtn = false }) {
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
                route(routeNames.projectUnLink, {
                    tenant,
                    base_id: model?.id,
                    project_id: itemId,
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
                title="Projects"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new project"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
                addLinkBtnText="Link project"
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Description")} as="th" />
                            <TableCell data={__("Owner")} as="th" />
                            <TableCell data={__("Stage")} as="th" />
                            <TableCell data={__("Tag")} as="th" />
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

                                    <TableCell data={item?.details} />
                                    <TableCell data={item?.owner_name} />
                                    <TableCell
                                        data={item?.get_last_stage?.name}
                                    />
                                    <TableCell data={item?.tag_name} />
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
                        label="No project found"
                    />
                )}
            </FormSectionComponent>

            {/* Modals */}
            {isModalOpen && (
                <ProjectCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}
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
                <CommonAddProjectLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
