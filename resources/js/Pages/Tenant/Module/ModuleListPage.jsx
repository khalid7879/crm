import React, { useEffect, useMemo, useCallback } from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { ModuleListNavItems } from "@/utils/common/BreadcrumbNavItems";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableComponent from "@/Components/Tenant/PageComponent/TableComponent";
import TableThComponent from "@/Components/Tenant/PageComponent/TableThComponent";
import TableBodyComponent from "@/Components/Tenant/PageComponent/TableBodyComponent";
import TableHeadComponent from "@/Components/Tenant/PageComponent/TableHeadComponent";
import TableTrComponent from "@/Components/Tenant/PageComponent/TableTrComponent";
import TableTdComponent from "@/Components/Tenant/PageComponent/TableTdComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * ModuleListPage
 *
 * Displays a complete list of modules in the tenant settings section.
 * Features a responsive data table with filtering, sorting, pagination,
 * status toggle, edit/delete actions, and letter avatar badges.
 *
 * Includes:
 * - Breadcrumb navigation with "Add" button
 * - Filter form (per page, ordering, status)
 * - Zebra-striped table with pinned headers/columns
 * - Status toggle switch per row
 * - Edit and Delete actions
 * - Confirmation dialog for deletions
 * - Toast notifications for server responses
 * - Empty state handling
 * - Server-side pagination
 *
 * Integrates with Inertia.js for seamless navigation and form handling.
 *
 * @component
 * @returns {JSX.Element} The full module listing page within the tenant settings layout
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ModuleListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Modules");

    /** Props from Inertia page */
    const { tenant, routeNames, modulesList, filterOptions, toastAlert } =
        usePage().props;

    /** Destructure paginated module data */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        from = 0,
        to = 0,
        last_page = 0,
    } = modulesList;

    /** Form handling for filters */
    const { data, setData, post, get, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /** Sync URL filter options with form state on mount/change */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /** Handle module deletion with confirmation dialog */
    const handleModelDelete = useCallback(
        (moduleId) => {
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
                        route(routeNames.modulesDelete, {
                            tenant,
                            module: moduleId,
                        }),
                        { preserveScroll: true }
                    );
                }
            });
        },
        [__, route, routeNames, tenant, clearErrors]
    );

    /** Toggle module active/inactive status */
    const handleModelStatusChange = useCallback(
        (moduleId) => {
            post(route(routeNames.modulesStatusChange, { tenant, moduleId }), {
                preserveScroll: true,
            });
        },
        [post, route, routeNames, tenant]
    );

    /** Define available filter inputs */
    const filterInputs = useMemo(
        () => [
            PER_PAGE({ __ }),
            ORDER_BY({
                __,
                optValues: ["id", "name", "is_active", "created_at"],
            }),
            ORDER_TYPE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );

    /** Action buttons configuration for each row */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.modulesEdit,
                params: "module",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.modulesEdit, handleModelDelete]
    );

    /** Submit filter form */
    const handleFilterSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.modulesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /** Update filter form field */
    const handleFilterChange = useCallback(
        (e) => {
            setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        [setData]
    );

    /** Show toast notifications from server */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __(toastAlert.message),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            {/** Page header with breadcrumb and add button */}
            <Breadcrumb
                title={metaTitle}
                navItems={[...ModuleListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.modules.create"
            />

            {/** Main table card with filters and data */}
            <TableCardComponent>
                {/** Filter section */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleFilterSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.modulesList}
                />

                {/** Data table */}
                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label="Name" />
                        <TableThComponent label="Note" />
                        <TableThComponent label="Created at" />
                        <TableThComponent label="Updated at" />
                        <TableThComponent
                            label="Status"
                            positionClass="text-center"
                        />
                        <TableThComponent
                            label="Action"
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent
                                    key={`model_${model.id ?? index}`}
                                >
                                    {/** Name with letter avatar */}
                                    <TableTdComponent
                                        label={model?.name || "-"}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />

                                    {/** Note */}
                                    <TableTdComponent
                                        label={model?.note || "-"}
                                    />

                                    {/** Created at */}
                                    <TableTdComponent
                                        label={
                                            model?.model_time
                                                ?.create_formatted || "-"
                                        }
                                    />

                                    {/** Updated at (human diff) */}
                                    <TableTdComponent
                                        label={
                                            model?.model_time?.update_diff ||
                                            "-"
                                        }
                                    />

                                    {/** Status toggle */}
                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model?.id)
                                        }
                                        positionClass="justify-center"
                                    />

                                    {/** Actions (Edit / Delete) */}
                                    <TableTdComponent
                                        action={actions}
                                        value={model.id}
                                        positionClass="justify-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent colspan={6} />
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
                    current_page={current_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
