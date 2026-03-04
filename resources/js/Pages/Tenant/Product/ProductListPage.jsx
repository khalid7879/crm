import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useCallback } from "react";
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
import { ProductListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * @component ProductListPage
 *
 * @description Displays a paginated list of products with filtering, sorting, status toggle,
 * edit, and delete functionality. Supports internationalization and server-side operations
 * via Inertia.js. Products are shown in a flat table (not grouped) with category information.
 *
 * Features:
 * - Filter by items per page, ordering, and active status
 * - Inline status toggle (active/inactive)
 * - Edit and delete actions for each product
 * - Pagination with Inertia-aware links
 * - Toast notifications for server feedback
 * - Preservation of filter state across redirects
 *
 * Expected Props (from Inertia page props):
 * - products: { data: array, links: array, total, current_page, per_page, from, to }
 * - filterOptions: preserved filter values
 * - toastAlert: optional server-side toast message
 *
 * @returns {JSX.Element} The complete product listing page
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function ProductListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Products");

    const {
        tenant,
        routeNames,
        products = {},
        filterOptions = {},
        toastAlert,
    } = usePage().props;

    /* Safely destructure paginated product data */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = products;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /* Sync any preserved filter options from the server */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /* Memoized filter input definitions */
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
     * Handles product deletion with confirmation dialog
     * @param {number} productId - ID of the product to delete
     */
    const handleModelDelete = useCallback(
        (productId) => {
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
                        route(routeNames.productsDelete, {
                            tenant,
                            product: productId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Product deleted successfully"),
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
     * Toggles the active/inactive status of a product
     * @param {number} productId - ID of the product
     */
    const handleModelStatusChange = useCallback(
        (productId) => {
            post(
                route(routeNames.productsStatusChange, {
                    tenant,
                    product: productId,
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

    /* Action configuration for row-level actions */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.productsEdit,
                params: "product",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.productsEdit, handleModelDelete]
    );

    /* Display server-side toast alerts (e.g., after successful operations) */
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
            get(route(routeNames.productsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Update filter form data on input change */
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
                navItems={[...ProductListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.products.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.productsList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Category")} />
                        <TableThComponent label={__("Price")} />
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
                            allModels.map((model, index) => (
                                <TableTrComponent key={model.id ?? index}>
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />
                                    <TableTdComponent
                                        label={model?.category_name}
                                    />
                                    <TableTdComponent
                                        label={model?.price}
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
