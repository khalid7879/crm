import React, { useCallback, useMemo, useEffect, useState } from "react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTaskFormInputs } from "@/hooks/useTaskFormInputs";
import { useTranslations } from "@/hooks/useTranslations";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";
import { swalToast } from "@/utils/toast";
import { useForm, usePage } from "@inertiajs/react";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import WidgetBasicComponent from "@/Components/Tenant/Addons/WidgetBasicComponent";
import { useRoute } from "ziggy";
import axios from "axios";

/**
 * TaskCreateModal Component
 *
 * A reusable modal component for creating new tasks within a tenant’s workspace.
 * It integrates Inertia.js forms, task-specific input mappings, and dynamic
 * related data fetching. Provides support for reset, async lookup, and both
 * normal save and "save & new" actions.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isModalOpen - Whether the modal is currently open
 * @param {Function} props.setIsModalOpen - State setter to toggle modal visibility
 *
 * @example
 * <TaskCreateModal
 *   isModalOpen={isOpen}
 *   setIsModalOpen={setIsOpen}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TaskHistoryModal({
    isModalOpen,
    setIsModalOpen,
    currentActionId,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const {
        tenant,
        routeNames,
        model,
        reportData = {},
        filterOptions = {},
    } = page.props;

    const [loader, setLoader] = useState(true);
    const [allModels, setAllModels] = useState([]);
    const [callReport, setCallReport] = useState(true);
    const [parentStats, setParentStats] = useState([]);
    const [subTasks, setSubTasks] = useState([]);

    const { data, setData, post, get, processing, clearErrors } = useForm({
        perPage: "50",
        startDate: "",
        endDate: "",
        taskId: currentActionId,
    });

    const fetchData = async () => {
        try {
            const response = await axios.get(
                route(routeNames.taskHistoryData, { tenant }),
                {
                    params: data,
                }
            );
            console.log("response==", response?.data);

            if (response?.data?.reportData) {
                setAllModels(response?.data?.reportData);
                setParentStats(response?.data?.historySummary);
                setSubTasks(response?.data?.subTasks);
                setLoader(false);
            }

            setCallReport(false);
        } catch (err) {
            console.error("Error fetching report data:", err);
        }
    };
    useEffect(() => {
        if (callReport) {
            fetchData();
        }
    }, [callReport]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            setLoader(true);
            setAllModels([]);
            fetchData();
        },
        [tenant, routeNames, get]
    );

    const componentMap = useMemo(() => componentMapping(), []);  

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Task history"
            processing={processing}
            size="xl"
            modalType="DELETE"
            showSaveNewBtn={false}
            showSaveBtn={false}
        >
            {/* Stats */}
            <WidgetBasicComponent
                stats={parentStats}
                className="bg-base-100 border border-base-300 rounded-md shadow p-3 text-base-content"
            />
            <TableContainer minWidth="1600px">
                {/* head */}
                <TableHeadComponent>
                    <TableCell as="th" data={__("Task name")} width="10%" />
                    <TableCell as="th" data={__("Stage")} width="10%" />
                    <TableCell as="th" data={__("Category")} width="10%" />
                    <TableCell as="th" data={__("Priority")} width="10%" />
                    <TableCell as="th" data={__("Owner")} width="10%" />
                    <TableCell as="th" data={__("Associates")} width="10%" />
                    <TableCell
                        as="th"
                        data={__("Progress in percent")}
                        width="15%"
                    />
                    <TableCell as="th" data={__("Details")} width="15%" />
                    <TableCell as="th" data={__("Start date")} width="15%" />
                    <TableCell as="th" data={__("Reminder date")} width="5%" />
                </TableHeadComponent>
                <TableBodyComponent>
                    {loader ? (
                        <tr>
                            <td colSpan="10" className="text-center p-4">
                                <LoadingSpinner />
                            </td>
                        </tr>
                    ) : allModels?.length > 0 ? (
                        allModels.map((taskHistory) => (
                            <TableTrComponent key={taskHistory.id}>
                                <TableCell
                                    data={taskHistory?.name}
                                    charLimit={-1}
                                    showTooltip={false}
                                />

                                <TableCell
                                    data={taskHistory?.get_stage?.label}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory?.get_category?.name}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory?.get_priority?.name}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory?.owner?.nickname}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory?.get_associates_name}
                                    charLimit={-1}
                                    showTooltip={false}
                                />

                                <TableCell
                                    data={`${taskHistory.progress_percent}%`}
                                    progress={taskHistory.progress_percent}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory.details}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory.date_start}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                                <TableCell
                                    data={taskHistory.date_reminder}
                                    charLimit={-1}
                                    showTooltip={false}
                                />
                            </TableTrComponent>
                        ))
                    ) : (
                        <DataNotFoundComponent
                            colspan="10"
                            label="No activity found"
                            isTable={true}
                        />
                    )}
                </TableBodyComponent>
            </TableContainer>
        </ModalFormInputsLayout>
    );
}
