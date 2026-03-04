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
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { EmailSettingListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * EmailSettingListPage
 *
 * Displays a complete, responsive list of email server configurations (SMTP settings) for the tenant.
 *
 * Features:
 * - Breadcrumb navigation with "Add new" button linking to create page
 * - Filter form supporting per-page count, ordering, order direction, and active status
 * - Responsive table with horizontal scrolling on small screens (via TableCardComponent & TableComponent)
 * - Columns: Host, Port, Encryption, Username, Mail From Address, Status (toggle), Actions (Edit/Delete)
 * - Inline status toggle (active/inactive) with Inertia POST request
 * - Delete action with SweetAlert2 confirmation modal and Inertia DELETE request
 * - Server-side pagination with links
 * - Toast notifications for success/error feedback from server
 * - Empty state handling with DataNotFoundComponent
 *
 * All interactions preserve scroll position using Inertia's preserveScroll option.
 *
 * @returns {JSX.Element} The full email settings management list page
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function EmailSettingListPage() {
    /** Route & translation helpers */
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Email setting");

    /** Inertia page props: tenant info, routes, data, filters, and toast messages */
    const { tenant, routeNames, dataList, filterOptions, toastAlert } =
        usePage().props;

    /** Destructure paginated email settings data from server response */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        from = 0,
        to = 0,
        last_page = 0,
    } = dataList;

    /** Form state management for filtering and sorting */
    const { data, setData, get, post, processing } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /** Sync server-provided filter options into form state on change */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions]);

    /** Memoized filter input fields (per page, order by, order type, status) */
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

    /** Show toast notifications from server flash messages */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
    }, [toastAlert]);

    /** Submit filter form - triggers Inertia GET request with current filters */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.emailSettingList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /** Update individual filter input value */
    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    /** Toggle email setting active/inactive status */
    const handleModelStatusChange = (emailSettingId) => {
        post(
            route(routeNames.emailSettingChangeStage, {
                tenant,
                emailSettingId,
            }),
            {},
            { preserveScroll: true }
        );
    };

    /** Confirm and delete email setting with sweetalert confirmation */
    const handleModelDelete = (emailSettingId) => {
        swalAlert({
            title: __("Confirm Deletion"),
            text: __(
                "Are you sure you want to delete this resource? This action cannot be undone."
            ),
            confirmButtonText: __("Yes"),
            cancelButtonText: __("Cancel"),
            icon: "warning",
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route(routeNames.emailSettingDelete, {
                        tenant,
                        email_setting: emailSettingId,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            swalToast({
                                type: "success",
                                message: __("Deleted successfully"),
                            });
                        },
                        onError: (errors) => {
                            console.error("Delete failed:", errors);
                        },
                    }
                );
            }
        });
    };

    /** Action buttons configuration for table rows (Edit & Delete) */
    const action = [
        {
            name: "EDIT",
            link: routeNames.emailSettingEdit,
            params: "email_setting",
        },
        {
            name: "DELETE",
            method: handleModelDelete,
        },
    ];

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            {/** Breadcrumb with title and "Add new" button */}
            <Breadcrumb
                title={metaTitle}
                navItems={[...EmailSettingListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.email-setting.create"
                iconTitle="Add new"
            />

            {/** Main content card with filters, table, and pagination */}
            <TableCardComponent>
                {/** Filter form section */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.emailSettingList}
                />

                {/** Email settings table */}
                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Host")} />
                        <TableThComponent label={__("Port")} />
                        <TableThComponent label={__("Encryption")} />
                        <TableThComponent label={__("Username")} />
                        <TableThComponent label={__("Mail from address")} />
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
                                    key={`email_setting_${model.id}`}
                                >
                                    <TableTdComponent
                                        label={model?.host || "-"}
                                    />
                                    <TableTdComponent
                                        label={model?.port || "-"}
                                    />
                                    <TableTdComponent
                                        label={model?.encryption || "-"}
                                    />
                                    <TableTdComponent
                                        label={model?.user_name || "-"}
                                    />
                                    <TableTdComponent
                                        label={model?.mail_from_address || "-"}
                                    />
                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model.id)
                                        }
                                        positionClass="text-center"
                                    />
                                    <TableTdComponent
                                        action={action}
                                        value={model.id}
                                        positionClass="text-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <TableTrComponent>
                                <TableTdComponent colSpan={7}>
                                    <DataNotFoundComponent />
                                </TableTdComponent>
                            </TableTrComponent>
                        )}
                    </TableBodyComponent>
                </TableComponent>

                {/** Pagination controls */}
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
