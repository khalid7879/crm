import React, { useEffect, useMemo, useCallback } from "react";
import { router, useForm, usePage, Head } from "@inertiajs/react";
import { useRoute } from "ziggy";
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
import { RoleListNavItems } from "@/utils/common/BreadcrumbNavItems";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * RoleListPage
 *
 * @description
 *   Renders a list of roles for the tenant settings page.
 *   - Displays a breadcrumb navigation and filter form.
 *   - Shows a table with role details, actions (edit, delete, assign permissions), status toggle, and user count.
 *   - Handles pagination, filtering, deletion confirmation, and status changes via Inertia.js.
 *   - Supports translations and toast notifications.
 *
 * @param {Object} props - Component props from Inertia.js page.
 * @param {Object} props.tenant - Current tenant information.
 * @param {Object} props.routeNames - Named routes for navigation.
 * @param {Object} props.rolesList - Paginated list of roles with meta data.
 * @param {Object} props.filterOptions - Initial filter values from server.
 * @param {Object} props.toastAlert - Toast notification data if present.
 *
 * @returns {JSX.Element} The rendered role list page.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function RoleListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Roles");

    const { tenant, routeNames, rolesList, filterOptions, toastAlert } =
        usePage().props;

    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = rolesList;

    const { data, setData, get, post, processing, errors, clearErrors } =
        useForm({
            perPage: 10,
            textSearch: "",
            orderBy: "id",
            orderType: "desc",
            isActive: "",
            ...filterOptions,
        });

    /* Sync form data with server-provided filter options */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /* Memoized filter input configuration */
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

    /**
     * Deletes a role after user confirmation
     * @param {number|string} id - Role ID to delete
     */
    const handleModelDelete = (id) => {
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
                    route(routeNames.rolesDelete, { tenant, role: id }),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            /* Success handled via server toast */
                        },
                        onError: (errors) => {
                            console.error("Delete failed:", errors);
                        },
                    }
                );
            }
        });
    };

    /**
     * Toggles the active/inactive status of a role
     * @param {number|string} id - Role ID to toggle
     */
    const handleModelStatusChange = (id) => {
        post(
            route(routeNames.rolesStatusChange, { tenant, roleId: id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    /* Success handled via server toast */
                },
            }
        );
    };

    /**
     * Navigates to the permission assignment page for a role
     * @param {number|string} roleId - Role ID
     */
    const handleAssignPermission = (roleId) => {
        router.get(
            route(routeNames.permissionAssign, { tenant, role: roleId })
        );
    };

    /* Reusable action buttons configuration */
    const action = [
        {
            name: "EDIT",
            link: routeNames.rolesEdit,
            params: "role",
        },
        {
            name: "DELETE",
            method: handleModelDelete,
        },
    ];

    /* Show server-sent toast alert once */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /* Form submission handler for filters */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.rolesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Handle individual filter input changes */
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
                navItems={[...RoleListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.roles.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.rolesList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent
                            label={__("Assign permission")}
                            positionClass="text-center"
                        />
                        <TableThComponent label="Users" />

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
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent
                                    key={`role_${model.id}_${index}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />
                                    <TableTdComponent
                                        action={[
                                            {
                                                name: "COMMON",
                                                method: handleAssignPermission,
                                                icon: "assign",
                                                title: "Assign",
                                            },
                                        ]}
                                        value={model?.id}
                                        positionClass="justify-center"
                                    />
                                    <TableTdComponent
                                        label={model?.users?.length}
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
                                        positionClass="text-center"
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

                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    current_page={current_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
