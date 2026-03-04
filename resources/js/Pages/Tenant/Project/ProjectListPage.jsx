import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { ProjectListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import ProjectCreateModal from "@/Components/Tenant/Operations/Projects/ProjectCreateModal";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";
import CommonSampleDeleteModal from "@/Components/Tenant/Operations/Commons/CommonSampleDeleteModal";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * @component ProjectListPage
 *
 * @description
 * This is the primary page component responsible for rendering the complete project listing interface
 * within the tenant dashboard. It provides a comprehensive CRUD-like experience for managing projects,
 * including listing, filtering, sorting, pagination, creation, editing, deletion (with dependency checks),
 * status toggling, and sample data management.
 *
 * Key Features:
 * - Responsive data table displaying all projects with pagination
 * - Advanced filtering (items per page, ordering, active status)
 * - Quick action buttons: Add New Project, CSV Export, PDF Export, Delete Sample Data
 * - Inline actions per row: Edit project, Delete project (with dependency verification modal)
 * - Modal-based workflows:
 *   • ProjectCreateModal – for creating a new project
 *   • CommonDeleteModal – shows dependencies before allowing deletion of a specific project
 *   • CommonSampleDeleteModal – handles bulk deletion of sample/demo project data
 * - Toast notifications for success/error feedback from server actions
 * - Breadcrumb navigation integration via TenantDashboardLayout
 * - Internationalization support through useTranslations hook
 *
 * Data Flow:
 * - Uses Inertia.js for server-side rendering and form submissions
 * - Pagination and filter state are preserved across requests
 * - Dependency checks and sample data retrieval are performed via POST requests before opening modals
 *
 * Note:
 * - The table currently contains extra "Tag" columns in the header that appear unused.
 *   These are preserved from the original implementation for future extensibility.
 * - Export functionalities (CSV/PDF) are wired but currently log to console – ready for implementation.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun Hossen
 * @returns {JSX.Element} Fully featured project management list page wrapped in TenantDashboardLayout
 */
export default function ProjectListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Projects");

    /* Page props from Inertia */
    const { tenant, routeNames, dataList, filterOptions, toastAlert } =
        usePage().props;

    /* Destructure paginated data */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = dataList;

    /* ========== State Management ========== */
    const [isModalOpenForCreate, setIsModalOpenForCreate] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);

    const [isModalOpenForSampleDelete, setIsModalOpenForSampleDelete] =
        useState(false);
    const [sampleData, setSampleData] = useState([]);

    /* ========== Form Handling with Inertia ========== */
    const { data, setData, get, post, processing } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        with: "address",
        ...filterOptions,
    });

    /* Sync filterOptions from server into form data on mount/change */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /* ========== Filter Inputs Configuration ========== */
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

    /* ========== Toast Notifications ========== */
    useEffect(() => {
        if (!toastAlert) return;

        if (toastAlert.sampleData) {
            setSampleData(toastAlert.sampleData ?? []);
        }
        if (toastAlert.deleteData) {
            setDeleteData(toastAlert.deleteData ?? []);
        }

        if (toastAlert?.message) {
            swalToast({
                type: toastAlert.type,
                message: __([toastAlert.message]),
            });
        }

        router.reload({ only: [] });
    }, [toastAlert]);

    /* ========== Action Handlers ========== */

    /* Toggle project active/inactive status */
    const handleModelStatusChange = useCallback(
        (id) => {
            post(
                route(routeNames.projectsStatusChange, {
                    tenant,
                    projectId: id,
                }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        console.log("Status updated successfully!"),
                }
            );
        },
        [post, route, routeNames, tenant]
    );

    /* Apply filters and reload data */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.projectsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Handle individual filter field changes */
    const handleFilterChange = useCallback(
        (e) => {
            setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        [setData]
    );

    /* Fetch dependent data before deleting a project */
    const handelDeleteProcess = useCallback(
        (id, event) => {
            event.preventDefault();
            setIsModalOpenForDelete(true);
            setDeleteData(null);

            router.post(
                route(routeNames.projectsWiseDependency, {
                    tenant,
                    resourceId: id,
                }),
                {},
                { preserveScroll: true }
            );
        },
        [route, routeNames, tenant]
    );

    /* Trigger sample data check for deletion */
    const handleSampleData = useCallback(() => {
        setIsModalOpenForSampleDelete(true);
        setSampleData(null);

        router.post(
            route(routeNames.handleSampleData, {
                tenant,
                model: "PROJECT",
                action: "get",
            }),
            {},
            { preserveScroll: true }
        );
    }, [route, routeNames, tenant]);

    /* ========== Page Action Buttons ========== */
    const listPageActionButtons = useMemo(
        () => [
            {
                label: __("Add new"),
                icon: "addPlus",
                color: "btn-success",
                onClick: () => setIsModalOpenForCreate(true),
            },
            {
                label: __("Csv export"),
                icon: "export",
                color: "btn-warning",
                onClick: () => console.log("Csv export"),
            },
            {
                label: __("Pdf export"),
                icon: "pdf",
                color: "btn-warning",
                onClick: () => console.log("Pdf export"),
            },
            {
                label: __("Delete sample data"),
                icon: "delete",
                color: "btn-warning",
                onClick: handleSampleData,
            },
        ],
        [__, handleSampleData]
    );

    /* ========== Route Constants for Modals ========== */
    const actionRoute = routeNames?.projectsDeleteWithDependency;
    const sampleDeleteRoute = routeNames?.handleSampleData;

    /* ========== Render ========== */
    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...ProjectListNavItems, { name: __("List") }]}
            isShowListPageActionBtns={true}
            listPageActionButtons={listPageActionButtons}
        >
            {/* Main Table Card */}
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
                    resetLink={routeNames.projectsList}
                />
                <TableContainer minWidth="1600px">
                    {/* head */}
                    <TableHeadComponent>
                        <TableCell width="5%">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                            />
                        </TableCell>
                        <TableCell data={__("Name")} as="th" width="20%" />
                        <TableCell
                            data={__("Description")}
                            as="th"
                            width="15%"
                        />
                        <TableCell data={__("Owner")} as="th" width="10%" />
                        <TableCell data={__("Stage")} as="th" width="15%" />
                        <TableCell data={__("Tag")} as="th" width="15%" />
                        <TableCell classPosition="text-center" width="10%">
                            <IconComponent
                                classList="text-xl text-brandColor"
                                icon="setting3"
                            />
                        </TableCell>
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent key={`department_${index}`}>
                                    <TableCell width="w-5">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                        />
                                    </TableCell>

                                    <TableCell
                                        data={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                        dataAsLink={model?.actions_links?.edit}
                                    />

                                    <TableCell data={model?.details} />
                                    <TableCell data={model?.owner_name} />
                                    <TableCell
                                        data={model?.get_last_stage?.name}
                                    />
                                    <TableCell data={model?.tag_name} />

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
                                colspan={5}
                                label={__("Data not found")}
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

            {/* Modal: Create New Project */}
            {isModalOpenForCreate && (
                <ProjectCreateModal
                    isModalOpen={isModalOpenForCreate}
                    setIsModalOpen={setIsModalOpenForCreate}
                    relatedToType="LEAD"
                />
            )}

            {/* Modal: Delete Project (with dependency check) */}
            {isModalOpenForDelete && (
                <CommonDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    deleteData={deleteData}
                    actionRoute={actionRoute}
                />
            )}

            {/* Modal: Delete Sample Data */}
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
