import React, { useEffect, useMemo, useCallback, useState } from "react";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import { TaskListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import MarkAsDoneCheckbox from "@/Components/Tenant/Forms/MarkAsDoneCheckbox";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage, Head } from "@inertiajs/react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import TaskCreateModal from "@/Components/Tenant/Operations/Tasks/TaskCreateModal";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";
import CommonSampleDeleteModal from "@/Components/Tenant/Operations/Commons/CommonSampleDeleteModal";

/**
 * TaskListPage - Main list view for the Task Management module.
 * Displays tasks in a tabular format with filtering, searching, pagination,
 * status updates, editing, dependency-aware deletion, and task creation capabilities.
 *
 *
 * @example
 * return <TaskListPage />
 *
 * @features
 * - Task table (Name, Stage, Progress %, Task type, Priority, Due date, Status)
 * - Filters: per-page, ordering, order direction, active/inactive status
 * - Text search
 * - Progress bar with percentage
 * - "Mark as Done" / Stage change checkbox
 * - Edit & dependency-checked delete actions
 * - CSV / PDF export buttons (placeholder)
 * - Sample data deletion modal
 * - Create new task modal (pre-filled for LEAD relation)
 * - Inertia.js powered server-side rendering & form handling
 * - Toast notifications via swalToast
 *
 * @props {Object} props - Inertia page props
 * @prop {Object} props.tenant                - Current tenant information
 * @prop {Object} props.routeNames            - Object containing all route names
 * @prop {Object} props.taskList              - Paginated task collection with meta (data, links, total, etc.)
 * @prop {Object} props.filterOptions         - Filter values preserved from URL/query string
 * @prop {Object} [props.toastAlert]          - Flash message, delete dependency data, or sample data for toasts/modals
 *
 * @state {boolean} isModalOpenForCreate          - Controls the "Create Task" modal
 * @state {boolean} isModalOpenForDelete          - Controls the delete confirmation modal
 * @state {Array|null} deleteData                 - Dependency data returned before deletion
 * @state {boolean} isModalOpenForSampleDelete    - Controls the sample data deletion modal
 * @state {Array|null} sampleData                 - List of sample records for deletion preview
 *
 * @returns {JSX.Element} Full page wrapped in TenantDashboardLayout with table, filters, pagination, and modals
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TaskListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Tasks");
    const { tenant, routeNames, taskList, filterOptions } = usePage().props;
    const { toastAlert } = usePage().props;
    const [isModalOpenForCreate, setIsModalOpenForCreate] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);

    const [isModalOpenForSampleDelete, setIsModalOpenForSampleDelete] =
        useState(false);
    const [sampleData, setSampleData] = useState([]);

    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = taskList;

    const {
        data,
        setData,
        get,
        post,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions]);
    const filterInputs = useMemo(
        () => [
            PER_PAGE({ __ }),
            ORDER_BY({
                __,
                optValues: ["id", "name", "is_active"],
            }),
            ORDER_TYPE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );

    const handleModelStatusChange = (id) => {
        return false;
        post(
            route(routeNames.dataEmpSizesStatusChange, {
                tenant,
                empSizeId: id,
            }),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.sampleData) {
            setSampleData(toastAlert.sampleData ?? []);
        }
        if (toastAlert && toastAlert?.deleteData) {
            setDeleteData(toastAlert.deleteData ?? []);
        }
        if (toastAlert && toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert?.message]),
            });
        }

        router.reload({ only: [] });
    }, [toastAlert]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.tasksList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames]
    );

    const handleSampleData = () => {
        setIsModalOpenForSampleDelete(true);
        setSampleData(null);
        router.post(
            route(routeNames.handleSampleData, {
                tenant,
                model: "TASK",
                action: "get",
            }),
            {
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const listPageActionButtons = [
        {
            label: "Add new",
            icon: "addPlus",
            color: "btn-success",
            onClick: () => {
                setIsModalOpenForCreate(true);
            },
        },
        {
            label: "Csv export",
            icon: "export",
            color: "btn-warning",
            onClick: () => console.log("Csv export"),
        },
        {
            label: "Pdf export",
            icon: "pdf",
            color: "btn-warning",
            onClick: () => console.log("Pdf export"),
        },
        {
            label: "Delete sample data",
            icon: "delete",
            color: "btn-warning",
            onClick: () => handleSampleData(),
        },
    ];

    const handelDeleteProcess = (id, event) => {
        event.preventDefault();

        setIsModalOpenForDelete(true);
        setDeleteData(null);
        router.post(
            route(routeNames.tasksWiseDependency, {
                tenant,
                resourceId: id,
            }),
            {
                preserveScroll: true,
            }
        );
    };
    const actionRoute = routeNames?.tasksDeleteWithDependency;
    const sampleDeleteRoute = routeNames?.handleSampleData;

    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...TaskListNavItems, { name: "List" }]}
            isShowListPageActionBtns={true}
            listPageActionButtons={listPageActionButtons}
        >
            <TableCardComponent>
                {/*** ------------------------------
                 * Filter Form
                 * ------------------------------ */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.tasksList}
                />
                <TableContainer>
                    {/* head */}
                    <TableHeadComponent>
                        <TableCell width="w-5">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                            />
                        </TableCell>
                        <TableCell data={__("Name")} as="th" />
                        <TableCell data={__("Stage")} />
                        <TableCell
                            as="th"
                            data={__("Progress in percent")}
                            width="15%"
                        />
                        <TableCell as="th" data={__("Task type")} width="10%" />
                        <TableCell as="th" data={__("Priority")} width="10%" />
                        <TableCell as="th" data={__("Due date")} width="15%" />
                        <TableCell as="th" data={__("Status")} width="10%" />
                        <TableCell classPosition="text-center">
                            <IconComponent
                                classList="text-xl text-brandColor"
                                icon="setting3"
                            />
                        </TableCell>
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent key={`task_${index}`}>
                                    <TableCell width="w-5">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                        />
                                    </TableCell>

                                    <TableCell
                                        data={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={
                                            model?.get_colored_category
                                        }
                                        dataAsLink={model?.actions_links?.edit}
                                    />

                                    <TableCell
                                        data={model?.get_last_stage?.name}
                                    />
                                    <TableCell
                                        data={`${model.progress_percent}%`}
                                        progress={model.progress_percent}
                                    />

                                    <TableCell data={model?.get_task_type} />
                                    <TableCell
                                        isDataIcon={true}
                                        dataIconLetter={model?.get_priority}
                                    />
                                    <TableCell data={model.date_due} />
                                    <TableCell>
                                        <MarkAsDoneCheckbox
                                            id={model.id}
                                            progressPercent={
                                                model.progress_percent
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

                                    <TableCell classPosition="text-center">
                                        <div className="flex gap-2 items-center">
                                            <IconComponent
                                                classList="text-sm text-gray-500"
                                                icon="edit"
                                                link={
                                                    model?.actions_links?.edit
                                                }
                                            />
                                            <IconComponent
                                                classList="text-sm text-brandColor"
                                                icon="delete"
                                                callback={(event) =>
                                                    handelDeleteProcess(
                                                        model?.id,
                                                        event
                                                    )
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent
                                colspan={8}
                                label="No tasks found"
                                isTable={true}
                            ></DataNotFoundComponent>
                        )}
                    </TableBodyComponent>
                </TableContainer>
                {/*** ------------------------------
                 * Pagination
                 * ------------------------------ */}
                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                    current_page={current_page}
                />
            </TableCardComponent>

            {/* Reusable Task Modal */}
            {isModalOpenForCreate && (
                <TaskCreateModal
                    isModalOpen={isModalOpenForCreate}
                    setIsModalOpen={setIsModalOpenForCreate}
                    relatedToTypeIsReadOnly={false}
                    relatedToType="LEAD"
                />
            )}

            {/* Task delete Modal */}
            {isModalOpenForDelete && (
                <CommonDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    deleteData={deleteData}
                    actionRoute={actionRoute}
                />
            )}

            {/* Sample delete Modal */}
            {isModalOpenForSampleDelete && (
                <CommonSampleDeleteModal
                    isModalOpen={isModalOpenForSampleDelete}
                    setIsModalOpen={setIsModalOpenForSampleDelete}
                    sampleData={sampleData}
                    actionRoute={sampleDeleteRoute}
                />
            )}
        </TenantDashboardLayout>
    );
}
