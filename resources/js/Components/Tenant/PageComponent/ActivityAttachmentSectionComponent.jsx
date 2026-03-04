import React, { useState } from "react";
import { useRoute } from "ziggy";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { router, usePage } from "@inertiajs/react";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";
import AttachmentCreateModal from "@/Components/Tenant/Operations/Attachments/AttachmentCreateModal";
import AttachmentDeleteModal from "@/Components/Tenant/Operations/Attachments/AttachmentDeleteModal";
import AttachmentEditModal from "@/Components/Tenant/Operations/Attachments/AttachmentEditModal";

import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";

/**
 * ActivitySectionComponent
 *
 * Displays tenant task activities, divided into sections such as upcoming and past activities.
 * Provides functionality to:
 * - View tasks in a structured table layout
 * - Mark tasks as complete/incomplete via `MarkAsDoneCheckbox`
 * - Open a modal for creating new tasks
 *
 * Data Source:
 * - Uses `model.tasks_report` from Inertia `page.props`
 * - Each `tasks_report` section (e.g., `upcoming_activities`, `past_activities`) is displayed in its own `FormSectionComponent`
 *
 * Features:
 * - Task table with columns for: name, stage, progress, priority, due date, status, and actions
 * - Tooltips and icons for better UX
 * - Inertia-powered `handelMarkAsDone` function to toggle task completion state
 * - Reusable `TaskCreateModal` for adding new tasks
 *
 * @component
 * @example
 * <ActivitySectionComponent />
 *
 * @returns {JSX.Element} The rendered activity section with task tables and modal
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ActivityAttachmentSectionComponent({ type }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const page = usePage();
    const route = useRoute();
    const { model, routeNames, tenant } = page.props;
    const __ = useTranslations();

    return (
        <section>
            <FormSectionComponent
                key="attachment-section"
                title="Attachment list"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                iconTitle="Add new attachment"
            >
                <TableContainer>
                    {/* Table Head */}
                    <TableHeadComponent>
                        <TableCell
                            as="th"
                            data={__("Title")}
                            width="30%"
                        />
                        <TableCell as="th" data={__("Attachment")} width="20%" />
                        <TableCell as="th" data={__("Note")} width="20%" />
                        <TableCell as="th" data={__("Created at")} width="15%" />
                        <TableCell
                            as="th"
                            classPosition="text-center"
                            width="10%"
                        >
                            <IconComponent size="xl" icon="setting3" />
                        </TableCell>
                    </TableHeadComponent>

                    {/* Table Body */}
                    <TableBodyComponent>
                        {Array.isArray(model.attachment_report) &&
                        model.attachment_report.length > 0 ? (
                            model.attachment_report.map((attachment) => (
                                <TableTrComponent key={attachment.id}>
                                    <TableCell
                                        data={attachment?.title}
                                        isDataIcon={true}
                                        dataIconLetter={
                                            attachment?.get_colored_category
                                        }
                                        charLimit={30}
                                    />
                                    <TableCell>
                                        <a
                                            href={attachment?.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {attachment?.icon ? (
                                                <IconComponent
                                                    icon={attachment.icon}
                                                    size="xl"
                                                    color="red"
                                                />
                                            ) : (
                                                <img
                                                    src={attachment?.file_url}
                                                    alt={
                                                        attachment?.alt_text ||
                                                        "Attachment preview"
                                                    }
                                                    width="50"
                                                    height="50"
                                                    className="rounded-md border hover:opacity-80 transition"
                                                />
                                            )}
                                        </a>
                                    </TableCell>

                                    <TableCell data={attachment?.details} />

                                    <TableCell
                                        data={
                                            attachment?.model_time
                                                ?.create_date_only
                                        }
                                    />
                                    <TableCell>
                                        <div className="flex gap-3 items-center">
                                            <IconComponent
                                                icon="edit"
                                                size="lg"
                                                color="gray5"
                                                tooltip="Edit"
                                                callback={(event) => {
                                                    event.preventDefault();
                                                    setCurrentActionId(
                                                        attachment.id
                                                    );
                                                    setIsModalOpenForEdit(true);
                                                }}
                                            />
                                            <IconComponent
                                                icon="delete"
                                                size="lg"
                                                color="brand"
                                                tooltip="Delete"
                                                callback={(event) => {
                                                    event.preventDefault();
                                                    setCurrentActionId(
                                                        attachment.id
                                                    );
                                                    setIsModalOpenForDelete(
                                                        true
                                                    );
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                </TableTrComponent>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>
                                    <DataNotFoundComponent label="No activity found" />
                                </td>
                            </tr>
                        )}
                    </TableBodyComponent>
                </TableContainer>
            </FormSectionComponent>

            {/* Reusable Note Create Modal */}
            {isModalOpen && (
                <AttachmentCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    type={type}
                />
            )}

            {/* Reusable Note Delete Modal */}
            {isModalOpenForDelete === true && (
                <AttachmentDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}

            {/* Reusable Note Edit Modal */}
            {isModalOpenForEdit && (
                <AttachmentEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                    type={type}
                />
            )}
        </section>
    );
}
