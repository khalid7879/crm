import React, { useEffect, useMemo, useCallback } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { LeadRatingListNavItems } from "@/utils/common/BreadcrumbNavItems";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableComponent from "@/Components/Tenant/PageComponent/TableComponent";
import TableThComponent from "@/Components/Tenant/PageComponent/TableThComponent";
import CommonTdComponent from "@/Components/Tenant/PageComponent/CommonTdComponent";
import TableBodyComponent from "@/Components/Tenant/PageComponent/TableBodyComponent";
import TableHeadComponent from "@/Components/Tenant/PageComponent/TableHeadComponent";
import TableTrComponent from "@/Components/Tenant/PageComponent/TableTrComponent";
import TableTdComponent from "@/Components/Tenant/PageComponent/TableTdComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
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
 * LeadRatingListPage Component
 *
 * @description Displays a paginated list of lead ratings (e.g., Hot, Warm, Cold) with filtering, sorting,
 * active/inactive status toggle, edit, and delete functionality. Designed for a multi-tenant CRM system
 * using Inertia.js for server-side rendering and seamless navigation.
 *
 * Features:
 * - Filter by items per page, ordering (name, status, created_at), order direction, and active status
 * - Inline status toggle to enable/disable ratings
 * - Edit and delete actions for each rating
 * - Dedicated column to display the rating value (numeric/visual)
 * - Pagination with Inertia-compatible links
 * - Preservation of filter state across redirects
 * - Internationalization support via useTranslations
 * - Toast notifications for server feedback
 *
 * Expected Props (via Inertia usePage):
 * - leadRatingsList: { data: array, links: array, total, current_page, per_page, from, to, last_page }
 * - filterOptions: preserved filter values
 * - toastAlert: optional server-side toast configuration
 *
 * @returns {JSX.Element} The complete lead rating listing page
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function LeadRatingListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Rating");

    const {
        tenant,
        routeNames,
        leadRatingsList = {},
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
        last_page = 0,
    } = leadRatingsList;

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
                optValues: ["name", "is_active", "created_at"],
            }),
            ORDER_TYPE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );

    /**
     * Handles deletion of a lead rating with confirmation dialog
     * @param {number} ratingId - ID of the lead rating to delete
     */
    const handleModelDelete = useCallback(
        (ratingId) => {
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
                        route(routeNames.leadRatingsDelete, {
                            tenant,
                            lead_rating: ratingId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Lead rating deleted successfully"),
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
     * Toggles the active/inactive status of a lead rating
     * @param {number} ratingId - ID of the lead rating
     */
    const handleModelStatusChange = useCallback(
        (ratingId) => {
            post(
                route(routeNames.leadRatingsStatusChange, {
                    tenant,
                    id: ratingId,
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
                link: routeNames.leadRatingsEdit,
                params: "lead_rating",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.leadRatingsEdit, handleModelDelete]
    );

    /* Filter form submission handler */
    const handleFilterSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.leadRatingsList, { tenant }), {
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

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...LeadRatingListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.lead-ratings.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleFilterSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.leadRatingsList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent
                            label={__("Rating")}
                            positionClass="text-center"
                        />
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
                                    key={model.id ?? `leadRating_${model.id}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />
                                    <CommonTdComponent
                                        positionClass="justify-center"
                                        label={model?.rating}
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
                    last_page={last_page}
                    current_page={current_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
