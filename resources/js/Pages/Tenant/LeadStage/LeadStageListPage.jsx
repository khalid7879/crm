import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import {
    IS_ACTIVE,
    ORDER_BY,
    ORDER_TYPE,
    PER_PAGE,
} from "@/Components/Tenant/Filters/filterInputs";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableBodyComponent from "@/Components/Tenant/PageComponent/TableBodyComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableComponent from "@/Components/Tenant/PageComponent/TableComponent";
import TableHeadComponent from "@/Components/Tenant/PageComponent/TableHeadComponent";
import TableTdComponent from "@/Components/Tenant/PageComponent/TableTdComponent";
import TableThComponent from "@/Components/Tenant/PageComponent/TableThComponent";
import TableTrComponent from "@/Components/Tenant/PageComponent/TableTrComponent";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { LeadStageListNavItems } from "@/utils/common/BreadcrumbNavItems";
import { swalAlert, swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useRoute } from "ziggy";

/**
 * @component
 * LeadStageListPage Component
 *
 * @description Displays a grouped and paginated list of lead stages, organized by stage type (e.g., Lead, Opportunity).
 * Provides comprehensive management features including filtering, ordering, status toggling, default/final stage designation,
 * and delete functionality with permission checks.
 *
 * Key Features:
 * - Grouped table view by stage type
 * - Up/Down ordering within each group
 * - Toggle for "Default Stage" and "Final Stage" per group
 * - Active/Inactive status toggle
 * - Soft delete with permission check (is_delete flag)
 * - Resolution time display (days/hours)
 * - Internationalization support
 * - Server-side toast notifications and filter preservation
 *
 * Expected Data Structure:
 * leadStageList is an object where keys are stage types (strings) and values are arrays of stage objects.
 *
 * @returns {JSX.Element} The complete lead stage management page
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function LeadStageListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Stage");

    const {
        tenant,
        routeNames,
        leadStageList = {},
        filterOptions = {},
        toastAlert,
    } = usePage().props;

    /* Destructure pagination-related props (currently unused as grouping may override standard pagination) */
    const {
        links = [],
        total = 0,
        current_page = 1,
        from = 0,
        to = 0,
    } = leadStageList;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        perPage: 10,
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
     * Handles soft deletion of a lead stage with permission check
     * @param {number} leadStageId - ID of the stage
     * @param {number} [isDelete=0] - Permission flag (1 = allowed)
     */
    const handleModelDelete = useCallback(
        (leadStageId, isDelete = 0) => {
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
                        route(routeNames.stagesDelete, {
                            tenant,
                            stage: leadStageId,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Lead stage deleted successfully"),
                            onError: (errors) =>
                                console.error("Delete failed:", errors),
                        }
                    );
                }
            });
        },
        [route, routeNames, tenant, clearErrors, toastAlert, __]
    );

    /**
     * Toggles active status of a lead stage with permission check
     * @param {number} leadStageId - ID of the stage
     * @param {number} [isDelete=0] - Permission flag for status change
     */
    const handleModelStatusChange = useCallback(
        (leadStageId, isDelete = 0) => {
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
                route(routeNames.stagesStatusChange, {
                    tenant,
                    leadStageId,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        console.log("Status updated successfully!"),
                }
            );
        },
        [post, route, routeNames, tenant, toastAlert, __]
    );

    /**
     * Toggles stage attributes (Default or Final) within its group
     * @param {number} id - Stage ID
     * @param {string} attribute - Attribute type ("DEFAULT_STAGE" or "FINAL_STAGE")
     * @param {string} type - Group/type name
     */
    const handleStageTypeStatusChange = useCallback(
        (id, attribute, type) => {
            if (id && type) {
                post(
                    route(routeNames.StageTypeStatusChange, {
                        tenant,
                        id,
                        type,
                        attribute,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            console.log(
                                "Stage attribute updated successfully!"
                            ),
                    }
                );
            }
        },
        [post, route, routeNames, tenant]
    );

    /**
     * Changes the display order of a stage (move up/down)
     * @param {number} id - Stage ID
     * @param {"UPPER"|"DOWN"} type - Direction of order change
     */
    const handleModelOrderChange = useCallback(
        (id, type) => {
            if (id && type) {
                post(
                    route(routeNames.StageOrderChange, {
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

    /* Action configuration for edit/delete */
    const actions = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.stagesEdit,
                params: "stage",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames.stagesEdit, handleModelDelete]
    );

    /* Show server-side toast alerts */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /* Filter form handlers */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.stagesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

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
                navItems={[...LeadStageListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.stages.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.stagesList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Order")} />
                        <TableThComponent label={__("Order value")} />
                        <TableThComponent label={__("Resolution days")} />
                        <TableThComponent label={__("Resolution hours")} />
                        <TableThComponent label={__("Is default")} />
                        <TableThComponent label={__("Is final")} />
                        <TableThComponent label={__("Status")} />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {Object.keys(leadStageList).length > 0 ? (
                            Object.entries(leadStageList).map(
                                ([groupName, items]) => (
                                    <React.Fragment key={groupName}>
                                        {/* Group header */}
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="font-bold bg-base-200 py-3 px-4"
                                            >
                                                {groupName}
                                            </td>
                                        </tr>

                                        {/* Group rows */}
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
                                                    changeOrder={true}
                                                    orderStatus={
                                                        item?.order_status
                                                    }
                                                    upperOrderMethod={() =>
                                                        handleModelOrderChange(
                                                            item.id,
                                                            "UPPER"
                                                        )
                                                    }
                                                    downOrderMethod={() =>
                                                        handleModelOrderChange(
                                                            item.id,
                                                            "DOWN"
                                                        )
                                                    }
                                                />
                                                <TableTdComponent
                                                    label={item.order}
                                                />
                                                <TableTdComponent
                                                    label={item.resolution_days}
                                                />
                                                <TableTdComponent
                                                    label={
                                                        item.resolution_hours
                                                    }
                                                />
                                                <TableTdComponent
                                                    stageAttribute={true}
                                                    isDefault={item?.is_default}
                                                    defaultMethod={() =>
                                                        handleStageTypeStatusChange(
                                                            item.id,
                                                            "DEFAULT_STAGE",
                                                            groupName
                                                        )
                                                    }
                                                />
                                                <TableTdComponent
                                                    stageAttribute={true}
                                                    isFinalStage={
                                                        item?.is_final_stage
                                                    }
                                                    finalStageMethod={() =>
                                                        handleStageTypeStatusChange(
                                                            item.id,
                                                            "FINAL_STAGE",
                                                            groupName
                                                        )
                                                    }
                                                />
                                                <TableTdComponent
                                                    isActive={item?.is_active}
                                                    value={item?.id}
                                                    statusMethod={() =>
                                                        handleModelStatusChange(
                                                            item?.id,
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
