import React, { useEffect, useMemo, useCallback } from "react";
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
import { LeadSourceListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * @component
 * LeadSourceListPage Component
 *
 * @description Displays a paginated list of lead sources with filtering, sorting, status toggle,
 * edit, and delete functionality. Built for a multi-tenant application using Inertia.js for
 * server-side rendering and navigation. Supports internationalization and toast notifications.
 *
 * Features:
 * - Filter by items per page, ordering (by id, name, or status), order direction, and active status
 * - Inline active/inactive status toggle
 * - Edit and delete actions per lead source
 * - Pagination with Inertia-aware links
 * - Preservation of filter state across redirects
 * - Server-side toast feedback handling
 *
 * Expected Props (via Inertia usePage):
 * - leadSourceList: { data: array, links: array, total, current_page, per_page, from, to }
 * - filterOptions: object containing preserved filter values
 * - toastAlert: optional server-side toast configuration
 *
 * @returns {JSX.Element} The complete lead source listing page layout
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function LeadSourceListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Source");

    const {
        tenant,
        routeNames,
        leadSourceList = {},
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
    } = leadSourceList;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /* Sync preserved filter options from server redirects */
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
     * Handles deletion of a lead source with confirmation dialog
     * @param {number} leadSourceId - ID of the lead source to delete
     */
    const handleModelDelete = useCallback(
        (leadSourceId) => {
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
                        route(routeNames.leadSourcesDelete, {
                            tenant,
                            lead_source: leadSourceId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Lead source deleted successfully"),
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
     * Toggles the active status of a lead source
     * @param {number} leadSourceId - ID of the lead source
     */
    const handleModelStatusChange = useCallback(
        (leadSourceId) => {
            post(
                route(routeNames.leadSourcesStatusChange, {
                    tenant,
                    leadSourceId,
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

    /* Action configuration for table row actions (Edit & Delete) */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.leadSourcesEdit,
                params: "lead_source",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.leadSourcesEdit, handleModelDelete]
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

    /* Handle filter form submission */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.leadSourcesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Update filter state on input change */
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
                navItems={[...LeadSourceListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.lead-sources.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.leadSourcesList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Created at")} />
                        <TableThComponent label={__("Updated at")} />
                        <TableThComponent label={__("Status")} />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels.length > 0 ? (
                            allModels.map((model) => (
                                <TableTrComponent
                                    key={model.id ?? `lead_source_${model.id}`}
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
                                    />
                                    <TableTdComponent
                                        action={actions}
                                        value={model.id}
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
