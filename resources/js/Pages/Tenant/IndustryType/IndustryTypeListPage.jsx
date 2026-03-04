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
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import { IndustryTypeListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
 * @component IndustryTypeListPage
 *
 * @description
 * Displays a grouped list of industry types (categories) in a table format with filtering,
 * sorting, pagination, status toggle, edit, and delete actions.
 *
 * Features:
 * - Grouped display by category/type (e.g., parent groups)
 * - Filtering by per-page count, order by, order type, and active status
 * - Inline status toggle (active/inactive)
 * - Edit and soft-delete actions with permission checks
 * - Toast notifications for success/errors and access denial
 * - Internationalization support via useTranslations hook
 * - Inertia.js integration for server-side navigation and form handling
 *
 * Data Structure Expected:
 * industryTypeList is an object where keys are group names (strings) and values are arrays of industry type objects.
 *
 * @returns {JSX.Element} The complete industry type listing page layout
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function IndustryTypeListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Category");

    const {
        tenant,
        routeNames,
        industryTypeList = {},
        filterOptions = {},
        toastAlert,
    } = usePage().props;

    /* Destructure pagination-related props with safe defaults */
    const {
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = industryTypeList;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /* Sync filter options from server (e.g., preserved filters after redirect) */
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
     * Handles deletion of an industry type with permission check
     * @param {number} industryTypeId - ID of the industry type to delete
     * @param {number} [isDelete=0] - Permission flag (1 = allowed, 0 = denied)
     */
    const handleIndustryTypeDelete = (industryTypeId, isDelete = 0) => {
        if (isDelete === 0) {
            swalToast({
                ...toastAlert,
                message: __(
                    "Access denied: You are not allowed to delete this data."
                ),
            });
            return;
        }

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
                    route(routeNames.industryTypesDelete, {
                        tenant,
                        industryType: industryTypeId,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            // Optional: could trigger a toast here if needed
                            console.log("Industry type deleted successfully");
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
     * Toggles the active status of an industry type with permission check
     * @param {number} industryTypeId - ID of the industry type
     * @param {number} [isDelete=0] - Permission flag (misused here as permission for status change)
     */
    const handleModelStatusChange = (industryTypeId, isDelete = 0) => {
        if (isDelete === 0) {
            swalToast({
                ...toastAlert,
                message: __(
                    "Access denied: You are not allowed to status change this data."
                ),
            });
            return;
        }

        post(
            route(routeNames.industryTypesStatusChange, {
                tenant,
                industryTypeId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => console.log("Status updated successfully!"),
            }
        );
    };

    /* Action configuration for table row actions (Edit & Delete) */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.industryTypesEdit,
                params: "industryType",
            },
            {
                name: "DELETE",
                method: handleIndustryTypeDelete,
            },
        ],
        [routeNames.industryTypesEdit, handleIndustryTypeDelete]
    );

    /* Show toast alerts from server (e.g., success messages after redirect) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /* Submit filter form */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.industryTypesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /* Update filter data on input change */
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
                navItems={[...IndustryTypeListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.industryTypes.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.industryTypesList}
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
                        {Object.keys(industryTypeList).length > 0 ? (
                            Object.entries(industryTypeList).map(
                                ([groupName, items]) => (
                                    <React.Fragment key={groupName}>
                                        {/* Group header row */}
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="font-bold bg-base-200 py-3 px-4"
                                            >
                                                {groupName}
                                            </td>
                                        </tr>

                                        {/* Group items */}
                                        {items.map((item, idx) => (
                                            <TableTrComponent
                                                key={`${groupName}-${
                                                    item.id ?? idx
                                                }`}
                                            >
                                                <TableTdComponent
                                                    label={item.name}
                                                    isDataIcon={true}
                                                    dataIconLetter={
                                                        item?.first_letter
                                                    }
                                                />
                                                <TableTdComponent
                                                    label={
                                                        item?.model_time
                                                            ?.create_date
                                                    }
                                                />
                                                <TableTdComponent
                                                    label={
                                                        item?.model_time
                                                            ?.update_diff
                                                    }
                                                />
                                                <TableTdComponent
                                                    isActive={item?.is_active}
                                                    value={item?.id}
                                                    statusMethod={() =>
                                                        handleModelStatusChange(
                                                            item.id,
                                                            item?.is_delete
                                                        )
                                                    }
                                                />
                                                <TableTdComponent
                                                    action={actions}
                                                    value={item?.id}
                                                    isDelete={item?.is_delete}
                                                    positionClass="justify-center"
                                                />
                                            </TableTrComponent>
                                        ))}
                                    </React.Fragment>
                                )
                            )
                        ) : (
                            <DataNotFoundComponent />
                        )}
                    </TableBodyComponent>
                </TableComponent>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
