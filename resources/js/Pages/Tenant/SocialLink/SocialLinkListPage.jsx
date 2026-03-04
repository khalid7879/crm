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
import { SocialLinkListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * SocialLinkListPage Component
 *
 * @description Displays a paginated and sortable list of social media links (e.g., Facebook, LinkedIn, Twitter)
 * with custom icons, ordering controls (up/down), active/inactive status toggle, and delete functionality.
 * Designed for tenant-specific settings in a multi-tenant application using Inertia.js.
 *
 * Features:
 * - Filter by items per page, ordering, and active status
 * - Drag-free manual ordering via "UPPER"/"DOWN" actions
 * - Inline status toggle (active/inactive)
 * - Edit and delete actions (delete currently shows placeholder alert)
 * - Displays social platform icon alongside name
 * - Pagination with Inertia-compatible links
 * - Preservation of filter state across redirects
 * - Internationalization support
 * - Toast notifications for server feedback
 *
 * Note: Delete functionality is currently blocked with a placeholder alert.
 * Expected Props (via Inertia usePage):
 * - resourceList: paginated data object or direct array of social link models
 * - filterOptions: preserved filter values
 * - toastAlert: optional server-side toast configuration
 *
 * @returns {JSX.Element} The complete social links management page
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function SocialLinkListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Social links");

    const {
        tenant,
        routeNames,
        resourceList = {},
        filterOptions = {},
        toastAlert,
    } = usePage().props;

    /* Safely handle both paginated object and direct array structures */
    const allModels = Array.isArray(resourceList)
        ? resourceList
        : resourceList.data || [];

    /* Pagination props (fallback if resourceList is array) */
    const {
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = Array.isArray(resourceList) ? {} : resourceList;

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

    /* Memoized filter inputs */
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
     * Placeholder for delete action — currently blocked
     * @param {number} id - Social link ID
     */
    const handleModelDelete = useCallback(
        (id) => {
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
                        route(routeNames.socialLinksUpdate, {
                            tenant,
                            social_link: id,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Resource deleted successfully"),
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
     * Toggles active/inactive status of a social link
     * @param {number} id - Social link ID
     */
    const handleModelStatusChange = useCallback(
        (id) => {
            post(
                route(routeNames.socialLinksStatusChange, {
                    tenant,
                    socialLinkId: id,
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

    /**
     * Changes display order of a social link (move up or down)
     * @param {number} id - Social link ID
     * @param {"UPPER"|"DOWN"} type - Direction of order change
     */
    const handleModelOrderChange = useCallback(
        (id, type) => {
            if (id && type) {
                post(
                    route(routeNames.socialLinksOrderChange, {
                        tenant,
                        id,
                        type,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            console.log("Order updated successfully!"),
                    }
                );
            }
        },
        [post, route, routeNames, tenant]
    );

    /* Action configuration for row actions */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.socialLinksEdit,
                params: "social_link",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.socialLinksEdit, handleModelDelete]
    );

    /* Display server-side toast alerts */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
    }, [toastAlert]);

    /* Filter form submission — fixed incorrect route name */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.socialLinksList, { tenant }), {
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
                navItems={[...SocialLinkListNavItems, { name: "List" }]}
                btnIcon="add"
                // link="tenant.social-links.create" /* Uncomment when create route is ready */
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.socialLinksList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Order")} />
                        <TableThComponent label={__("Status")} />
                        <TableThComponent label={__("Created at")} />
                        <TableThComponent label={__("Updated at")} />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels.length > 0 ? (
                            allModels.map((model) => (
                                <TableTrComponent
                                    key={model.id ?? `social_${model.id}`}
                                >
                                    <TableTdComponent
                                        tdIcon={model?.icon}
                                        label={model?.name}
                                    />
                                    <TableTdComponent
                                        changeOrder={true}
                                        orderStatus={model?.order_status}
                                        upperOrderMethod={() =>
                                            handleModelOrderChange(
                                                model.id,
                                                "UPPER"
                                            )
                                        }
                                        downOrderMethod={() =>
                                            handleModelOrderChange(
                                                model.id,
                                                "DOWN"
                                            )
                                        }
                                    />
                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model.id)
                                        }
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.create_date}
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.update_diff}
                                    />
                                    <TableTdComponent
                                        action={actions}
                                        value={model?.id}
                                        positionClass="justify-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent colspan="6" />
                        )}
                    </TableBodyComponent>
                </TableComponent>

                {/* Only show pagination if resourceList is paginated object */}
                {!Array.isArray(resourceList) && (
                    <PaginationComponent
                        from={from}
                        to={to}
                        total={total}
                        links={links}
                        current_page={current_page}
                    />
                )}
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
