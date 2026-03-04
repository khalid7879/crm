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
import MarkAsDoneCheckbox from "@/Components/Tenant/Forms/MarkAsDoneCheckbox";
import TaskCreateModal from "@/Components/Tenant/Operations/Tasks/TaskCreateModal";
import TaskEditModal from "@/Components/Tenant/Operations/Tasks/TaskEditModal";
import TaskDeleteModal from "@/Components/Tenant/Operations/Tasks/TaskDeleteModal";
import TaskHistoryModal from "@/Components/Tenant/Operations/Tasks/TaskHistoryModal";
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
export default function ActivitySectionComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [isModalOpenForTaskHistory, setIsModalOpenForTaskHistory] =
        useState(false);
    const [isModalOpenForEdit, setIsModalOpenForEdit] = useState(false);
    const [currentActionId, setCurrentActionId] = useState("");
    const page = usePage();
    const route = useRoute();
    const { model, routeNames, tenant } = page.props;
    const __ = useTranslations();

    return (
        <section>
            {Object.entries(model.tasks_report).map(
                ([sectionKey, activities], index) => (
                    <FormSectionComponent
                        key={sectionKey}
                        title={
                            sectionKey === "upcoming_activities"
                                ? "Upcoming activities"
                                : "Past activities"
                        }
                        showActionBtns={true}
                        addNewTaskModal={setIsModalOpen}
                        classesParentSection={index != 0 ? "mt-3" : ""}
                    >
                        {activities?.length > 0 ? (
                            <TableContainer>
                                {/* head */}
                                <TableHeadComponent>
                                    <TableCell
                                        as="th"
                                        data={__("Task name")}
                                        width="25%"
                                    />

                                    <TableCell
                                        as="th"
                                        data={__("Stage")}
                                        width="10%"
                                    />
                                    <TableCell
                                        as="th"
                                        data={__("Progress in percent")}
                                        width="15%"
                                    />
                                    <TableCell
                                        as="th"
                                        data={__("Priority")}
                                        width="10%"
                                    />
                                    <TableCell
                                        as="th"
                                        data={__("Due date")}
                                        width="15%"
                                    />
                                    <TableCell
                                        as="th"
                                        data={__("Status")}
                                        width="10%"
                                    />

                                    <TableCell
                                        as="th"
                                        classPosition="text-center"
                                        width="10%"
                                    >
                                        <IconComponent
                                            size="xl"
                                            icon="setting3"
                                        />
                                    </TableCell>
                                </TableHeadComponent>
                                <TableBodyComponent>
                                    {activities.map((task) => (
                                        <TableTrComponent key={task.id}>
                                            <TableCell
                                                data={task?.name}
                                                isDataIcon={true}
                                                dataIconLetter={
                                                    task?.get_colored_category
                                                }
                                                charLimit={30}
                                                dataAsLink={
                                                    task?.actions_links?.edit
                                                }
                                            />

                                            <TableCell
                                                data={
                                                    task?.get_last_stage?.label
                                                }
                                            />

                                            <TableCell
                                                data={`${task.progress_percent}%`}
                                                progress={task.progress_percent}
                                            />
                                            <TableCell
                                                isDataIcon={true}
                                                dataIconLetter={
                                                    task?.get_priority
                                                }
                                            />
                                            <TableCell data={task.date_due} />
                                            <TableCell>
                                                <MarkAsDoneCheckbox
                                                    id={task.id}
                                                    progressPercent={
                                                        task.progress_percent
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
                                                                task.id
                                                            );
                                                            setIsModalOpenForEdit(
                                                                true
                                                            );
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
                                                                task.id
                                                            );
                                                            setIsModalOpenForDelete(
                                                                true
                                                            );
                                                        }}
                                                    />
                                                    <IconComponent
                                                        icon="history"
                                                        size="lg"
                                                        color="info"
                                                        tooltip="History"
                                                        callback={(event) => {
                                                            event.preventDefault();
                                                            setCurrentActionId(
                                                                task.id
                                                            );
                                                            setIsModalOpenForTaskHistory(
                                                                true
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableTrComponent>
                                    ))}
                                </TableBodyComponent>
                            </TableContainer>
                        ) : (
                            <DataNotFoundComponent
                                colspan={10}
                                label="No activity found"
                            ></DataNotFoundComponent>
                        )}
                    </FormSectionComponent>
                )
            )}

            {/* Reusable Task Create Modal */}
            {isModalOpen && (
                <TaskCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    relatedToTypeIsReadOnly={true}
                />
            )}

            {/* Reusable Task Delete Modal */}
            {isModalOpenForDelete === true && (
                <TaskDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    currentActionId={currentActionId}
                />
            )}

            {/* Reusable Task Edit Modal */}
            {isModalOpenForEdit && (
                <TaskEditModal
                    isModalOpen={isModalOpenForEdit}
                    setIsModalOpen={setIsModalOpenForEdit}
                    currentActionId={currentActionId}
                    relatedToTypeIsReadOnly={true}
                    relatedToType="LEAD"
                />
            )}
            {/* Reusable Task Edit Modal */}
            {isModalOpenForTaskHistory && (
                <TaskHistoryModal
                    isModalOpen={isModalOpenForTaskHistory}
                    setIsModalOpen={setIsModalOpenForTaskHistory}
                    currentActionId={currentActionId}
                />
            )}
        </section>
    );
}
