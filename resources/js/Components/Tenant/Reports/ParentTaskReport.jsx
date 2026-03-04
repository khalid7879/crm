import React, { useCallback, useMemo, useState, useEffect } from "react";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import MarkAsDoneCheckbox from "@/Components/Tenant/Forms/MarkAsDoneCheckbox";
import IconComponent from "@/Components/IconComponent";
import { swalToast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";

export default function ParentTaskReport({
    dataItems,
    addLinkBtn = false,
    showActionBtns = false,
}) {
    const __ = useTranslations();
    const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const page = usePage();
    const { model, routeNames, tenant, dataRelatedTypes } = page.props;

    return (
        <>
            <FormSectionComponent
                title="Parent Tasks"
                showActionBtns={showActionBtns}
                addNewTaskModal={setIsModalOpen}
                classesParentSection="mt-3"
                iconTitle="Add new parent task"
                addLinkModal={setIsAddLinkModalOpen}
                addLinkBtn={addLinkBtn}
            >
                {dataItems?.length > 0 ? (
                    <TableContainer>
                        {/* Table Head */}
                        <TableHeadComponent>
                            <TableCell data={__("Task name")} as="th" />
                            <TableCell data={__("Stage")} as="th" />
                            <TableCell
                                data={__("Progress in percent")}
                                as="th"
                            />
                            <TableCell data={__("Priority")} as="th" />
                            <TableCell data={__("Due date")} as="th" />
                            <TableCell data={__("Status")} as="th" />
                        </TableHeadComponent>

                        {/* Table Rows */}
                        <TableBodyComponent>
                            {dataItems.map((item, index) => (
                                <TableTrComponent key={`row_${index}`}>
                                    <TableCell
                                        data={item?.name}
                                        isDataIcon={true}
                                        dataIconLetter={
                                            item?.get_colored_category
                                        }
                                        charLimit={30}
                                        dataAsLink={item?.actions_links?.edit}
                                    />

                                    <TableCell
                                        data={item?.get_last_stage?.label}
                                    />
                                    <TableCell
                                        data={`${item.progress_percent}%`}
                                        progress={item.progress_percent}
                                    />
                                    <TableCell
                                        isDataIcon={true}
                                        data={item?.get_priority?.name}
                                        dataIconLetter={
                                            item?.get_colored_category
                                        }
                                    />
                                    <TableCell data={item.date_due} />
                                    <TableCell>
                                        <MarkAsDoneCheckbox
                                            id={item.id}
                                            progressPercent={
                                                item.progress_percent
                                            }
                                            onToggle={(params) => {
                                                router.post(
                                                    route(
                                                        routeNames.tasksChangeStage,
                                                        tenant
                                                    ),
                                                    params.data,
                                                    {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    }
                                                );
                                            }}
                                        />
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
        </>
    );
}
