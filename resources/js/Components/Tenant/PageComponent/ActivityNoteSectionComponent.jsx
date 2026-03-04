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
import NoteCreateModal from "@/Components/Tenant/Operations/Notes/NoteCreateModal";
import NoteEditModal from "@/Components/Tenant/Operations/Notes/NoteEditModal";
import NoteDeleteModal from "@/Components/Tenant/Operations/Notes/NoteDeleteModal";
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
export default function ActivityNoteSectionComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const page = usePage();
    const route = useRoute();
    const { model, routeNames, tenant } = page.props;
    const __ = useTranslations();

    console.log('notes report==',model);
    

    return (
        <section>
            <FormSectionComponent
                key="note-section"
                title="Note list"
                showActionBtns={true}
                addNewTaskModal={setIsModalOpen}
                iconTitle="Add new note"
            >
                <TableContainer>
                    {/* Table Head */}
                    <TableHeadComponent>
                        <TableCell as="th" data={__("Note name")} width="30%" />
                        <TableCell as="th" data={__("Details")} width="40%" />
                        <TableCell as="th" data={__("Date time")} width="15%" />
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
                        {Array.isArray(model.note_report) &&
                        model.note_report.length > 0 ? (
                            model.note_report.map((note) => (
                                <TableTrComponent key={note.id}>
                                    <TableCell
                                        data={note?.title}
                                        isDataIcon={true}
                                        dataIconLetter={
                                            note?.get_colored_category
                                        }
                                        charLimit={30}
                                    />
                                    <TableCell data={note?.details} />
                                    <TableCell data={note?.date_reminder} />
                                    <TableCell>
                                        <div className="flex gap-3 items-center">
                                            <IconComponent
                                                icon="edit"
                                                size="lg"
                                                color="gray5"
                                                tooltip="Edit"
                                                callback={(event) => {
                                                    event.preventDefault();
                                                    setCurrentActionId(note.id);
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
                                                    setCurrentActionId(note.id);
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
                <NoteCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}

            {/* Reusable Note Delete Modal */}
            {isModalOpenForDelete === true && (
                <NoteDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}

            {/* Reusable Note Edit Modal */}
            {isModalOpenForEdit && (
                <NoteEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                    relatedToType="LEAD"
                />
            )}
        </section>
    );
}
