import React, { useCallback, useState, useMemo, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import OpportunityCreateModal from "@/Components/Tenant/Operations/Opportunities/OpportunityCreateModal";
import OpportunityEditModal from "@/Components/Tenant/Operations/Opportunities/OpportunityEditModal";
import OpportunityDeleteModal from "@/Components/Tenant/Operations/Opportunities/OpportunityDeleteModal";
import CommonAddOpportunityLinkModal from "@/Components/Tenant/Operations/Commons/CommonAddOpportunityLinkModal";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";

export default function OpportunityReport({ dataItems, addLinkBtn = false, showActionBtns = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
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
                route(routeNames.opportunityUnLink, {
                    tenant,
                    base_id: model?.id,
                    opportunity_id: itemId,
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

    console.log('model== ',model);
    

    return (
        <>
            <FormSectionComponent
                title="Opportunity"
                showActionBtns={ showActionBtns }
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new opportunity"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
                addLinkBtnText="Link opportunity"
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Stage")} as="th" />
                            <TableCell data={__("Owner")} as="th" />
                            <TableCell data={__("Amount")} as="th" />
                            <TableCell data={__("Forecast Date")} as="th" />
                            <TableCell data={__("Close Date")} as="th" />
                            <TableCell classPosition="text-center" as="th">
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
                                    <TableCell
                                        data={item?.get_last_stage?.label}
                                    />
                                    <TableCell data={item?.owner_name} />
                                    <TableCell
                                        data={item?.currency_with_amount}
                                    />
                                    <TableCell data={item?.forecast_date} />
                                    <TableCell data={item?.close_date} />

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
                        label="No opportunity found"
                    />
                )}
            </FormSectionComponent>

            {/* Modals */}
            {isModalOpen && (
                <OpportunityCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}
            {isModalOpenForEdit && (
                <OpportunityEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                />
            )}

            {isModalOpenForDelete && (
                <OpportunityDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}
            {isAddLinkModalOpen && (
                <CommonAddOpportunityLinkModal
                    isModalOpen={isAddLinkModalOpen}
                    setIsModalOpen={setIsAddLinkModalOpen}
                    currentActionId={currentActionId}
                />
            )}
        </>
    );
}
