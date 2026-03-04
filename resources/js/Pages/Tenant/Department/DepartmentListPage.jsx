import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableComponent from "@/Components/Tenant/PageComponent/TableComponent";
import TableHeadComponent from "@/Components/Tenant/PageComponent/TableHeadComponent";
import TableThComponent from "@/Components/Tenant/PageComponent/TableThComponent";
import TableBodyComponent from "@/Components/Tenant/PageComponent/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/PageComponent/TableTrComponent";
import TableTdComponent from "@/Components/Tenant/PageComponent/TableTdComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import { DepartmentListNavItems } from "@/utils/common/BreadcrumbNavItems";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { router, useForm, usePage, Head } from "@inertiajs/react";
import React, { useEffect, useMemo, useCallback } from "react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * @component
 * DepartmentListPage Component
 *
 * @description
 * Displays a paginated, filterable, and sortable list of departments for the current tenant.
 * Supports:
 * - Searching and filtering by per-page count, order, and active status
 * - Inline status toggle (active/inactive)
 * - Edit and delete actions per department
 * - Toast notifications from Inertia flash messages
 * - Responsive breadcrumb with "Add new" button
 *
 * @returns {JSX.Element} The complete department listing page within the tenant settings layout
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function DepartmentListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Departments");

    /** Extract props passed from Inertia page */
    const { tenant, routeNames, departments, filterOptions, toastAlert } =
        usePage().props;

    /** Destructure pagination and data from departments prop */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = departments;

    /** Form state for filters and search */
    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /** Sync URL query params (filterOptions) into form state on mount/change */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /** Define filter input configuration (memoized to prevent unnecessary re-renders) */
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

    /** Handle department deletion with confirmation dialog */
    const handleModelDelete = useCallback(
        (departmentId) => {
            swalAlert({
                title: __("Confirm Deletion"),
                text: __(
                    "Are you sure you want to delete this resource? This action cannot be undone."
                ),
                confirmButtonText: __("Yes"),
                cancelButtonText: __("Cancel"),
            }).then((result) => {
                if (result.isConfirmed) {
                    clearErrors();
                    router.delete(
                        route(routeNames.departmentsDelete, {
                            tenant,
                            department: departmentId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                // Success handled by Inertia flash/toast
                            },
                            onError: (errors) => {
                                console.error("Delete failed:", errors);
                            },
                        }
                    );
                }
            });
        },
        [__, route, routeNames, tenant, clearErrors]
    );

    /** Toggle department active/inactive status */
    const handleModelStatusChange = useCallback(
        (departmentId) => {
            post(
                route(routeNames.departmentsStatusChange, {
                    tenant,
                    departmentId,
                }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Success toast handled globally via flash
                    },
                }
            );
        },
        [post, route, routeNames, tenant]
    );

    /** Action column configuration (Edit link + Delete handler) */
    const action = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.departmentsEdit,
                params: "department",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.departmentsEdit, handleModelDelete]
    );

    /** Display toast alerts from Inertia flash messages (only once per message) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert, __]);

    /** Submit filter form – triggers GET request with current form data */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.departmentsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /** Update individual filter field in form state */
    const handleFilterChange = useCallback(
        (e) => {
            setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        [setData]
    );

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...DepartmentListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.departments.create"
                iconTitle="Add new"
            />

            <TableCardComponent>
                {/** Filter Section */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.departmentsList}
                />

                {/** Departments Table */}
                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Users")} />
                        <TableThComponent label="Created at" />
                        <TableThComponent label="Updated at" />
                        <TableThComponent
                            label={__("Status")}
                            positionClass="text-center"
                        />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent
                                    key={`department_${model.id ?? index}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />
                                    <TableTdComponent
                                        label={model?.total_user ?? 0}
                                        positionClass="justify-center"
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.create_date}
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.update_diff}
                                    />
                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model?.id)
                                        }
                                        positionClass="justify-center"
                                    />
                                    <TableTdComponent
                                        action={action}
                                        value={model?.id}
                                        positionClass="justify-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent />
                        )}
                    </TableBodyComponent>
                </TableComponent>

                {/** Pagination */}
                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
