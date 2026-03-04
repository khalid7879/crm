import React, { useEffect, useMemo, useCallback } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
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
import { DesignationListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * @component
 * DataDesignationsListPage Component
 *
 * @description Displays a paginated list of designations (job titles/roles) with filtering, sorting,
 * active/inactive status toggle, edit, and delete functionality. Designed for a multi-tenant application
 * using Inertia.js for server-driven rendering and seamless navigation.
 *
 * Features:
 * - Filter by items per page, ordering (id, name, status), order direction, and active status
 * - Inline status toggle for enabling/disabling designations
 * - Edit and delete actions for each designation
 * - Pagination with Inertia-compatible links
 * - Preservation of filter state across redirects
 * - Internationalization support via useTranslations
 * - Toast notifications for server feedback
 *
 * Expected Props (via Inertia usePage):
 * - dataDesignationsList: { data: array, links: array, total, current_page, per_page, from, to }
 * - filterOptions: preserved filter values
 * - toastAlert: optional server-side toast configuration
 *
 * @returns {JSX.Element} The complete designations listing page
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function DataDesignationsListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Designations");

    const {
        tenant,
        routeNames,
        dataDesignationsList = {},
        filterOptions = {},
        toastAlert,
    } = usePage().props;

    /* Safely destructure paginated data with defaults */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = dataDesignationsList;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /* Sync preserved filter options from server */
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
     * Handles deletion of a designation with confirmation dialog
     * @param {number} designationId - ID of the designation to delete
     */
    const handleModelDelete = useCallback(
        (designationId) => {
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
                        route(routeNames.dataDesignationsDelete, {
                            tenant,
                            data_designation: designationId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Designation deleted successfully"),
                            onError: (errors) =>
                                console.error("Delete failed:", errors),
                        }
                    );
                }
            });
        },
        [route, routeNames, tenant, clearErrors, __]
    );

    /**
     * Toggles the active/inactive status of a designation
     * @param {number} designationId - ID of the designation
     */
    const handleModelStatusChange = useCallback(
        (designationId) => {
            post(
                route(routeNames.dataDesignationsStatusChange, {
                    tenant,
                    dataDesignationId: designationId,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        console.log("Status updated successfully!"),
                }
            );
        },
        [post, route, routeNames, tenant]
    );

    /* Action configuration for row actions (Edit & Delete) */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.dataDesignationsEdit,
                params: "data_designation",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.dataDesignationsEdit, handleModelDelete]
    );

    /* Display server-side toast notifications */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /* Filter form submission handler */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.dataDesignationsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Filter input change handler */
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
                navItems={[...DesignationListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.data-designations.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.dataDesignationsList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Created at")} />
                        <TableThComponent label={__("Updated at")} />
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
                            allModels.map((model) => (
                                <TableTrComponent
                                    key={model.id ?? `designation_${model.id}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
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
                                            handleModelStatusChange(model.id)
                                        }
                                        positionClass="justify-center"
                                    />
                                    <TableTdComponent
                                        action={actions}
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
